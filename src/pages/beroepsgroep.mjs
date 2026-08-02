import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, serieChart, dataTable, compareBars , anwNoot } from '../lib/components.mjs';
import { num, pct } from '../lib/format.mjs';

export default function () {
  const R = data.beroepsgroep.reeksen, T = data.beroepsgroep.tabellen;
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
  <h2>Loondienst of waarneming? Het is vooral waarneming</h2>
  <p class="sub">De Nivel-reeks telt hidha's en vaste waarnemers in één categorie, waardoor niet te zien is welke
  van de twee groeit. Het Praktijkkostenonderzoek splitst ze wél. Omgerekend naar landelijk niveau blijkt de
  groei bijna helemaal uit waarneming te komen, niet uit loondienst.</p>
  ${panel(dataTable(T.hidha_split, [null, num, num, v=>num(v,2), v=>num(v,2), v=>pct(v,0)]))}
  ${panel(compareBars({
    items:[
      { label:'Huisarts in dienst bij een huisarts', waarde:0.11, serie:1 },
      { label:'Incidenteel waarnemer', waarde:0.58, serie:3 },
      { label:'Vaste waarnemer', waarde:0.69, serie:2 }
    ], fmt:v=>pct(v,0), caption:'Groei van de landelijke inzet tussen 2015 en 2022, in fte.'
  }))}
  ${callout(`De hidha-inzet groeide met ${pct(w('beroepsgroep','hidha_groei'),0)}; de inzet van vaste waarnemers
  met ${pct(w('beroepsgroep','waarnemer_groei'),0)}. Wie zegt dat huisartsen massaal voor loondienst kiezen,
  zegt dus iets anders dan de cijfers. De verschuiving gaat naar waarneming — een vorm zonder werkgeversband
  en zonder praktijkverantwoordelijkheid.`)}

  <h3>De sprong van 2019 op 2020</h3>
  <p class="sub">In de grafiek hierboven springt de categorie hidha's en vaste waarnemers met ruim vijftienhonderd
  personen omhoog. Tegelijk daalt de categorie wisselende waarnemers met ruim zevenhonderd, terwijl het totaal
  maar met ruim vijfhonderd toeneemt. Ongeveer de helft van de sprong is dus herindeling tussen twee categorieën,
  geen instroom.</p>
  ${panel(dataTable(T.herindeling, [null, num, num, v => (v>0?'+':'') + num(v)]))}

  <h3>Het pensioenfonds telt ze wél apart</h3>
  <p class="sub">De jaarverslagen van het pensioenfonds voor huisartsen splitsen het deelnemersbestand uit naar
  type. Figuur 6 telt de directeur-grootaandeelhouders mee bij de huisartsen in dienstverband; figuur 7 splitst
  ze apart. Dat onderscheid is wezenlijk: een dga bezit een praktijk en is geen werknemer. Hieronder staan ze
  daarom los.</p>
  ${panel(dataTable(T.sph_typen, [null, num, num, num, num, num, v=>pct(v,1)]))}
  ${panel(serieChart(R.sph_typen, { fmt: num, hoogte: 320, yNul: true }))}
  ${callout(`Drie bewegingen tegelijk. De vrijgevestigden dalen van ${num(6476)} naar
  ${num(w('beroepsgroep','sph_vrijgevestigd_2024'))}. De waarnemers stijgen van ${num(4836)} naar
  ${num(w('beroepsgroep','sph_waarnemend_2024'))} — en zijn daarmee inmiddels de grootste groep werkende
  huisartsen. De echte huisartsen in dienstverband groeien van ${num(848)} naar
  ${num(w('beroepsgroep','sph_hidha_2024'))}: reëel, maar bescheiden naast de waarneming.`)}
  <p class="small">Dit bevestigt onafhankelijk wat het Praktijkkostenonderzoek liet zien: de verschuiving gaat
  naar waarneming, niet naar loondienst. De ${num(w('beroepsgroep','sph_hidha_2024'))} hidha's van het
  pensioenfonds liggen bovendien dicht bij de ${num(w('beroepsgroep','hidha_fte_2022'))} fte die uit het
  kostprijsonderzoek volgt — twee bronnen die elkaar hier wél naderen.</p>

  <h3>Hoeveel praktijkhouders zijn er dan?</h3>
  <p class="sub">Tel je de dga's bij de vrijgevestigden op, dan komt het pensioenfonds op
  ${num(w('beroepsgroep','sph_praktijkhouders_2024'))} praktijkhouders in 2024. Het Nivel telde er in 2023
  ${num(w('beroepsgroep','praktijkhouders_2023'))}. Dat scheelt ruim duizend mensen.</p>
  ${panel(dataTable(T.praktijkhouders_bronnen, [null, num, num, num]))}
  ${callout(`<strong>Beide registers zijn gezaghebbend en ze verschillen structureel.</strong> Het pensioenfonds
  telt wie er premie afdraagt; het Nivel telt wie er als zelfstandig gevestigd staat geregistreerd. Wij kiezen
  hier geen kant. Wel is relevant dat de twee reeksen dezelfde richting op bewegen: minder praktijkhouderschap,
  meer waarneming.`)}
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
  ${anwNoot(55.7, 2.6, { kort:true })}
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
