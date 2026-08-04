import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, serieChart, dataTable, compareBars, anwNoot,
         evidenceCard, methodDisclosure } from '../lib/components.mjs';
import { werkweek } from '../lib/metrics.mjs';
import { num, pct } from '../lib/format.mjs';

export default function () {
  const R = data.beroepsgroep.reeksen, T = data.beroepsgroep.tabellen;
  const ww = R.werkweek.reeksen;
  const u = werkweek();

  /* De mutaties komen uit de reeks zelf, zodat de tekst meeloopt zodra de
     beroepenregistratie wordt bijgewerkt. */
  const F = R.functies;
  const rij = naam => F.reeksen.find(s => new RegExp(naam, 'i').test(s.naam));
  const bij = (serie, jaar) => serie.waarden[F.jaren.indexOf(jaar)];
  const ph = rij('praktijkhouder'), hid = rij('in dienst');

  const piekJaar = F.jaren[ph.waarden.indexOf(Math.max(...ph.waarden.filter(v => v != null)))];
  const laatst   = [...F.jaren].reverse().find(j => bij(ph, j) != null);
  const sindsPiek = bij(ph, laatst) / bij(ph, piekJaar) - 1;
  const hidGroei  = bij(hid, laatst) / bij(hid, F.jaren[0]) - 1;

  /* De splitsing tussen loondienst en waarneming komt uit het
     kostprijsonderzoek; de Nivel-reeks telt beide in één categorie. */
  const split = naam => T.hidha_split.rijen.find(r => new RegExp(naam, 'i').test(r[0]));

  const body = `
<section>
  <div class="grid c3">
    ${evidenceCard({
      claim: `Praktijkhouders in ${laatst}`,
      kern: num(bij(ph, laatst)),
      bewijs: `personen. Het aantal piekte in ${piekJaar} op ${num(bij(ph, piekJaar))} en ligt nu
        ${pct(Math.abs(sindsPiek), 1)} lager.`,
      status: 'definitief', href: '/praktijkhouderschap/', hrefLabel: 'Wie draagt de praktijk?' })}
    ${evidenceCard({
      claim: 'Huisartsen in dienst en vaste waarnemers',
      kern: '+' + pct(hidGroei, 0),
      bewijs: `sinds ${F.jaren[0]}, van ${num(bij(hid, F.jaren[0]))} naar ${num(bij(hid, laatst))} personen.
        Dit is de sterkst groeiende groep in de registratie.`,
      status: 'definitief', href: '#waarneming', hrefLabel: 'Loondienst of waarneming?' })}
    ${evidenceCard({
      claim: 'Werkweek praktijkhouder',
      kern: num(u.bruto, 1) + ' u',
      bewijs: `per week, gemeten in 2024 — structureel meer dan elke andere functie. Exclusief de apart
        bekostigde dienst is dat ${num(u.netto, 1)} uur.`,
      status: 'definitief', href: '#uren', hrefLabel: 'Uren per functie' })}
  </div>
</section>

<section id="functies">
  <h2>Het praktijkhouderschap krimpt, de rest groeit</h2>
  <p class="sub">Het aantal praktijkhouders piekte in ${piekJaar} en daalt sindsdien licht. In dezelfde periode
  groeide de groep huisartsen in dienst en vaste waarnemers sterk. Het totale aantal werkzame huisartsen nam
  toe; de verdeling over functies verschoof.</p>
  ${panel(serieChart(R.functies, { fmt: num, hoogte: 320, yNul: true }))}
  ${callout(`De NZa noemt de veranderde personele samenstelling als verklaring voor de lagere
  praktijkhouderinzet per praktijk in de tariefonderbouwing. De registraties laten die groei van waarneming en
  loondienst inderdaad zien. De aansluiting tussen personenregistraties en fte in de kostprijsberekening is
  echter niet één op één: het eerste telt mensen, het tweede rekeneenheden.
  <a href="/praktijkkosten/">Wat dat met de kosten deed</a>.`, 'letop')}
</section>

<section id="waarneming">
  <h2>Loondienst of waarneming? Het is vooral waarneming</h2>
  <p class="sub">De Nivel-reeks telt hidha's en vaste waarnemers in één categorie, waardoor niet te zien is
  welke van de twee groeit. Het kostprijsonderzoek splitst ze wél. Omgerekend naar landelijk niveau blijkt de
  groei bijna helemaal uit waarneming te komen, niet uit loondienst.</p>
  ${panel(compareBars({
    items:[
      { label:'Huisarts in dienst bij een huisarts', waarde: split('in dienst')[5], serie:1 },
      { label:'Incidenteel waarnemer',               waarde: split('incidenteel')[5], serie:3 },
      { label:'Vaste waarnemer',                     waarde: split('vaste waarnemer')[5], serie:2 }
    ], fmt: v => pct(v, 0), caption:'Groei van de landelijke inzet tussen 2015 en 2022, in fte.'
  }))}
  ${panel(dataTable(T.hidha_split, [null, num, num, v=>num(v,2), v=>num(v,2), v=>pct(v,0)]))}
  ${callout(`De inzet van huisartsen in loondienst groeide met ${pct(w('beroepsgroep','hidha_groei'),0)}; die
  van vaste waarnemers met ${pct(w('beroepsgroep','waarnemer_groei'),0)}. De verschuiving weg van het klassieke
  praktijkhouderschap gaat dus vooral naar waarneming — een vorm zonder werkgeversband en zonder
  praktijkverantwoordelijkheid — en niet naar loondienst.`, 'inzicht')}

  ${methodDisclosure('De sprong van 2019 op 2020 is deels herindeling', `
    <p class="small">In de reeks hierboven springt de categorie hidha's en vaste waarnemers met ruim
    vijftienhonderd personen omhoog. Tegelijk daalt de categorie wisselende waarnemers met ruim zevenhonderd,
    terwijl het totaal maar met ruim vijfhonderd toeneemt. Ongeveer de helft van de sprong is dus herindeling
    tussen twee categorieën, geen instroom. Wie de reeks als trend leest, moet dat weten.</p>
    ${dataTable(T.herindeling, [null, num, num, v => (v>0?'+':'') + num(v)])}`)}
</section>

<section>
  <h2>Meer huisartsen, minder praktijken</h2>
  <p class="sub">Het aantal werkzame huisartsen groeide met ongeveer een kwart, terwijl het aantal praktijken
  licht kromp. Praktijken zijn dus groter geworden — in personeel én in patiënten.
  <a href="/praktijkhouderschap/">Wat dat voor het praktijkhouderschap betekent</a>.</p>
  ${panel(serieChart(R.totaal, { fmt: num, hoogte: 300, yNul: true }))}
</section>

<section id="uren">
  <h2>Wie werkt hoeveel uur?</h2>
  <p class="sub">Alle functies zijn meer gaan werken, maar de praktijkhouder werkt structureel het meest —
  en het verschil met de andere functies is tussen 2013 en 2024 nauwelijks kleiner geworden.</p>
  ${panel(compareBars({
    items: ww.map((r, i) => ({ label: r.naam, waarde: r.waarden[2], serie: i + 1,
      toelichting: `2013: ${num(r.waarden[0],1)} uur · 2018: ${num(r.waarden[1],1)} uur` })),
    fmt: v => num(v,1), eenheid:' u', caption:'Gewerkte uren per week in 2024, met de eerdere metingen in de toelichting.'
  }))}
  ${panel(serieChart(R.werkweek, { fmt: v => num(v,1), hoogte: 280 }))}
  ${anwNoot(u.bruto, u.anw, { kort:true })}
  <p class="small" style="margin-top:12px">De werkweek van de praktijkhouder is de noemer onder het uurbedrag
  op de <a href="/arbeidskosten/">pagina over arbeidskosten</a>.</p>
</section>`;

  return { pad:'/beroepsgroep/', html: pagina({
    pad:'/beroepsgroep/', titel:'De beroepsgroep', eyebrow:'Functies en arbeidsmarkt',
    h1:'Meer huisartsen, maar niet meer praktijkhouders',
    omschrijving:'Praktijkhouders, huisartsen in dienst en waarnemers tussen 2012 en 2025, met de gewerkte uren per functie.',
    lede:`Het totale aantal werkzame huisartsen groeit. Het aantal praktijkhouders piekte in ${piekJaar} en
      daalt sindsdien licht. De groei zit vooral in waarneming en in mindere mate in loondienst.`,
    status:[`Nivel-beroepenregistratie tot en met ${laatst}`, `herziene reeks`,
            `uren gemeten in 2013, 2018 en 2024`],
    body })};
}
