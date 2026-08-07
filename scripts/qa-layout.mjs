#!/usr/bin/env node
/* ===========================================================================
   Layoutcontrole over alle pagina's, breedtes en thema's.

   Draaien:  npm run build && npm run qa

   Ontwikkelgereedschap: heeft Playwright nodig, de gewone build niet. Playwright
   staat bewust niet in package.json: dan zou elke productiebuild hem ophalen.
   Installeer hem los met  npm i --no-save playwright  en zet CHROMIUM_PAD als de
   browser ergens anders staat dan waar Playwright hem verwacht.

   Wat het controleert:
     - horizontale overloop van het document;
     - elementen die buiten het venster steken;
     - een onbedoeld gat tussen de paginakop en de eerste sectie;
     - fouten in de console.

   Twee dingen die géén fout zijn en waar een naïeve controle op struikelt:
   tabellen in .tablescroll mogen breder zijn dan het venster (die scrollen
   bewust), en een breedte van 100.00% in een style-attribuut is geen zichtbaar
   percentage.
   =========================================================================== */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PADEN = ['/', '/rondleiding/', '/huisarts-zijn/', '/arbeidskosten/', '/uren/', '/uurtarief/', '/modelwissel/', '/beroepsgroep/',
               '/praktijkhouderschap/', '/inkomen/', '/werkdruk/', '/praktijkkosten/', '/tarieven/',
               '/omzet/', '/nac/', '/bronnen/', '/over/'];
const MATEN = [[390, 'mobiel'], [768, 'tablet'], [1280, 'desktop'], [1600, 'breed']];
const POORT = 8799;

const TYPEN = { '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml',
                '.png':'image/png', '.json':'application/json' };

const server = createServer(async (q, s) => {
  let u = q.url.split('?')[0];
  if (u.endsWith('/')) u += 'index.html';
  if (!extname(u)) u += '.html';
  try {
    const d = await readFile(join('dist', u));
    s.writeHead(200, { 'content-type': TYPEN[extname(u)] ?? 'text/html; charset=utf-8' });
    s.end(d);
  } catch { s.writeHead(404); s.end('404'); }
});

const problemen = [];

async function main() {
  const { chromium } = await import('playwright');
  await new Promise(r => server.listen(POORT, r));
  const browser = await chromium.launch(
    process.env.CHROMIUM_PAD ? { executablePath: process.env.CHROMIUM_PAD } : {});

  for (const [breedte, naam] of MATEN) {
    for (const thema of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: breedte, height: 900 }, colorScheme: thema });
      const pg = await ctx.newPage();
      const fouten = [];
      pg.on('console', m => { if (m.type() === 'error') fouten.push(m.text()); });
      pg.on('pageerror', e => fouten.push(String(e)));

      for (const pad of PADEN) {
        await pg.goto(`http://localhost:${POORT}${pad}`, { waitUntil: 'networkidle' });
        const gevonden = await pg.evaluate(() => {
          const uit = [];
          if (document.documentElement.scrollWidth > window.innerWidth + 1)
            uit.push(`horizontale overloop: ${document.documentElement.scrollWidth} > ${window.innerWidth}`);

          for (const el of document.querySelectorAll(
              'h1,h2,.contrast,.keten,.meetlat,.ev,.begrippen,.tablescroll,figure,.panel')) {
            if (el.closest('.tablescroll') && !el.classList.contains('tablescroll')) continue;
            const b = el.getBoundingClientRect();
            if (b.right > window.innerWidth + 2 || b.left < -2)
              uit.push(`${el.tagName.toLowerCase()}.${el.className || ''} steekt uit (${Math.round(b.left)}-${Math.round(b.right)})`);
          }

          /* Een gat onder de paginakop betekent meestal dat een grid-element op
             een verkeerde rij is beland. Zo ontstond bij de inhoudsopgave een
             leeg vlak van ruim vierhonderd pixels. */
          const kop = document.querySelector('.page-head');
          const eerste = document.querySelector('.kolom section, main section');
          if (kop && eerste) {
            const gat = eerste.getBoundingClientRect().top - kop.getBoundingClientRect().bottom;
            if (gat > 140) uit.push(`gat van ${Math.round(gat)}px tussen de kop en de eerste sectie`);
          }
          return uit;
        });
        gevonden.forEach(x => problemen.push(`${naam}/${thema} ${pad}: ${x}`));
        fouten.forEach(x => problemen.push(`${naam}/${thema} ${pad}: consolefout ${x}`));
        fouten.length = 0;
      }
      await ctx.close();
    }
  }

  await browser.close();
  server.close();

  if (problemen.length) {
    console.error(`\n${problemen.length} probleem(en) gevonden:`);
    for (const x of problemen.slice(0, 40)) console.error('  ' + x);
    process.exit(1);
  }
  console.log(`Layout schoon: ${PADEN.length} pagina's, ${MATEN.length} breedtes, 2 thema's.`);
}

main().catch(e => { console.error(e); server.close(); process.exit(1); });
