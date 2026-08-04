import { pagina } from '../lib/layout.mjs';
import { bronnen, data, alleParameters } from '../lib/data.mjs';
import { panel, table, callout } from '../lib/components.mjs';
import { num, pct, eur, esc, datum } from '../lib/format.mjs';
import { afgeleideKerngetallen, snapshotDatum, reeks } from '../lib/metrics.mjs';

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
  const CM_REEKSEN = Object.values(data.cijfermeester?.reeksen ?? {});
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

<section id="afgeleid">
  <h2>Afgeleide kerngetallen</h2>
  <p class="sub">Deze getallen staan niet als parameter in de datalaag: ze worden bij elke build berekend uit
  de grondslagen hierboven. De rekenstap staat erbij, zodat ook het rekenwerk zelf te controleren is.
  Een afleiding met een geschatte invoer heet hier <span class="badge schatting">afgeleid, bevat schatting</span> —
  een verhouding is nooit steviger dan haar noemer.</p>
  ${panel(table({
    cols:[{label:'Grootheid'},{label:'Waarde',r:true},{label:'Rekenstap'},{label:'Status'}],
    rows: afgeleideKerngetallen().map(k => [
      esc(k.label),
      k.eenheid === 'euro' ? eur(k.waarde)
        : k.eenheid === 'uur/week' ? num(k.waarde, 1) + ' u'
        : num(k.waarde, k.waarde % 1 ? (k.waarde < 10 ? 2 : 1) : 0),
      esc(k.rekenstap),
      `<span class="badge ${k.status.includes('schatting') ? 'schatting' : 'afgeleid'}">${esc(k.status)}</span>`
    ])
  }))}
</section>

<section id="cijfermeester">
  <h2>De Cijfer-Meester</h2>
  <p class="sub">Een deel van de reeksen op deze site komt uit de Cijfer-Meester, een zorgcijferdatabank waarin
  elke waarde met bron, peiljaar en status is vastgelegd. De site leest die databank niet live uit maar werkt met
  een momentopname, zodat wat u hier ziet een bevroren en citeerbare stand is.</p>
  ${panel(table({
    cols:[{label:'Reeks'},{label:'Jaren'},{label:'Bron'}],
    rows: CM_REEKSEN.map(r => [esc(r.indicator), `${r.jaren[0]}–${r.jaren[r.jaren.length-1]}`,
      esc(`${r.organisatie} — ${r.bron}`)])
  }))}
  <p class="bron" style="margin-top:12px">Momentopname van ${datum(snapshotDatum())}.</p>
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
