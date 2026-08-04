import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, dataTable, tile, barChart, callout, compareBars, statContrast, methodDisclosure } from '../lib/components.mjs';
import { num, pct, eur0 } from '../lib/format.mjs';

export default function () {
  const T = data.praktijkkosten.tabellen;
  const per1000 = T.per_1000.rijen.filter(r => r[0] !== 'Totaal praktijkkosten');

  /* De mutaties komen uit de tabel, niet uit vaste getallen in de tekst. Zo kan
     de kop niet uit de pas gaan lopen met de cijfers eronder — en zo blijft
     zichtbaar dat "totale kosten" en "praktijkkosten" twee verschillende posten
     zijn: 22,8% tegenover 46,2%. Die twee worden makkelijk verwisseld. */
  const kern = naam => T.kerngetallen.rijen.find(r => r[0] === naam);
  const totaal   = kern('Totale kosten');
  const praktijk = kern('Praktijkkosten');
  const arbeid   = kern('Arbeidskosten praktijkhouder');

  const body = `
<section id="tegenstelling">
  ${statContrast({
    pijl: 'tegenover',
    links:  { waarde: '+' + pct(praktijk[3], 1), label: 'praktijkkosten per praktijk',
              eenheid: `personeel, inhuur, huisvesting en overig · ${eur0(praktijk[2])} → ${eur0(praktijk[1])}`,
              status: 'definitief' },
    rechts: { waarde: '−' + pct(Math.abs(arbeid[3]), 1), label: 'arbeidskosten van de praktijkhouder',
              eenheid: `per praktijk · ${eur0(arbeid[2])} → ${eur0(arbeid[1])}`,
              status: 'definitief' },
    ratio: `<b>Noemer: per praktijk</b>, beide jaren op prijspeil 2022, zodat alleen het volume-effect
      zichtbaar is. Samen komen de <b>totale</b> kosten per praktijk uit op ${eur0(totaal[1])}, een stijging
      van ${pct(totaal[3], 1)} — niet de ${pct(praktijk[3], 1)} van de post praktijkkosten alleen. Die twee
      worden vaak door elkaar gehaald.`
  })}
</section>

<section>
  <h2>Kerngetallen per praktijk</h2>
  <p class="sub">Beide jaren op prijspeil definitief 2022, zodat alleen het volume-effect zichtbaar is.
  De praktijk is groter geworden en de kosten stegen mee — behalve de arbeidskosten van de eigenaar.</p>
  ${panel(dataTable(T.kerngetallen, [null, eur0, eur0, v=>pct(v,1)]))}
  ${callout(`In de gemeten kostprijs verschoof het gewicht van de arbeidskosten van de praktijkhouder naar
  personeel en inhuur. Dat verklaart een deel van de modeluitkomst; het zegt niet wat iedere individuele
  praktijk feitelijk heeft ontvangen. Het geld is niet uit de tarieven verdwenen — het staat op een andere
  regel.`, 'inzicht')}
  ${callout(`<b>Let op de noemer.</b> De mutatie van ${pct(arbeid[3],1)} is <i>per praktijk</i>; de stijging van
  personeel en inhuur hieronder is <i>per 1.000 verzekerden</i>. Praktijken zijn in deze periode groter
  geworden, dus die twee noemers lopen uiteen. Vergelijk daarom binnen een noemer, niet ertussen.`, 'letop')}
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
    h1:'De praktijk werd duurder. De post voor de praktijkhouder daalde.',
    omschrijving:'De ontwikkeling van de praktijkkosten tussen 2015 en 2022, per praktijk en per 1.000 verzekerden, met de noemer er telkens bij.',
    lede:`Tussen 2015 en 2022 stegen de praktijkkosten per praktijk met ${pct(praktijk[3],1)}: personeel,
      inhuur, huisvesting en overig. De arbeidskosten van de praktijkhouder daalden in diezelfde periode met
      ${pct(Math.abs(arbeid[3]),1)}. De totale kosten per praktijk kwamen daarmee ${pct(totaal[3],1)} hoger uit.`,
    status:[`Prijspeil definitief 2022`, `noemer: per praktijk`, `${p('praktijkkosten','kosten_per_praktijk_2022').status}`],
    body })};
}
