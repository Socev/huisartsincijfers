import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, serieChart, dataTable, compareBars, table,
         statContrast, evidenceCard, methodDisclosure } from '../lib/components.mjs';
import { num, pct, eur0 } from '../lib/format.mjs';

export default function () {
  const R = data.beroepsgroep.reeksen, T = data.beroepsgroep.tabellen;

  /* De twee tellingen van het praktijkhouderschap, uit de tabel zelf. */
  const tel = naam => T.telling_praktijkhouders.rijen.find(r => new RegExp(naam, 'i').test(r[0]));
  const nivel = tel('^Nivel'), sphSamen = tel('SPH: samen');
  const verschil = nivel[1] - sphSamen[1];

  /* Let op de eenheid: deze reeks staat al in procenten (6,0 betekent 6%), niet
     in aandelen. Door er pct() overheen te halen werd 6% eerst 600%. Vandaar
     een eigen formatteerfunctie die bij de reeks hoort in plaats van bij de
     gewoonte. */
  const P = R.praktijkvorm;
  const procent = v => num(v, v % 1 ? 1 : 0) + '%';
  const vorm = naam => P.reeksen.find(s => new RegExp(naam, 'i').test(s.naam));
  const eerste = s => s.waarden.find(v => v != null);
  const laatste = s => [...s.waarden].reverse().find(v => v != null);
  const laatsteJaar = s => P.jaren[s.waarden.length - 1 - [...s.waarden].reverse().findIndex(v => v != null)];
  const solo = vorm('solo'), groeps = vorm('groep');

  /* Werkgeverskosten waarnemer tegenover hidha, uit het eigen rekenmodel. */
  const kw   = w('personeel','kosten_waarnemer_2025');
  const kh25 = w('personeel','kosten_hidha_2025');
  const kh26 = w('personeel','kosten_hidha_2026');
  const meer = (h) => h / kw - 1;

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
      kern: procent(laatste(solo)),
      bewijs: `van de regulier gevestigde huisartsen in ${laatsteJaar(solo)}, tegen
        ${procent(eerste(solo))} in ${P.jaren[0]}. De solopraktijk is bijna verdwenen.`,
      status: 'definitief', href: '#praktijkvorm', hrefLabel: 'De reeks' })}
    ${evidenceCard({
      claim: 'Werkt in een groepspraktijk',
      kern: procent(laatste(groeps)),
      bewijs: `van de regulier gevestigde huisartsen in ${laatsteJaar(groeps)} — twee derde, tegen
        ${procent(eerste(groeps))} in ${P.jaren[0]}. Drie of meer huisartsen per praktijk.`,
      status: 'definitief', href: '#praktijkvorm', hrefLabel: 'De reeks' })}
  </div>
</section>

