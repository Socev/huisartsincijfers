import { pagina } from '../lib/layout.mjs';
import { w, data } from '../lib/data.mjs';
import { panel, tile, callout, serieChart, compareBars } from '../lib/components.mjs';
import { num, pct } from '../lib/format.mjs';

export default function () {
  const R = data.werkdruk.reeksen;
  const body = `
<section>
  <div class="grid c4">
    ${tile({ waarde: pct(w('werkdruk','stop_2024'),0), label:'van de praktijken had in 2024 een patiëntenstop. In 2018 was dat ' + pct(w('werkdruk','stop_2018'),0) + '.', bron:'Nivel arbeidsmarktonderzoek' })}
    ${tile({ waarde: num(w('werkdruk','werkdruk_2024')), label:'werkdrukscore van huisartsen op een schaal van honderd — hoger is meer druk', bron:'Nivel arbeidsmarktonderzoek' })}
    ${tile({ waarde: num(w('werkdruk','werkplezier_2024')), label:'werkplezierscore in de praktijk. Die blijft opvallend stabiel.', bron:'Nivel arbeidsmarktonderzoek' })}
    ${tile({ waarde: pct(w('werkdruk','verzuim_2022')/100,1), label:'ziekteverzuim in de branche in het piekjaar 2022, tegen ' + pct(w('werkdruk','verzuim_2013')/100,1) + ' in 2013', bron:'CBS AZW' })}
  </div>
</section>

<section>
  <h2>Zes op de tien praktijken zit vol</h2>
  <p class="sub">Het aandeel praktijken met een patiëntenstop liep op van bijna de helft naar zes op de tien.
  De verwachte tekorten schommelen sterk van jaar op jaar — dat zijn verwachtingen, geen metingen, en ze
  reageren zichtbaar op de actualiteit.</p>
  ${panel(serieChart(R.stops, { fmt: v => num(v,0) + '%', hoogte: 320, yNul: true }))}
  ${callout(`Let op de piek van 2022 bij het verwachte tekort aan huisartsen: 95 procent van de praktijken
  verwachtte toen een tekort, tegen 25 procent in het coronajaar 2020. Zulke uitslagen zeggen meer over het
  moment van uitvragen dan over de onderliggende capaciteit. De patiëntenstop is het stabielere signaal.`)}
</section>

<section>
  <h2>Werkdruk daalt licht, werkplezier blijft gelijk</h2>
  <p class="sub">De werkdrukscore van huisartsen zakte tussen 2021 en 2024 van 84 naar 78. Het werkplezier bleef
  in diezelfde periode vrijwel onveranderd rond de 75.</p>
  ${panel(serieChart(R.werkdruk, { fmt: num, hoogte: 300 }))}
  ${panel(compareBars({
    items:[
      { label:'Werkdruk huisartsen, 2024', waarde:78, serie:1 },
      { label:'Werkdruk doktersassistenten, 2024', waarde:73, serie:2 },
      { label:'Werkplezier in de praktijk, 2024', waarde:76, serie:3 }
    ], fmt:num, caption:'Scores op een schaal van nul tot honderd. Bij werkdruk is hoger ongunstiger, bij werkplezier gunstiger.'
  }))}
  <p class="small">Deze reeks loopt pas vanaf 2021 en telt vier meetjaren. Een daling van zes punten over vier
  jaar is te weinig om er een trend van te maken; wij tonen hem omdat de reeks bestaat, niet omdat hij iets bewijst.</p>
</section>

<section>
  <h2>Het ziekteverzuim verdubbelde</h2>
  <p class="sub">In de branche huisartsen en gezondheidscentra liep het verzuim op van 2,5 procent in 2013 naar
  bijna acht procent in 2022, om daarna licht terug te zakken. Dit gaat over al het personeel in de branche,
  niet alleen over huisartsen.</p>
  ${panel(serieChart(R.verzuim, { fmt: v => num(v,1) + '%', hoogte: 280, yNul: true }))}
  <p class="small">Praktijkhouders zelf zitten hier niet in: als ondernemer vallen zij buiten de
  verzuimregistratie. Wat u hier ziet is het verzuim van de mensen die zij in dienst hebben.</p>
</section>`;

  return { pad:'/werkdruk/', html: pagina({
    pad:'/werkdruk/', titel:'Werkdruk en capaciteit', eyebrow:'Arbeidsmarkt en belasting',
    h1:'Patiëntenstops, werkdruk en verzuim',
    omschrijving:'Het aandeel praktijken met een patiëntenstop, de werkdruk- en werkplezierscores en het ziekteverzuim in de branche.',
    lede:`Cijfers over hoe de huisartsenzorg ervoor staat als werkplek. Minder hard dan de tariefcijfers —
      het zijn deels enquêtes en verwachtingen — en dat staat er per reeks bij.`,
    body })};
}
