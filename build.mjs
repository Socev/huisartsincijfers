/* ===========================================================================
   Bouwt dist/ uit src/. Geen afhankelijkheden, geen framework: node build.mjs.
   Elke pagina in src/pages/ exporteert een default-functie die HTML teruggeeft.
   =========================================================================== */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const schrijf = (pad, inhoud) => {
  const f = join(OUT, pad);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, inhoud);
};

/* statische bestanden */
cpSync('src/styles', join(OUT, 'styles'), { recursive: true });
cpSync('src/data',   join(OUT, 'data'),   { recursive: true });
for (const f of ['favicon.svg', 'logo.svg', 'logo-mark.svg'])
  cpSync(join('src/assets', f), join(OUT, f));
for (const f of readdirSync('src/assets').filter(f => f.endsWith('.js')))
  cpSync(join('src/assets', f), join(OUT, f));
/* Deelkaarten. Worden apart gerenderd met npm run og en meegecommit, zodat de
   build zelf geen browser nodig heeft. */
cpSync('src/assets/og', join(OUT, 'og'), { recursive: true });

/* pagina's */
const paginas = readdirSync('src/pages').filter(f => f.endsWith('.mjs') && !f.startsWith('_')).sort();
const zonderKaart = [];
let n = 0;
for (const bestand of paginas) {
  const mod = await import('./' + join('src/pages', bestand));
  const { pad, html } = await mod.default();
  schrijf(pad === '/' ? 'index.html' : pad.replace(/^\/|\/$/g, '') + '/index.html', html);
  /* Een nieuwe pagina zonder deelkaart valt anders pas op zodra iemand hem
     deelt en er een leeg vlak verschijnt. */
  const kaart = (pad === '/' ? 'index' : pad.replace(/^\/|\/$/g, '').replace(/\//g, '-')) + '.png';
  if (!existsSync(join('src/assets/og', kaart))) zonderKaart.push(`${pad} (verwacht og/${kaart})`);
  n++;
}
/* ---------------------------------------------------------------------------
   Versheid van de deelkaarten. De kaart toont eyebrow, kop en omschrijving van
   het moment waarop hij gerenderd is; wie daarna de kop wijzigt zonder npm run
   og te draaien, deelt een kaart die iets anders beweert dan de pagina. Het
   manifest bevat per pagina een vingerafdruk van die drie velden.
   --------------------------------------------------------------------------- */
const verouderd = [];
try {
  const manifest = JSON.parse(readFileSync('src/assets/og/manifest.json', 'utf8'));
  for (const bestand of paginas) {
    const mod = await import('./' + join('src/pages', bestand));
    const { pad, html } = await mod.default();
    const kop     = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] ?? '';
    const eyebrow = (html.match(/<p class="eyebrow">([\s\S]*?)<\/p>/) || [])[1] ?? 'Bekostiging van de huisartsenzorg';
    const oms     = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? '';
    const sl = (pad === '/' ? 'index' : pad.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
    const hash = createHash('sha1')
      .update([eyebrow, kop, oms].map(t => t.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).join('\u0001'))
      .digest('hex').slice(0, 12);
    if (manifest[sl] && manifest[sl] !== hash) verouderd.push(pad);
  }
} catch { /* geen manifest: de ontbreekt-controle hieronder vangt nieuwe pagina's al */ }
if (verouderd.length) {
  console.error('\nDeelkaart is verouderd (kop of omschrijving gewijzigd) voor:');
  for (const x of verouderd) console.error('  ' + x);
  console.error('\nDraai npm run og en commit de PNG en het manifest mee.');
  process.exit(1);
}

if (zonderKaart.length) {
  console.error('\nDeelkaart ontbreekt voor:');
  for (const x of zonderKaart) console.error('  ' + x);
  console.error('\nDraai npm run og en commit de PNG mee.');
  process.exit(1);
}

/* 404 */
const { default: nietGevonden } = await import('./src/pages/_404.mjs').catch(() => ({ default: null }));
if (nietGevonden) schrijf('404.html', (await nietGevonden()).html);

/* robots + sitemap */
schrijf('robots.txt', `User-agent: *\nAllow: /\nSitemap: https://huisartsincijfers.nl/sitemap.xml\n`);
const { ALLE_PADEN } = await import('./src/lib/layout.mjs');
schrijf('sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ALLE_PADEN.map(pad => `  <url><loc>https://huisartsincijfers.nl${pad}</loc></url>`).join('\n') +
  `\n</urlset>\n`);

/* ---------------------------------------------------------------------------
   Controle op onmogelijke percentages.

   De datalaag kent twee soorten: aandelen (0,744) en percentages (66,0). Wie er
   pct() overheen haalt terwijl het al procenten waren, krijgt 6.600% en ziet dat
   niet als hij de pagina niet toevallig opent. Deze controle leest de gebouwde
   HTML terug en faalt op elk percentage boven de drempel.

   De drempel staat op 300%: echte mutaties boven de honderd procent bestaan
   (behandelkosten stegen met 275%), maar drie keer over is in deze data geen
   plausibele uitkomst meer.
   --------------------------------------------------------------------------- */
const DREMPEL = 300;
const verdacht = [];
const loopHtml = (map) => {
  for (const naam of readdirSync(map, { withFileTypes: true })) {
    const pad = join(map, naam.name);
    if (naam.isDirectory()) loopHtml(pad);
    else if (naam.name.endsWith('.html')) {
      /* Eerst de opmaak eruit: een breedte van 100.00% in een style-attribuut is
         geen getal dat de lezer ziet. Alleen zichtbare tekst telt. */
      const tekst = readFileSync(pad, 'utf8')
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]+>/g, ' ');
      /* Nederlandse notatie: punt is duizendscheiding, komma is decimaalteken. */
      for (const m of tekst.matchAll(/(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d+))?\s*%/g)) {
        const waarde = Number(m[1].replace(/\./g, '') + (m[2] ? '.' + m[2] : ''));
        if (waarde > DREMPEL) verdacht.push(`${pad}: ${m[0]}`);
      }
    }
  }
};
loopHtml(OUT);
if (verdacht.length) {
  console.error(`\nOnmogelijke percentages gevonden (boven ${DREMPEL}%):`);
  for (const v of [...new Set(verdacht)].slice(0, 20)) console.error('  ' + v);
  console.error('\nWaarschijnlijk is pct() toegepast op een reeks die al in procenten staat.');
  process.exit(1);
}