<section id="praktijkvorm">
  <h2>De solopraktijk is bijna verdwenen</h2>
  <p class="sub">In ${P.jaren[0]} werkte bijna een kwart van de huisartsen solo; in ${laatsteJaar(solo)} nog
  ${procent(laatste(solo))}. Twee derde werkt inmiddels in een groepspraktijk.</p>
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
  ${pct(w('beroepsgroep','sph_hidha_groei'),1)}. Dat is relevant voor de kosten van een praktijk — zie hieronder.`,
  'methode')}
  ${panel(dataTable(T.sph_typen, [null, num, num, num, num, num, v=>pct(v,1)]))}
  ${callout(`Vier bewegingen tegelijk, alle vier weg van het traditionele vrijgevestigde praktijkhouderschap
  als dominante vorm. Een dga blíjft praktijkhouder — alleen de rechtsvorm verandert; de groei van waarneming
  en loondienst betreft wél een verschuiving weg van het praktijkhouderschap zelf. De vrijgevestigden
  dalen met ${pct(Math.abs(w('beroepsgroep','sph_vrijgevestigd_daling')),1)}, de waarnemers stijgen met
  ${pct(w('beroepsgroep','sph_waarnemend_groei'),1)} en zijn inmiddels de grootste groep werkende huisartsen,
  de hidha's met ${pct(w('beroepsgroep','sph_hidha_groei'),1)} en de dga's met
  ${pct(w('beroepsgroep','sph_dga_groei'),1)}. Dat bevestigt onafhankelijk wat het kostprijsonderzoek liet
  zien: <a href="/beroepsgroep/#waarneming">de verschuiving gaat vooral naar waarneming</a>.`, 'inzicht')}
  ${methodDisclosure('Waarom de twee registers niet op elkaar aansluiten', `
    ${dataTable(T.sph_sluit_niet, [null, num, num, null])}`)}
</section>

<section id="personeelsmix">
  <h2>Loondienst is niet vanzelf de goedkopere keuze</h2>
  <p class="sub">De verschuiving naar loondienst wordt vaak besproken alsof zij de praktijk goedkoper uit
  laat komen. In een doorgerekend scenario is het omgekeerde het geval.</p>

  ${statContrast({
    pijl: 'tegenover',
    links:  { waarde: eur0(kw), label: 'waarnemer', eenheid: `werkgeverskosten per jaar · ${eur0(w('personeel','tarief_waarnemer_uur'))} per uur`,
              status: p('personeel','kosten_waarnemer_2025').status },
    rechts: { waarde: eur0(kh25), label: 'huisarts in dienst, schaal 9',
              eenheid: `werkgeverskosten per jaar · ${pct(meer(kh25),1)} meer`,
              status: p('personeel','kosten_hidha_2025').status },
    ratio: `Een structureel ingezette hidha is bij gangbare waarnemerstarieven vaak <b>duurder</b> voor de
      werkgever. Hij groeit binnen de cao door naar schaal 9 en brengt naast het salaris werkgeverslasten
      mee: pensioen, vakantie, scholing, doorbetaling bij ziekte en verzuimverzekering. In het concept voor
      2026 loopt het verschil op tot <b>${pct(meer(kh26),1)}</b> (${eur0(kh26)}).`
  })}

  ${callout(`De uitkomst hangt sterk af van het waarnemerstarief. Bij
  ${eur0(85)} per uur is de hidha ${pct(w('personeel','bandbreedte_laag'),1)} duurder, bij ${eur0(75)} per uur
  ${pct(w('personeel','bandbreedte_hoog'),1)}. De richting blijft in de hele bandbreedte dezelfde.`, 'letop')}

  ${methodDisclosure('De uitgangspunten van deze berekening', `
    <p class="small">Gelijke inzet voor beide vormen: ${num(w('personeel','dagen_week'))} werkdagen per week
    van ${num(w('personeel','uren_dag'))} uur, ${num(w('modelwissel','werkweken'))} werkweken per jaar voor de
    waarnemer, waarnemerstarief ${eur0(w('personeel','tarief_waarnemer_uur'))} per uur overdag. De hidha zit in
    salaristrede 9 met pensioenregeling SPH; de werkgeverslasten omvatten onder meer pensioen,
    werknemersverzekeringen en verzuimverzekering. Diensten zijn voor de werkgever zo gecorrigeerd dat zij in
    de vergelijking in beginsel quitte spelen.</p>
    ${table({
      cols:[{label:'Vergelijking'},{label:'Werkgeverskosten per jaar',r:true},{label:'Verschil',r:true}],
      rows:[
        [`Waarnemer 2025, ${eur0(w('personeel','tarief_waarnemer_uur'))} per uur`, eur0(kw), '—'],
        ['Hidha 2025, schaal 9', eur0(kh25), '+' + pct(meer(kh25),1)],
        ['Hidha 2026 concept, schaal 9', eur0(kh26), '+' + pct(meer(kh26),1)]
      ]})}
    <p class="small" style="margin-top:12px">De rekentool is openbaar. Hij wordt uitgegeven door
    <a href="https://debevlogenhuisartsen.nl/nieuws/h6k67dpd983wa67-kwdef" rel="noopener">Vereniging De
    Bevlogen Huisartsen</a> en in eigen vorm ook door de LHV als
    <a href="https://lhv.waarneemapp.nl" rel="noopener">Inkomstentool</a>; de LHV heeft hem door haar
    accountants laten doorrekenen. U hoeft onze uitkomst dus niet aan te nemen — vul de tool met uw eigen
    aannames en kijk wat eruit komt.</p>
    <p class="small">De uitkomst is gevoelig voor uren, salaristrede, uurtarief, pensioenkeuze en overige
    instellingen: verander één daarvan en het verschil verschuift. De LHV-versie rekent bovendien vanuit het
    <em>netto-inkomen van de huisarts</em>; de cijfers hierboven gaan over de <em>kosten voor de werkgever</em>.
    Dat zijn twee verschillende vragen aan hetzelfde model.</p>`)}
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
