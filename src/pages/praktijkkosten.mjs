import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, dataTable, tile, barChart, callout, compareBars } from '../lib/components.mjs';
import { num, pct, eur0 } from '../lib/format.mjs';

export default function () {
  const T = data.praktijkkosten.tabellen;
  const per1000 = T.per_1000.rijen.filter(r => r[0] !== 'Totaal praktijkkosten');

  const body = `
<section>
  <div class="grid c4">
    ${tile({ waarde: eur0(w('praktijkkosten','kosten_per_praktijk_2022')), label:'totale kosten van een gemiddelde praktijk in 2022, prijspeil definitief 2022', bron:'NZa Tabel 33' })}
    ${tile({ waarde: '+' + pct(0.462,1), label:'stijging van de praktijkkosten per praktijk tussen 2015 en 2022', bron:'NZa Tabel 33' })}
    ${tile({ waarde: '−' + pct(0.103,1), label:'daling van de arbeidskosten van de praktijkhouder per praktijk', bron:'NZa Tabel 33' })}
    ${tile({ waarde: num(w('praktijkkosten','fte_totaal_praktijk'),2), label:'fte per praktijk inclusief de praktijkhouder, na bijschatting door de NZa', bron:'NZa par. 4.3' })}
  </div>
</section>

<section>
  <h2>Kerngetallen per praktijk</h2>
  <p class="sub">Beide jaren op prijspeil definitief 2022, zodat alleen het volume-effect zichtbaar is.
  De praktijk is groter geworden en de kosten stegen mee — behalve de arbeidskosten van de eigenaar.</p>
  ${panel(dataTable(T.kerngetallen, [null, eur0, eur0, v=>pct(v,1)]))}
  ${callout(`<strong>Dit is de tegenwerping die u gaat horen.</strong> De arbeidskosten van de praktijkhouder
  dalen met 10,3 procent per praktijk, maar personeel en inhuur stijgen met een derde per 1.000 verzekerden.
  Het geld is niet uit de tarieven verdwenen; het is verschoven van de eigenaar naar loondienst en waarneming.
  Of dat een probleem is, is een politieke vraag. Dát het zo is, staat in de tabel hieronder.`)}
</section>

<section>
  <h2>Praktijkkosten per 1.000 verzekerden</h2>
  <p class="sub">Deze weergave is zuiverder dan het gemiddelde per praktijk, omdat praktijken groter zijn geworden.
  Bedragen maal duizend euro, prijspeil 2022.</p>
  ${panel(barChart({
    items: per1000.map((r, i) => ({ label: r[0].replace('Financiele','Financiële'), waarde: r[1], serie: 1,
      toelichting: `2015: ${num(r[2],1)} · mutatie ${pct(r[3],1)}` })),
    fmt: v => num(v,1), caption:'Praktijkkosten per 1.000 verzekerden in 2022, maal duizend euro. Beweeg over een staaf voor het cijfer van 2015.'
  }))}
  ${panel(dataTable(T.per_1000, [null, v=>num(v,1), v=>num(v,1), v=>pct(v,1)]))}
</section>

<section>
  <h2>Personele inzet per praktijk</h2>
  <p class="sub">Fte in loondienst en waarneming, exclusief de praktijkhouder zelf. Tel je die mee, dan komt het
  landelijk gemiddelde op ${num(w('praktijkkosten','fte_totaal_praktijk'),2)} fte per praktijk.</p>
  ${panel(dataTable(T.personeel_detail, [null, v=>num(v,2), v=>num(v,2)]))}
</section>

<section>
  <h2>Geleverde consulten</h2>
  <p class="sub">Per 1.000 verzekerden worden er meer consulten geleverd dan in 2015, en vooral meer lange consulten.</p>
  ${panel(dataTable(T.consulten_per_1000, [null, num, num, v=>pct(v,1)]))}
</section>

<section>
  <h2>Huisvesting</h2>
  <p class="sub">Het College van Beroep voor het bedrijfsleven oordeelde in november 2025 dat de NZa met haar
  methode de kosten van te krappe huisvesting had gemeten. Na onderzoek door TNO is de huisvestingscomponent
  normatief onderbouwd.</p>
  <div class="grid c3">
    ${tile({ waarde: eur0(w('praktijkkosten','huisvesting_herbeoordeling')), label:'huisvestingskosten per praktijk na herbeoordeling, prijspeil 2022', bron:'NZa, vraag en antwoord 13 juli 2026' })}
    ${tile({ waarde: eur0(w('praktijkkosten','huisvesting_toegerekend')), label:'waarvan toegerekend aan zorg binnen het segmentenmodel', bron:'NZa, vraag en antwoord' })}
    ${tile({ waarde: pct(w('praktijkkosten','spreekkamertekort'),0), label:'van de praktijken ervoer in 2022 een tekort aan spreekkamers', bron:'NZa par. 8.1.2' })}
  </div>
</section>`;

  return { pad:'/praktijkkosten/', html: pagina({
    pad:'/praktijkkosten/', titel:'Praktijkkosten', eyebrow:'Kostprijsonderzoek 2022 tegenover 2015',
    h1:'Wat een huisartsenpraktijk kost, en waar dat naartoe is gegaan',
    omschrijving:'De ontwikkeling van de praktijkkosten tussen 2015 en 2022, per praktijk en per 1.000 verzekerden.',
    lede:`Praktijken zijn groter geworden, er werkt meer personeel, en er worden meer consulten geleverd.
      De kosten stegen mee. Alleen bij de arbeidskosten van de praktijkhouder zelf ging het de andere kant op.`,
    body })};
}
