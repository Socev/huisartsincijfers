/* ===========================================================================
   Bouwt dist/ uit src/. Geen afhankelijkheden, geen framework: node build.mjs.
   Elke pagina in src/pages/ exporteert een default-functie die HTML teruggeeft.
   =========================================================================== */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';

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

/* pagina's */
const paginas = readdirSync('src/pages').filter(f => f.endsWith('.mjs') && !f.startsWith('_')).sort();
let n = 0;
for (const bestand of paginas) {
  const mod = await import('./' + join('src/pages', bestand));
  const { pad, html } = await mod.default();
  schrijf(pad === '/' ? 'index.html' : pad.replace(/^\/|\/$/g, '') + '/index.html', html);
  n++;
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

console.log(`Gebouwd: ${n} pagina's in ${OUT}/`);
