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

console.log(`Gebouwd: ${n} pagina's in ${OUT}/`);
