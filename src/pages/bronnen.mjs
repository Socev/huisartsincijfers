import { pagina } from '../lib/layout.mjs';
import { bronnen, data, alleParameters } from '../lib/data.mjs';
import { panel, table, callout } from '../lib/components.mjs';
import { num, pct, eur, esc, datum } from '../lib/format.mjs';
import { afgeleideKerngetallen, snapshotDatum, reeks } from '../lib/metrics.mjs';
import { gebruiktOp } from '../lib/gebruik.mjs';

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

  /* Elke parameter is een blok in plaats van een tabelrij. Op breed scherm
     leest het als een tabel, op mobiel als een kaart, en in beide gevallen kan
     JavaScript hem tonen of verbergen zonder de opmaak te slopen. Zonder
     JavaScript staat gewoon alles er. */
  const parBlok = q => {
    const paden = gebruiktOp(q.bestand, q.sleutel);
    const zoek = [q.label, q.sleutel, q.bestand, q.vindplaats, q.status,
                  q.bronObj?.uitgever, q.bronObj?.titel].filter(Boolean).join(' ').toLowerCase();
    return `<div class="par" data-status="${esc(q.status)}" data-bestand="${esc(q.bestand)}"
      data-zoek="${esc(zoek)}">
      <div class="p-l"><b>${esc(q.label)}</b><code>${esc(q.bestand)}.${esc(q.sleutel)}</code></div>
      <div class="p-w num">${toon(q)}</div>
      <div class="p-b">${q.bronObj?.url
          ? `<a href="${esc(q.bronObj.url)}" rel="noopener">${esc(q.bronObj.uitgever)}</a>`
          : esc(q.bronObj?.uitgever ?? q.bron)}${q.vindplaats ? ` — ${esc(q.vindplaats)}` : ''}
        ${paden.length ? `<span class="p-op">Gebruikt op ${paden.map(x =>
          `<a href="${esc(x.pad)}">${esc(x.titel)}</a>`).join(', ')}</span>` : ''}</div>
      <div class="p-s"><span class="badge ${esc(q.status)}">${esc(q.status)}</span></div>
    </div>`;
  };

  const secties = Object.entries(perBestand).map(([bestand, ps]) => `
    <details class="parsectie" data-bestand="${esc(bestand)}" open>
      <summary>${esc(data[bestand]._titel ?? bestand)} <i>${ps.length}</i></summary>
      <div class="parlijst">
        <div class="par kop" aria-hidden="true">
          <div class="p-l">Parameter</div><div class="p-w">Waarde</div>
          <div class="p-b">Bron en vindplaats</div><div class="p-s">Status</div>
        </div>
        ${ps.map(parBlok).join('')}
      </div>
    </details>`).join('');

  const bestanden = Object.keys(data).sort().map(b =>
    `<li><a href="/data/${b}.json"><code>${b}.json</code></a> — ${esc(data[b]._titel ?? '')}</li>`).join('');

  const body = `
<section>
  <h2>Gebruikte bronnen</h2>
  ${panel(bronTabel)}
</section>

<section id="parameters">
  <h2>Alle parameters</h2>
  <p class="sub">Elk getal dat ergens op deze site staat, komt hiervandaan. Drie statussen:
  <span class="badge">definitief</span> staat letterlijk in de bron,
  <span class="badge afgeleid">afgeleid</span> is door ons berekend uit bronnen met de rekenstap erbij, en
  <span class="badge schatting">schatting</span> berust op extrapolatie.</p>
  <div class="filterbalk" id="filters" hidden>
    <label class="zoekveld">
      <span class="vk">Zoek</span>
      <input type="search" id="zoek" placeholder="Zoek op parameter, bron, uitgever of vindplaats"
             autocomplete="off" spellcheck="false">
    </label>
    <div class="chips" role="group" aria-label="Filter op status">
      <button type="button" data-status="alle" aria-pressed="true">Alle</button>
      <button type="button" data-status="definitief" aria-pressed="false">Definitief</button>
      <button type="button" data-status="afgeleid" aria-pressed="false">Afgeleid</button>
      <button type="button" data-status="schatting" aria-pressed="false">Schatting</button>
    </div>
    <p class="telling" id="telling" aria-live="polite"></p>
  </div>
  ${secties}
  <p class="small" id="niets" hidden>Geen parameter gevonden. Probeer een ander woord, of
  <button type="button" class="linkbtn" id="wissen">wis het filter</button>.</p>
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
