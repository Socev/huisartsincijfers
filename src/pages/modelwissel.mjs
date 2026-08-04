import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { normbedragTabel } from '../lib/metrics.mjs';
import { panel, tile, callout, dataTable, heroNumber, compareBars, bronLabel } from '../lib/components.mjs';
import { eur, eur0, num, pct } from '../lib/format.mjs';

export default function () {
  const T = data.modelwissel.tabellen;
  const D = T.dekking_p1000.rijen, V = T.verschuiving.rijen;
  const nac24 = D[0][3], nac25 = D[0][4], tot24 = D[5][3], tot25 = D[5][4];
  const pers24 = D[1][3], pers25 = D[1][4];
  const np15 = w('modelwissel','normpraktijk_2015'), np22 = w('modelwissel','normpraktijk_2022');

  const body = `
<section>
  <h2>Alles omhoog, en toch bleef het tarief staan</h2>
  ${heroNumber(pct(nac25/nac24-1,1),
    `verandering in wat de tarieven per 1.000 patiënten inrekenen voor de arbeid van de praktijkhouder —
     terwijl het totaal in datzelfde jaar met ${pct(tot25/tot24-1,1)} steeg.`)}
  <p class="sub" style="margin-top:20px">Het kostprijsonderzoek 2022 corrigeerde de vergoeding voor personeel
  fors omhoog, verving de gemeten huisvesting door een normatieve component, en verhoogde het normbedrag per
  fte praktijkhouder van ${eur0(171940)} naar ${eur0(202476)}. Alle bewegingen wezen dezelfde kant op. Toch
  veranderde het inschrijftarief nauwelijks, en ging de arbeidsvergoeding van de praktijkhouder per patiënt
  omláág. Deze pagina laat zien waar het geld heen ging.</p>
</section>

<section>
  <h2>Twee modellen, twee manieren van tellen</h2>
  <p class="sub">Tot en met 2024 rekende de NZa met een normpraktijk: ${num(np15)} ingeschrevenen krijgen
  één volledig normatief artseninkomen, en daarbovenop een normbedrag voor personeel en overige kosten.
  Vanaf 2025 is die normpraktijk uit de formule verdwenen. Het tarief is nu de gemeten kostprijs van de
  gemiddelde onderzochte praktijk, met de arbeid van de praktijkhouder erin als fte maal nac.</p>
  ${panel(compareBars({
    items:[
      { label:`Model 2015: één volledige arbeidsvergoeding per ${num(np15)} ingeschrevenen`,
        waarde: w('modelwissel','fte_p1000_2015'), serie:1,
        toelichting:'0,4773 vergoede fte per 1.000 ingeschrevenen' },
      { label:`Model 2022 herzien: één volledige arbeidsvergoeding per ${num(np22)} ingeschrevenen`,
        waarde: w('modelwissel','fte_p1000_2022'), serie:2,
        toelichting:'0,3363 vergoede fte per 1.000, na schoning buiten de 100%' }
    ], fmt: v=>num(v,4), eenheid:' fte', caption:'Vergoede fte praktijkhouder per 1.000 ingeschreven verzekerden.'
  }))}
  ${callout(`<strong>Dit is de kern van de wissel.</strong> Per 1.000 patiënten wordt ${pct(1-w('modelwissel','fte_p1000_2022')/w('modelwissel','fte_p1000_2015'),1)}
  minder fte praktijkhouder vergoed dan onder het oude model. Dat is geen bezuiniging die ergens is
  afgesproken; het is het gevolg van twee dingen die tegelijk gebeurden. De normpraktijk verdween als
  rekeneenheid, en de fte-telling werd afgeleid uit de opgegeven uren van de onderzochte praktijken, met een
  aftopping op 1,0. <a href="/arbeidskosten/">Hoe die telling werkt</a>.`)}
</section>

<section>
  <h2>Wat er per 1.000 patiënten in de tarieven zit</h2>
  <p class="sub">Dezelfde noemer voor alle jaren: duizend ingeschreven verzekerden bij de landelijke
  populatiemix. Het totaal loopt door de jaren heen netjes op. De verdeling erbinnen verspringt in 2025.</p>
  ${panel(dataTable(T.dekking_p1000, [null, eur0, eur0, eur0, eur0, eur0]))}
  ${panel(dataTable(T.verschuiving, [null, eur0, eur0, v => (v>0?'+':'−')+eur0(Math.abs(v)), v => v===null?'—':(v>0?'+':'−')+pct(Math.abs(v),1)]))}
  ${callout(`<strong>Het geld ging naar de praktijk, niet naar de praktijkhouder.</strong> Per 1.000 patiënten
  kwam er ${eur0(V[1][3])} bij voor personeel en inhuur en ${eur0(V[2][3])} voor huisvesting en overige
  kosten. Tegelijk ging er ${eur0(Math.abs(V[0][3]))} áf bij de arbeidskosten van de eigenaar. Dat is
  verdedigbaar zodra je gelooft dat de oude personeelsnorm te laag was — maar het betekent wel dat de
  correctie van de ene onderschatting is gefinancierd uit de post die de eigenaar zelf overhoudt.`)}
</section>

<section>
  <h2>Het normbedrag steeg, het aantal normbedragen daalde</h2>
  <p class="sub">Beide bewegingen worden apart gecommuniceerd, en beide zijn waar. Naast elkaar gezet
  verklaren ze waarom een forse verhoging van de arbeidsvergoeding per fte niet in het tarief te zien is.</p>
  ${panel(dataTable(normbedragTabel(), [null, eur0, num, v => '€ ' + num(v,1) + ' mln']))}
  ${callout(`<strong>Rekenen met de uitersten.</strong> Het normbedrag per fte steeg tussen 2024 en 2025 met
  ${pct(202476/171940-1,1)}. Het aantal fte dat ermee wordt vermenigvuldigd daalde met
  ${pct(1-5885/8305,1)}. Wat er landelijk aan arbeidsvergoeding voor praktijkhouders in de tarieven zit,
  daalde daardoor van ${eur0(1428)} miljoen naar ${eur0(1191.6)} miljoen — ruim
  ${eur0(1428-1191.6)} miljoen minder, in het jaar waarin de nac fors omhoog ging.
  <a href="/uurtarief/">Wat dat per gewerkt uur betekent</a>.`)}
  <p class="small">Let op: de twee normbedragen zijn niet dezelfde grootheid. Tot en met 2024 gaat het om het
  normatieve inkomen uit het model van 2015; vanaf 2025 om de nac uit het onderzoek van Berenschot. Ze
  vervullen dezelfde rol in de berekening, maar zijn anders onderbouwd.
  <a href="/nac/">Hoe de nac is opgebouwd</a>.</p>
</section>

<section>
  <h2>Wat hier wel en niet uit volgt</h2>
  <ul>
    <li>De reeks tot en met 2024 en die vanaf 2025 zijn <strong>niet zonder meer vergelijkbaar</strong>. Het
    oude model rekende met normbedragen op prijspeil 2015, het nieuwe met gemeten kosten op prijspeil 2022.
    Wij zetten ze naast elkaar omdat de tarieven dat óók doen: praktijken kregen in 2024 het ene en in 2025
    het andere.</li>
    <li>De reeks geldt bij de <strong>landelijke populatiemix</strong>. Een praktijk met veel ouderen
    declareert meer eenheden per patiënt en haalt dus meer dekking op dan deze reeks; een jonge populatie
    minder.</li>
    <li>De splitsing van de praktijkkosten over personeel, huisvesting en overige posten is voor 2025 en 2026
    <strong>afgeleid</strong> uit gepubliceerde aandelen, binnen een totaal dat de NZa wél exact publiceert.
    Het totaal staat vast; de verdeling erbinnen is onze reconstructie.</li>
    <li>Dit zegt <strong>niets over wat een individuele praktijk ontvangt</strong>. Het gaat om wat er in de
    landelijke tariefonderbouwing is ingerekend.</li>
  </ul>
  <p class="bron" style="margin-top:16px">${bronLabel(T.dekking_p1000)}</p>
</section>`;

  return { pad:'/modelwissel/', html: pagina({
    pad:'/modelwissel/', titel:'De modelwissel', eyebrow:'Kostprijsmodel 2015 tegenover 2022',
    h1:'Alles ging omhoog, en toch bleef het tarief vrijwel gelijk',
    omschrijving:'Wat er per 1.000 ingeschreven verzekerden in de tarieven zit, per kostenpost, van 2018 tot 2026 — en wat er in 2025 verschoof.',
    lede:`Het kostprijsonderzoek 2022 corrigeerde de personeelskosten fors omhoog en verhoogde het normbedrag
      voor de arbeid van de praktijkhouder. Toch veranderde het inschrijftarief nauwelijks. Deze pagina zet de
      kostenposten per 1.000 patiënten naast elkaar en laat zien waar het verschil zit.`,
    body })};
}
