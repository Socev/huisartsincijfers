import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, serieChart, dataTable, compareBars } from '../lib/components.mjs';
import { num, pct, eur0 } from '../lib/format.mjs';

export default function () {
  const R = data.inkomen.reeksen, T = data.inkomen.tabellen;
  const nac23 = w('inkomen','nac_2023'), mp23 = w('inkomen','winst_mp_2023');

  const body = `
<section>
  <h2>Eerst: wat meten deze getallen eigenlijk?</h2>
  <p class="sub">Over het inkomen van huisartsen circuleren getallen die van elkaar verschillen zonder dat
  iemand liegt. Ze meten domweg iets anders. Voordat er één grafiek volgt, staat hier wat wat is.</p>
  ${panel(dataTable(T.definities, null))}
  ${callout(`<strong>De belangrijkste verwarring.</strong> De normatieve arbeidskostencomponent is een
  <em>kostenpost in een tarief</em>, geen salaris. Wat een praktijkhouder overhoudt, hangt af van de omzet en de
  werkelijke kosten van de eigen praktijk. Wie de nac naast een inkomenscijfer legt, vergelijkt een norm met een
  uitkomst. Dat kan leerzaam zijn, maar het is geen appels met appels.`)}
</section>

<section>
  <h2>Hetzelfde tellen, drie antwoorden</h2>
  <p class="sub">Hoeveel praktijkhouders zijn er? Het antwoord loopt van bijna vijfduizend tot ruim vijftienduizend,
  afhankelijk van welke bron je pakt. Elk getal klopt binnen zijn eigen definitie.</p>
  ${panel(dataTable(T.tellen, [null, num, null]))}
  ${callout(`Dit verklaart waarom een gemiddelde winst per <em>ondernemer</em> lager uitvalt dan per
  <em>praktijkhouder</em>: in de bredere telling zitten ook zelfstandige waarnemers, die gemiddeld minder uren
  maken en geen praktijk in stand houden. Voor het praktijkhouderschap is de groep <em>met personeel</em>
  de beste benadering.`)}
</section>

<section>
  <h2>Wat huisarts-ondernemers verdienen</h2>
  <p class="sub">Winst uit onderneming, vóór inkomstenbelasting en vóór eigen pensioen- en
  arbeidsongeschiktheidsvoorzieningen. De bovenste lijn is de groep met personeel — de beste benadering van
  het praktijkhouderschap.</p>
  ${panel(serieChart(R.inkomen, { fmt: eur0, hoogte: 320 }))}
  <div class="grid c4" style="margin-top:16px">
    ${tile({ waarde: eur0(mp23), label:'gemiddelde winst van huisarts-ondernemers met personeel in 2023', bron:'CBS StatLine 84467NED' })}
    ${tile({ waarde: eur0(w('inkomen','winst_mp_med_2023')), label:'mediane winst van diezelfde groep — de helft zit eronder', bron:'CBS StatLine 84467NED' })}
    ${tile({ waarde: eur0(w('inkomen','winst_alle_2023')), label:'gemiddelde winst van álle huisarts-ondernemers, inclusief zelfstandige waarnemers', bron:'CBS StatLine 84467NED' })}
    ${tile({ waarde: eur0(w('inkomen','dga_2023')), label:'gemiddeld persoonlijk inkomen van huisartsen met een eigen bv', bron:'CBS StatLine 84467NED' })}
  </div>
</section>

<section>
  <h2>Gecorrigeerd voor inflatie</h2>
  <p class="sub">Dezelfde reeksen op prijspeil 2015. Nominaal stijgt de winst; reëel is het beeld vlakker,
  met een duidelijke terugval in de inflatiejaren 2022 en 2023.</p>
  ${panel(serieChart(R.inkomen_reeel, { fmt: eur0, hoogte: 320 }))}
</section>

<section>
  <h2>Gemiddelde en mediaan lopen uiteen</h2>
  <p class="sub">Het gemiddelde ligt structureel boven de mediaan. Er is dus een staart van hogere inkomens die
  het gemiddelde omhoog trekt; de doorsnee praktijkhouder zit lager dan het gemiddelde suggereert.</p>
  ${panel(serieChart(R.mediaan, { fmt: eur0, hoogte: 320 }))}
</section>

<section>
  <h2>Minder ondernemers met personeel, meer zonder</h2>
  <p class="sub">Het totale aantal zelfstandig ondernemers in huisartsenpraktijken groeide fors, maar de groep
  mét personeel kromp. Dat is dezelfde beweging als op de <a href="/beroepsgroep/">pagina over de beroepsgroep</a>:
  meer huisartsen, minder praktijkhouderschap.</p>
  ${panel(serieChart(R.ondernemers, { fmt: num, hoogte: 300, yNul: true }))}
</section>

<section>
  <h2>De norm naast de uitkomst</h2>
  <p class="sub">Tot slot de vergelijking waar het om draait — met alle voorbehouden die hierboven staan.
  De normatieve arbeidskostencomponent is wat de NZa in het tarief inrekent; de winstlijn is wat ondernemers
  met personeel feitelijk overhielden.</p>
  ${panel(serieChart(R.norm_vs_werkelijk, { fmt: eur0, hoogte: 320 }))}
  ${panel(compareBars({
    items:[
      { label:'Normatieve arbeidskostencomponent in het tarief, 2023', waarde: nac23, serie:1 },
      { label:'Gemiddelde winst, ondernemers met personeel, 2023', waarde: mp23, serie:2,
        toelichting:'Vóór inkomstenbelasting, pensioen en arbeidsongeschiktheidsdekking' }
    ], fmt: eur0, caption:'Twee getallen over hetzelfde jaar, die niet hetzelfde meten.'
  }))}
  <h3>Waarom dit géén sluitende vergelijking is</h3>
  <ul>
    <li>De nac geldt per fte, afgetopt op 1,0. De winstcijfers gelden per persoon, inclusief wie in deeltijd werkt.</li>
    <li>In de nac zit een opslag voor sociale lasten. Een ondernemer moet pensioen en arbeidsongeschiktheids-
    dekking uit de winst betalen; die posten staan aan verschillende kanten van de streep.</li>
    <li>De winst is een resultaat ná alle praktijkkosten. Loopt een praktijk goed of slecht, dan zie je dat hier
    terug; de nac beweegt niet mee.</li>
    <li>Slechts een deel van de nac wordt gedekt door gereguleerde tarieven —
    <a href="/arbeidskosten/">hoeveel precies staat hier</a>. Wat een praktijk daadwerkelijk ontvangt hangt ook
    af van wat er buiten die tarieven wordt afgesproken.</li>
  </ul>
  ${callout(`Wat de reeksen wél laten zien: in 2015 lagen de twee vrijwel gelijk, van 2016 tot en met 2023 liep
  de nac er ieder jaar bij achter, en vanaf 2025 springt hij eroverheen. Die sprong is geen loonstijging maar het
  gevolg van de herijkte kostprijzen. Tegelijk daalde het <em>aantal</em> nac's dat in de tarieven wordt
  ingerekend fors. <a href="/arbeidskosten/">Die twee bewegingen horen bij elkaar</a>.`)}
</section>`;

  return { pad:'/inkomen/', html: pagina({
    pad:'/inkomen/', titel:'Inkomen en de norm', eyebrow:'Norm tegenover uitkomst',
    h1:'Wat een praktijkhouder verdient, en wat het tarief daarvoor inrekent',
    omschrijving:'Winst uit onderneming volgens het CBS, naast de normatieve arbeidskostencomponent van de NZa — met de definities die de twee onvergelijkbaar maken.',
    lede:`Over huisartseninkomens circuleren veel getallen die elkaar tegenspreken. Meestal komt dat doordat ze
      iets anders meten. Deze pagina zet ze naast elkaar, mét de definities, zodat duidelijk is wat je wel en
      niet mag concluderen.`,
    body })};
}
