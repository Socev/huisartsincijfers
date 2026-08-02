import { pagina } from '../lib/layout.mjs';
import { bronnen, data, alleParameters } from '../lib/data.mjs';
import { panel, table, callout } from '../lib/components.mjs';
import { num, pct, eur, esc, datum } from '../lib/format.mjs';

const toon = p => {
  const v = p.waarde;
  if (typeof v !== 'number') return esc(String(v));
  if (p.eenheid === 'aandeel') return pct(v, 2);
  if (p.eenheid === 'euro' || String(p.eenheid).startsWith('euro')) return eur(v, v % 1 ? 2 : 0);
  if (String(p.eenheid).includes('uur')) return num(v, v % 1 ? 1 : 0) + ' u';
  return num(v, v % 1 ? 2 : 0);
};

export default function () {
  const params = alleParameters();
  const perBestand = {};
  for (const p of params) (perBestand[p.bestand] ??= []).push(p);

  const bronTabel = table({
    cols:[{label:'Bron'},{label:'Uitgever'},{label:'Datum'},{label:'Soort'}],
    rows: Object.entries(bronnen).map(([id, b]) => [
      b.url ? `<a href="${esc(b.url)}" rel="noopener">${esc(b.titel)}</a>` : esc(b.titel),
      esc(b.uitgever), esc(b.datum), esc(b.soort)
    ])
  });

  const secties = Object.entries(perBestand).map(([bestand, ps]) => `
    <h3>${esc(data[bestand]._titel ?? bestand)}</h3>
    ${panel(table({
      cols:[{label:'Parameter'},{label:'Waarde',r:true},{label:'Bron en vindplaats'},{label:'Status'}],
      rows: ps.map(p => [
        esc(p.label),
        toon(p),
        (p.bronObj?.url ? `<a href="${esc(p.bronObj.url)}" rel="noopener">${esc(p.bronObj.uitgever)}</a>` : esc(p.bronObj?.uitgever ?? p.bron))
          + (p.vindplaats ? ` — ${esc(p.vindplaats)}` : ''),
        `<span class="badge ${esc(p.status)}">${esc(p.status)}</span>`
      ])
    }))}`).join('');

  const bestanden = Object.keys(data).sort().map(b =>
    `<li><a href="/data/${b}.json"><code>${b}.json</code></a> — ${esc(data[b]._titel ?? '')}</li>`).join('');

  const body = `
<section>
  <h2>Gebruikte bronnen</h2>
  ${panel(bronTabel)}
</section>

<section>
  <h2>Alle parameters</h2>
  <p class="sub">Elk getal dat ergens op deze site staat, komt hiervandaan. Drie statussen:
  <span class="badge">definitief</span> staat letterlijk in de bron,
  <span class="badge afgeleid">afgeleid</span> is door ons berekend uit bronnen met de rekenstap erbij, en
  <span class="badge schatting">schatting</span> berust op extrapolatie.</p>
  ${secties}
</section>

<section id="datalaag">
  <h2>Datalaag downloaden</h2>
  <p class="sub">De volledige datalaag staat als JSON op deze site. Gebruik hem gerust — met bronvermelding, en
  controleer de status van elk cijfer voordat u ermee rekent.</p>
  ${panel(`<ul class="clean" style="line-height:2">${bestanden}
    <li><a href="/data/bronnen.json"><code>bronnen.json</code></a> — het bronregister</li></ul>`)}
  ${callout(`De volledige wijzigingshistorie van elk cijfer staat openbaar op
  <a href="https://github.com/Socev/huisartsincijfers" rel="noopener">GitHub</a>. Wordt een getal aangepast, dan is
  te zien wanneer, door wie en waarom.`)}
</section>`;

  return { pad:'/bronnen/', html: pagina({
    pad:'/bronnen/', titel:'Bronnen en parameters', eyebrow:'Verantwoording',
    h1:'Waar elk cijfer vandaan komt',
    omschrijving:'Het volledige bronregister en elke parameter die op deze site wordt gebruikt, met vindplaats en status.',
    lede:`Deze pagina wordt automatisch opgebouwd uit de datalaag. Staat een getal op de site, dan staat het hier
      met zijn bron. Verandert er iets in de data, dan verandert deze pagina mee.`,
    body })};
}
