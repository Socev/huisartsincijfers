import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, serieChart, dataTable, compareBars,
         statContrast, evidenceCard, methodDisclosure } from '../lib/components.mjs';
import { num, pct } from '../lib/format.mjs';

export default function () {
  const R = data.beroepsgroep.reeksen, T = data.beroepsgroep.tabellen;

  /* De twee tellingen van het praktijkhouderschap, uit de tabel zelf. */
  const tel = naam => T.telling_praktijkhouders.rijen.find(r => new RegExp(naam, 'i').test(r[0]));
  const nivel = tel('^Nivel'), sphSamen = tel('SPH: samen');
  const verschil = nivel[1] - sphSamen[1];

  const P = R.praktijkvorm;
  const vorm = naam => P.reeksen.find(s => new RegExp(naam, 'i').test(s.naam));
  const eerste = s => s.waarden.find(v => v != null);
  const laatste = s => [...s.waarden].reverse().find(v => v != null);
  const solo = vorm('solo'), groeps = vorm('groep');

  const body = `
<section id="tellingen">
  ${statContrast({
    pijl: 'tegenover',
    links:  { waarde: num(nivel[1]), label: 'Nivel: zelfstandig gevestigde huisartsen',
              eenheid: 'beroepenregistratie, peiljaar 2023', status: 'definitief' },
    rechts: { waarde: num(sphSamen[1]), label: 'Pensioenfonds: vrijgevestigd plus dga',
              eenheid: 'deelnemersbestand, peiljaar 2023', status: 'definitief' },
    ratio: `Twee registers, <b>${num(verschil)}</b> mensen verschil op een groep van ruim zevenduizend. Dat is
      ${pct(verschil / nivel[1], 1)} van de Nivel-telling, en het is niet triviaal: dit getal is de noemer
      onder bijna elke berekening op deze site.`
  })}
</section>

<section id="praktijken">
  <h2>Minder praktijken, grotere organisaties</h2>
  <p class="sub">Het aantal huisartsenpraktijken kromp licht terwijl het aantal werkzame huisartsen met
  ongeveer een kwart groeide. Er werken dus meer mensen in minder organisaties.</p>
  <div class="grid c3">
    ${evidenceCard({
      claim: 'Huisartsenpraktijken',
      kern: num(w('beroepsgroep','praktijken_2024')),
      bewijs: `op 1 januari 2024. Tien jaar eerder waren het er ruim tweehonderd meer.`,
      status: p('beroepsgroep','praktijken_2024').status })}
    ${evidenceCard({
      claim: 'Werkt solo',
      kern: pct(laatste(solo), 0),
      bewijs: `van de regulier gevestigde huisartsen, tegen ${pct(eerste(solo), 0)} in ${P.jaren[0]}.
        De solopraktijk is bijna verdwenen.`,
      status: 'definitief', href: '#praktijkvorm', hrefLabel: 'De reeks' })}
    ${evidenceCard({
      claim: 'Werkt in een groepspraktijk',
      kern: pct(laatste(groeps), 0),
      bewijs: `van de regulier gevestigde huisartsen — twee derde, tegen ${pct(eerste(groeps), 0)} in
        ${P.jaren[0]}. Drie of meer huisartsen per praktijk.`,
      status: 'definitief', href: '#praktijkvorm', hrefLabel: 'De reeks' })}
  </div>
</section>

<section id="praktijkvorm">
  <h2>De solopraktijk is bijna verdwenen</h2>
  <p class="sub">In ${P.jaren[0]} werkte bijna een kwart van de huisartsen solo; nu nog
  ${pct(laatste(solo), 0)}. Twee derde werkt in een groepspraktijk.</p>
  ${panel(serieChart(R.praktijkvorm, { fmt: v => num(v,0) + '%', hoogte: 300, yNul: true }))}
</section>

<section id="registers">
  <h2>Hoeveel praktijkhouders zijn er? Twee registers geven verschillende antwoorden</h2>
  <p class="sub">Deelname aan het pensioenfonds is voor praktijkhoudende huisartsen verplicht. Toch telt het
  fonds er duidelijk minder dan het Nivel. Beide tellingen staan hier naast elkaar; wij kiezen er geen tussen
  en gebruiken de Nivel-reeks alleen waar die expliciet als noemer is bedoeld.</p>
  ${panel(dataTable(T.telling_praktijkhouders, [null, num, null]))}
  ${panel(dataTable(T.praktijkhouders_bronnen, [null, num, num, num]))}
  ${callout(`<b>Wat het verschil kán verklaren — en wat wij nog niet weten.</b>
  <b>Eén:</b> de rechtsvorm. Wie zijn praktijk via een bv voert, zit bij het fonds in de dga-regeling en niet
  bij de vrijgevestigden; die groep groeide met ${pct(w('beroepsgroep','sph_dga_groei'),1)}.
  <b>Twee:</b> het eigendom zelf. Een praktijk kan eigendom zijn van een rechtspersoon of van iemand die niet
  als huisarts meetelt; het Nivel registreert dan nog steeds een praktijkhoudend huisarts aan die praktijk.
  <b>Drie:</b> deelnemers die in meer dan één regeling zitten, telt het fonds in het totaal maar één keer mee.
  <b>Vier:</b> de peildata en de definitie van 'verbonden aan een praktijk' verschillen.
  Welk deel van de ${num(verschil)} door welke oorzaak komt, kunnen wij op dit moment niet vaststellen.`,
  'methode')}
</section>

<section id="pensioenfonds">
  <h2>Het pensioenfonds als tweede meting</h2>
  <p class="sub">Het pensioenfonds voor huisartsen telt alle huisartsen die pensioen opbouwen, ongeacht functie.
  Dat maakt het een onafhankelijke tweede meting naast de beroepenregistratie.</p>
  ${panel(serieChart(R.sph, { fmt: num, hoogte: 300, yNul: true }))}

  <h3>Vier deelnemerstypen, vier bewegingen in dezelfde richting</h3>
  <p class="sub">De jaarverslagen splitsen het deelnemersbestand uit naar type. Figuur 6 telt de
  directeur-grootaandeelhouders mee bij de huisartsen in dienstverband; figuur 7 splitst ze apart. Dat
  onderscheid is wezenlijk: een dga bezit een praktijk en is geen werknemer. Hieronder staan ze daarom los.</p>
  ${panel(serieChart(R.sph_typen_index, { fmt: v => num(v,0), hoogte: 330 }))}
  ${callout(`<b>Waarom deze reeks geïndexeerd is.</b> In absolute aantallen overheersen de twee grote groepen
  en zie je de kleine groepen niet bewegen. Juist daar gebeurt het meeste: de directeur-grootaandeelhouders
  groeien met ${pct(w('beroepsgroep','sph_dga_groei'),1)} in vier jaar en de huisartsen in dienstverband met
  ${pct(w('beroepsgroep','sph_hidha_groei'),1)}. Dat is relevant voor de kosten van een praktijk: een hidha is
  duurder dan een waarnemer die per uur wordt ingehuurd — hij brengt vakantie, scholing, doorbetaling bij
  ziekte en werkgeverslasten mee. <a href="/praktijkkosten/">Wat dat doet met de personeelskosten</a>.`,
  'methode')}
  ${panel(dataTable(T.sph_typen, [null, num, num, num, num, num, v=>pct(v,1)]))}
  ${callout(`Vier bewegingen tegelijk, alle vier weg van het klassieke praktijkhouderschap. De vrijgevestigden
  dalen met ${pct(Math.abs(w('beroepsgroep','sph_vrijgevestigd_daling')),1)}, de waarnemers stijgen met
  ${pct(w('beroepsgroep','sph_waarnemend_groei'),1)} en zijn inmiddels de grootste groep werkende huisartsen,
  de hidha's met ${pct(w('beroepsgroep','sph_hidha_groei'),1)} en de dga's met
  ${pct(w('beroepsgroep','sph_dga_groei'),1)}. Dat bevestigt onafhankelijk wat het kostprijsonderzoek liet
  zien: <a href="/beroepsgroep/#waarneming">de verschuiving gaat vooral naar waarneming</a>.`, 'inzicht')}
  ${methodDisclosure('Waarom de twee registers niet op elkaar aansluiten', `
    ${dataTable(T.sph_sluit_niet, [null, num, num, null])}`)}
</section>`;

  return { pad:'/praktijkhouderschap/', html: pagina({
    pad:'/praktijkhouderschap/', titel:'Het praktijkhouderschap',
    eyebrow:'Praktijken, praktijkvorm en registraties',
    h1:'Minder praktijkhouders, minder praktijken, grotere organisaties',
    omschrijving:'Het aantal huisartsenpraktijken, de verschuiving naar groepspraktijken, en waarom twee registers een verschillend aantal praktijkhouders tellen.',
    lede:`Het aantal praktijken kromp terwijl het aantal huisartsen groeide, en de solopraktijk is bijna
      verdwenen. Hoeveel praktijkhouders er precies zijn hangt bovendien af van wie je het vraagt: het Nivel
      telt er ${num(verschil)} meer dan het pensioenfonds.`,
    status:[`Peiljaar 2023 en 2024`, `Nivel-beroepenregistratie`, `SPH-jaarverslagen`],
    body })};
}
