import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, serieChart, dataTable, compareBars } from '../lib/components.mjs';
import { num, pct } from '../lib/format.mjs';

export default function () {
  const R = data.beroepsgroep.reeksen;
  const ww = R.werkweek.reeksen;

  const body = `
<section>
  <div class="grid c4">
    ${tile({ waarde: num(w('beroepsgroep','praktijkhouders_2023')),
      label:'praktijkhouders in 2023. In 2017 waren het er nog ' + num(w('beroepsgroep','praktijkhouders_piek')) + '.',
      bron:'Nivel beroepenregistraties' })}
    ${tile({ waarde: num(w('beroepsgroep','hidha_2023')),
      label:'huisartsen in dienst en vaste waarnemers in 2023 — de sterkst groeiende groep',
      bron:'Nivel beroepenregistraties' })}
    ${tile({ waarde: num(w('beroepsgroep','praktijken_2024')),
      label:'huisartsenpraktijken op 1 januari 2024. Tien jaar eerder waren het er ruim tweehonderd meer.',
      bron:'Nivel beroepenregistraties' })}
    ${tile({ waarde: num(w('beroepsgroep','sph_actief_2025')),
      label:'actieve deelnemers bij het pensioenfonds voor huisartsen in 2025',
      bron:'SPH jaarverslag 2025' })}
  </div>
</section>

<section>
  <h2>Het praktijkhouderschap krimpt, de rest groeit</h2>
  <p class="sub">Het aantal praktijkhouders piekte in 2017 en daalt sindsdien licht. In dezelfde periode groeide
  de groep huisartsen in dienst en vaste waarnemers sterk. Het totale aantal werkzame huisartsen nam toe;
  de verdeling over functies verschoof.</p>
  ${panel(serieChart(R.functies, { fmt: num, hoogte: 320, yNul: true }))}
  ${callout(`Deze verschuiving is precies wat de NZa als verklaring noemt voor de gedaalde arbeidskosten van de
  praktijkhouder in de tariefonderbouwing: er zijn gemiddeld minder praktijkhouders per praktijk, en meer
  huisartsen in loondienst of waarneming. <a href="/praktijkkosten/">Wat dat met de kosten deed</a>.`)}
</section>

<section>
  <h2>Meer huisartsen, minder praktijken</h2>
  <p class="sub">Het aantal werkzame huisartsen groeide met ongeveer een kwart, terwijl het aantal praktijken
  licht kromp. Praktijken zijn dus groter geworden — in personeel én in patiënten.</p>
  ${panel(serieChart(R.totaal, { fmt: num, hoogte: 300, yNul: true }))}
</section>

<section>
  <h2>De solopraktijk is bijna verdwenen</h2>
  <p class="sub">In 2012 werkte bijna een kwart van de huisartsen solo; in 2024 nog zes procent. Twee derde
  werkt nu in een groepspraktijk.</p>
  ${panel(serieChart(R.praktijkvorm, { fmt: v => num(v,0) + '%', hoogte: 300, yNul: true }))}
</section>

<section>
  <h2>Deelnemers van het pensioenfonds</h2>
  <p class="sub">Het pensioenfonds voor huisartsen telt alle huisartsen die pensioen opbouwen, ongeacht functie.
  Dat maakt het een onafhankelijke tweede meting naast de beroepenregistratie.</p>
  ${panel(serieChart(R.sph, { fmt: num, hoogte: 300, yNul: true }))}
</section>

<section>
  <h2>Wie werkt hoeveel uur?</h2>
  <p class="sub">Alle functies zijn meer gaan werken, maar de praktijkhouder werkt structureel het meest —
  en het verschil met de andere functies is tussen 2013 en 2024 nauwelijks kleiner geworden.</p>
  ${panel(compareBars({
    items: ww.map((r, i) => ({ label: r.naam, waarde: r.waarden[2], serie: i + 1,
      toelichting: `2013: ${num(r.waarden[0],1)} uur · 2018: ${num(r.waarden[1],1)} uur` })),
    fmt: v => num(v,1), eenheid:' u', caption:'Gewerkte uren per week in 2024, met de eerdere metingen in de toelichting.'
  }))}
  ${panel(serieChart(R.werkweek, { fmt: v => num(v,1), hoogte: 280 }))}
  <p class="small" style="margin-top:12px">De werkweek van de praktijkhouder is de noemer onder het uurbedrag
  op de <a href="/arbeidskosten/">pagina over arbeidskosten</a>.</p>
</section>`;

  return { pad:'/beroepsgroep/', html: pagina({
    pad:'/beroepsgroep/', titel:'De beroepsgroep', eyebrow:'Aantallen, functies en arbeidsduur',
    h1:'Wie levert de huisartsenzorg, en met hoeveel zijn ze?',
    omschrijving:'Praktijkhouders, huisartsen in dienst, waarnemers en praktijken tussen 2012 en 2025, met de gewerkte uren per functie.',
    lede:`Het aantal huisartsen groeit, het aantal praktijkhouders niet. Deze pagina brengt de
      beroepenregistratie van het Nivel en de jaarverslagen van het pensioenfonds bij elkaar.`,
    body })};
}