/* ---------------------------------------------------------------------------
   Verboden synoniemen. Een nac is geen salaris, uitkering of uitbetaling; die
   woorden in de buurt van "nac" zijn vrijwel altijd een redactionele fout —
   behalve in de ontkenning ("geen salaris"), die juist de uitleg is.
   --------------------------------------------------------------------------- */
const synoniemFouten = [];
const loopSynoniemen = (map) => {
  for (const naam of readdirSync(map, { withFileTypes: true })) {
    const pad = join(map, naam.name);
    if (naam.isDirectory()) loopSynoniemen(pad);
    else if (naam.name.endsWith('.html')) {
      const tekst = readFileSync(pad, 'utf8')
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      for (const m of tekst.matchAll(/\bnac[^.!?]{0,60}?\b(salaris|uitkering|uitbetaling)\b|\b(salaris|uitkering|uitbetaling)\b[^.!?]{0,60}?\bnac\b/gi)) {
        const frag = m[0];
        if (/geen\s+(salaris|uitkering|uitbetaling)/i.test(frag)) continue;
        synoniemFouten.push(`${pad}: …${frag}…`);
      }
    }
  }
};
loopSynoniemen(OUT);
if (synoniemFouten.length) {
  console.error('\nVerboden nac-synoniem gevonden (nac is geen salaris/uitkering/uitbetaling):');
  for (const v of [...new Set(synoniemFouten)].slice(0, 10)) console.error('  ' + v);
  process.exit(1);
}

console.log(`Gebouwd: ${n} pagina's in ${OUT}/`);
