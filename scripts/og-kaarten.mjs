#!/usr/bin/env node
/* ===========================================================================
   Rendert de deelkaarten (Open Graph) voor elke pagina naar src/assets/og/.

   Draaien:  npm run og

   Dit script is ontwikkelgereedschap en heeft Playwright nodig; de gewone build
   niet. De PNG's worden meegecommit, net als de Cijfer-Meester-snapshot, zodat
   `node build.mjs` afhankelijkheidsvrij blijft en op elke machine werkt. Wie een
   kop verandert, draait dit opnieuw — de build controleert of dat is gebeurd.

   Waarom PNG en geen SVG: sociale platforms renderen SVG niet betrouwbaar als
   og:image. Dit is de enige plek op de site waar een bitmap nodig is.
   =========================================================================== */
import { readdirSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const UIT = 'src/assets/og';
const BREED = 1200, HOOG = 630;

/** Slug uit een pad: '/' wordt index, '/uren/' wordt uren. */
export const slug = pad => pad === '/' ? 'index' : pad.replace(/^\/|\/$/g, '').replace(/\//g, '-');

/* De kaart in de huisstijl: rustig vlak, één accentlijn, de claim groot. Geen
   gradients of iconen — een deelkaart die schreeuwt past niet bij een site die
   het van betrouwbaarheid moet hebben. */
function kaart({ eyebrow, kop, sub }) {
  const lengte = kop.length;
  const grootte = lengte > 92 ? 50 : lengte > 68 ? 58 : lengte > 44 ? 68 : 78;
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:${BREED}px;height:${HOOG}px;background:#ffffff;color:#141413;
    font:16px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
    -webkit-font-smoothing:antialiased;display:flex;flex-direction:column;
    padding:64px 72px;position:relative;overflow:hidden}
  .balk{position:absolute;left:0;top:0;width:100%;height:10px;background:#1c4f8f}
  .merk{display:flex;align-items:center;gap:12px;font-size:22px;font-weight:700;letter-spacing:-.02em}
  .merk i{font-style:normal;color:#7c7a73;font-weight:400}
  .merk svg{display:block}
  .eyebrow{margin-top:auto;font-size:19px;letter-spacing:.10em;text-transform:uppercase;color:#7c7a73}
  h1{font-size:${grootte}px;line-height:1.1;letter-spacing:-.03em;margin:18px 0 0;
    font-weight:700;max-width:19ch;text-wrap:balance;font-variant-numeric:tabular-nums}
  .sub{margin-top:22px;font-size:23px;line-height:1.45;color:#52514e;max-width:44ch}
  .voet{margin-top:auto;padding-top:26px;border-top:1px solid #e3e1da;
    display:flex;justify-content:space-between;font-size:18px;color:#7c7a73}
</style></head><body>
  <div class="balk"></div>
  <div class="merk">
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1"  y="14" width="4" height="9"  rx="1" fill="#141413"/>
      <rect x="7"  y="10" width="4" height="13" rx="1" fill="#141413"/>
      <rect x="13" y="6"  width="4" height="17" rx="1" fill="#141413"/>
      <rect x="19" y="11" width="4" height="12" rx="1" fill="#1c4f8f"/>
    </svg>
    huisartsincijfers<i>.nl</i>
  </div>
  <p class="eyebrow">${eyebrow}</p>
  <h1>${kop}</h1>
  ${sub ? `<p class="sub">${sub}</p>` : ''}
  <div class="voet"><span>Elk cijfer herleidbaar tot de bron</span><span>huisartsincijfers.nl</span></div>
</body></html>`;
}

const kort = (t, max) => {
  const schoon = String(t).replace(/\s+/g, ' ').trim();
  if (schoon.length <= max) return schoon;
  const knip = schoon.slice(0, max);
  return knip.slice(0, knip.lastIndexOf(' ')) + '…';
};

async function main() {
  const { chromium } = await import('playwright');
  mkdirSync(UIT, { recursive: true });

  const paginas = readdirSync('src/pages').filter(f => f.endsWith('.mjs') && !f.startsWith('_')).sort();
  const browser = await chromium.launch(
    process.env.CHROMIUM_PAD ? { executablePath: process.env.CHROMIUM_PAD } : {});
  const ctx = await browser.newContext({ viewport: { width: BREED, height: HOOG }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();

  let n = 0;
  const manifest = {};
  for (const bestand of paginas) {
    const mod = await import('../' + join('src/pages', bestand));
    const { pad, html } = await mod.default();

    /* De kop en de eyebrow uit de gebouwde pagina halen, zodat de kaart nooit
       iets anders beweert dan de pagina zelf. */
    const kop     = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] ?? '';
    const eyebrow = (html.match(/<p class="eyebrow">([\s\S]*?)<\/p>/) || [])[1] ?? 'Bekostiging van de huisartsenzorg';
    const oms     = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? '';

    await pg.setContent(kaart({
      eyebrow: kort(eyebrow.replace(/<[^>]+>/g, ''), 60),
      kop:     kort(kop.replace(/<[^>]+>/g, ''), 110),
      sub:     kort(oms, 150)
    }), { waitUntil: 'load' });

    await pg.screenshot({ path: join(UIT, slug(pad) + '.png') });
    /* Vingerafdruk van wat er op de kaart staat, zodat de build kan zien of
       een latere kopwijziging de kaart heeft verouderd. */
    manifest[slug(pad)] = createHash('sha1')
      .update([eyebrow, kop, oms].map(t => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).join('\u0001'))
      .digest('hex').slice(0, 12);
    n++;
  }
  writeFileSync(join(UIT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');

  await browser.close();
  console.log(`Deelkaarten gerenderd: ${n} in ${UIT}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
