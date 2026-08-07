/* ===========================================================================
   Route A van de bezoekersreis: "Hoe is het om huisarts te zijn?" (review §5).

   Zes stappen over het vak zelf: de werkweek, de patiëntcontacten (bewust nog
   zonder cijfer), de drie rollen, het inkomen, hoe het vak veranderde, en waar
   de dagelijkse werkelijkheid en de tariefberekening uit elkaar gaan lopen.
   De laatste stap geeft door aan route B (/rondleiding/).

   Stap 2 toont met opzet geen dagcijfer: er is nog geen landelijke bron die
   patiëntcontacten per gewerkte dag verdedigbaar telt. Pas als die er is,
   komt het getal — met status en rekenstap (aparte dataopdracht, fase 3).

   Alle waarden komen via verhaal.mjs uit de rekenlaag en de datalaag.
   =========================================================================== */
import { pagina } from '../lib/layout.mjs';
import { huisartsZijn } from '../lib/verhaal.mjs';
import { stappenreeks, uitleg } from '../lib/stappen.mjs';
import { stackedBar, begrippenBalk, meetlat, evidenceCard, callout,
         serieChart, bronLabel } from '../lib/components.mjs';
import { eur, eur0, num, pct } from '../lib/format.mjs';

export default function () {
  const d = huisartsZijn();
  const ww = d.werkweek;
  const r = d.rollen, ink = d.inkomen, vak = d.vak;

  /* Eerste en laatste gemeten waarde van een reeks, voor lopende tekst. */
  const eerste = s => s.waarden.find(v => v != null);
  const laatste = s => [...s.waarden].reverse().find(v => v != null);
  const jaarVan = (s, v) => vak.jaren[s.waarden.indexOf(v)];

  const haEerst = eerste(vak.huisartsen), haLaatst = laatste(vak.huisartsen);
  const phPiek = Math.max(...vak.praktijkhouders.waarden.filter(v => v != null));

  const stappen = [

    /* ---- Stap 1: de werkweek ---- */
    {
      id: 'stap-1',
      kop: 'De huisarts doet meer dan spreekuur',
      tekst: `Een praktijkhoudend huisarts werkt gemiddeld ${num(ww.bruto, 1)} uur per week.
        Maar een deel daarvan bestaat uit gesprekken in de spreekkamer; ook uitslagen,
        verwijzingen, dossiers, overleg, personeel, scholing en de dienst op de huisartsenpost
        kosten tijd.`,
      visual: stackedBar({
        fmt: v => num(v, 1), unit: ' uur',
        caption: `Waar de werkweek heen gaat (${num(ww.bruto, 1)} uur, gemeten in 2024)`,
        items: d.taken.rijen.map(([naam, uren, uitvraag]) => ({
          naam, waarde: uren,
          toelichting: uitvraag === 'ja' ? 'Zit in de NZa-urenuitvraag.' : 'Valt buiten de NZa-urenuitvraag.'
        }))
      }) + `<p class="bron" style="margin-top:10px">${bronLabel(d.taken)}</p>`,
      waarom: uitleg([
        ['Begrip', `Direct patiëntgebonden tijd is het contact zelf; indirect patiëntgebonden tijd
          is het werk eromheen, zoals verslaglegging, uitslagen en verwijzingen. Ondernemerschap is
          het runnen van de praktijk: personeel, huisvesting, administratie.`],
        ['Rekenregel', `Van de ${num(ww.bruto, 1)} gemeten uren heeft de dienst op de huisartsenpost
          (${num(ww.anw, 1)} uur) een eigen bekostiging; zonder die dienst blijft ${num(ww.netto, 1)} uur
          over. De NZa vroeg in het kostprijsonderzoek ${num(ww.uitgevraagd, 1)} uur aan categorieën uit.`],
        ['Nuance', `De verdeling van de niet-patiëntgebonden tijd is bij benadering afgelezen uit de
          figuren van het Nivel-onderzoek en telt daarom als schatting.`]
      ]),
      controleer: [
        { href: '/uren/#grenzen', label: 'de vier grenzen in de werkweek' },
        { href: '/uren/#scope', label: 'wat de uitvraag meet' }
      ]
    },

    /* ---- Stap 2: patiëntcontacten — bewust zonder cijfer ---- */
    {
      id: 'stap-2',
      kop: 'Hoeveel patiëntcontacten per dag? Dat cijfer verdient zorgvuldigheid',
      tekst: `Eén patiënt kan meerdere contacten hebben: in de spreekkamer, telefonisch, digitaal
        of op visite. Er is nog geen landelijke bron die dat per gewerkte dag verdedigbaar telt —
        daarom staat hier bewust nog geen getal.`,
      visual: begrippenBalk([
        { term: 'Consult', uitleg: 'gesprek in de praktijk' },
        { term: 'Telefonisch', uitleg: 'contact per telefoon' },
        { term: 'Digitaal', uitleg: 'e-consult of berichtenverkeer' },
        { term: 'Visite', uitleg: 'bezoek aan huis' }
      ]) + callout(`Een patiëntcontact is niet hetzelfde als de totale werklast. Rond ieder direct
        contact vindt ook verslaglegging, beoordeling van uitslagen, correspondentie en vervolgwerk
        plaats.`, 'letop'),
      waarom: uitleg([
        ['Wat een goed cijfer nodig heeft', `Een duidelijke noemer (per huisarts of per fte, per
          werkelijk gewerkte dag), een afbakening van welke contactsoorten meetellen, een peiljaar,
          en duidelijkheid over hoe indirect werk wordt behandeld.`],
        ['Waarom hier nog niets staat', `Een dagcijfer zonder die afbakening oogt precies maar is
          het niet. Deze site toont pas een getal als er een verdedigbare bron of een transparante
          eigen berekening is.`],
        ['Wat er komt', `De dataopdracht loopt: landelijke bronnen inventariseren (kandidaat: Nivel
          Zorgregistraties Eerste Lijn), de definitie vastleggen in de datalaag, en het cijfer hier
          plaatsen met status en rekenstap.`]
      ]),
      controleer: [
        { href: '/over/#methode', label: 'hoe deze site met cijfers omgaat' }
      ]
    },

    /* ---- Stap 3: drie rollen ---- */
    {
      id: 'stap-3',
      kop: 'Hetzelfde artsenwerk, drie verschillende rollen',
      tekst: `Praktijkhouder, huisarts in dienst (hidha) en waarnemer behandelen alle drie
        patiënten, maar dragen andere kosten en verantwoordelijkheden. Wie de praktijk draagt,
        draagt ook personeel, huisvesting en continuïteit.`,
      visual: `<div class="grid c3">
        ${evidenceCard({
          claim: 'Praktijkhouder',
          bewijs: `Behandelt patiënten én is verantwoordelijk voor personeel, huisvesting en
            continuïteit. Ontvangt geen salaris: wat na de praktijkkosten overblijft, is de winst.
            Regelt zelf pensioen en arbeidsongeschiktheidsdekking.`,
          href: '/praktijkhouderschap/', hrefLabel: 'Wie draagt de praktijk?' })}
        ${evidenceCard({
          claim: 'Hidha',
          bewijs: `Werknemer van de praktijk, met salaris volgens de Cao Hidha, vakantie, scholing
            en loondoorbetaling bij ziekte. Draagt geen ondernemingsrisico van de praktijk.`,
          href: '/beroepsgroep/#waarneming', hrefLabel: 'Loondienst of waarneming?' })}
        ${evidenceCard({
          claim: 'Waarnemer',
          bewijs: `Factureert meestal per uur en regelt zelf pensioen, verzekeringen en
            niet-declarabele tijd. Heeft doorgaans geen structurele praktijkverantwoordelijkheid.`,
          href: '/beroepsgroep/#waarneming', hrefLabel: 'Hoe waarneming groeide' })}
      </div>`,
      waarom: uitleg([
        ['Rekenvoorbeeld', `Bij ${num(r.dagenWeek)} dagen van ${num(r.urenDag)} uur per week,
          schaal 9 en een waarnemerstarief van ${eur0(r.tariefWaarnemer)} per uur kost een hidha de
          werkgever in 2025 ongeveer ${pct(r.kostenHidha25 / r.kostenWaarnemer - 1, 1)} meer dan een
          waarnemer (${eur0(r.kostenHidha25)} tegenover ${eur0(r.kostenWaarnemer)}); in het
          cao-concept voor 2026 loopt dat op richting ${pct(r.kostenHidha26 / r.kostenWaarnemer - 1, 1)}.`],
        ['Gevoeligheid', `Bij ${eur0(85)} per uur is het verschil ${pct(r.bandLaag, 1)}, bij
          ${eur0(75)} per uur ${pct(r.bandHoog, 1)}. De precieze uitkomst hangt af van rooster,
          schaal, pensioen en uurtarief.`],
        ['Begrip', `Hidha staat voor huisarts in dienst van een huisarts. De vergelijking hierboven
          gaat over wat de wérkgever betaalt, niet over wat de hidha of waarnemer zelf overhoudt.`]
      ]),
      controleer: [
        { href: '/praktijkhouderschap/#personeelsmix', label: 'het volledige rekenvoorbeeld met aannames' }
      ]
    },

    /* ---- Stap 4: inkomen ---- */
    {
      id: 'stap-4',
      kop: '‘Het inkomen van de huisarts’ is niet één getal',
      tekst: `Voor de drie rollen bestaan drie verschillende financiële begrippen: winst uit
        onderneming, cao-salaris en een factuurtarief per uur. Die zijn niet te vergelijken zonder
        erbij te zeggen wat er wél en niet in zit.`,
      visual: `<div class="grid c3">
        ${evidenceCard({
          claim: 'Praktijkhouder: winst uit onderneming',
          kern: eur0(ink.winstGem),
          bewijs: `gemiddeld in ${ink.winstJaar} (mediaan ${eur0(ink.winstMed)}), vóór
            inkomstenbelasting en vóór eigen pensioen en arbeidsongeschiktheidsdekking.`,
          status: ink.winstStatus,
          href: '/inkomen/#wat-huisarts-ondernemers-verdienen', hrefLabel: 'Naar de inkomenscijfers' })}
        ${evidenceCard({
          claim: 'Hidha: salaris volgens de cao',
          kern: eur0(r.kostenHidha25),
          bewijs: `kost een hidha de werkgever per jaar in het rekenvoorbeeld (schaal 9, 2025).
            Het brutosalaris van de hidha zelf ligt lager: werkgeverslasten en pensioen zitten in
            dit bedrag.`,
          status: 'afgeleid',
          href: '/praktijkhouderschap/#personeelsmix', hrefLabel: 'Naar het rekenvoorbeeld' })}
        ${evidenceCard({
          claim: 'Waarnemer: factuurtarief per uur',
          kern: eur0(r.tariefWaarnemer),
          bewijs: `per uur is een gangbaar tarief overdag. Een factuurtarief is geen
            netto-inkomen: pensioen, verzekeringen en niet-declarabele tijd komen er nog vanaf.`,
          status: 'schatting',
          href: '/beroepsgroep/#waarneming', hrefLabel: 'Over waarneming' })}
      </div>` + callout(`<strong>Een hoog jaarbedrag betekent niet automatisch een hoog
        uurinkomen.</strong> De werkweek van praktijkhouders werd in dezelfde periode langer; per
        gewerkt uur was de gemiddelde winst in ${ink.winstJaar} ${eur(ink.winstPerUur)}.
        <a href="/inkomen/#gecorrigeerd-voor-inflatie">De reeks gecorrigeerd voor inflatie</a>.`, 'inzicht'),
      waarom: uitleg([
        ['Begrip', `Winst is wat na de werkelijke praktijkkosten overblijft, vóór inkomstenbelasting
          en vóór voorzieningen die de ondernemer zelf betaalt.`],
        ['Methode', `De CBS-groep ‘zelfstandig ondernemers met personeel’ is de beste
          landelijke benadering van praktijkhouders, maar valt er niet exact mee samen:
          praktijkhouders met een bv worden anders geregistreerd.`],
        ['Nuance', `De mediaan ligt structureel onder het gemiddelde, en de winstreeks loopt tot en
          met ${ink.winstJaar}. Het effect van de modelwissel van 2025 is dus in geen enkel
          winstcijfer zichtbaar.`]
      ]),
      controleer: [
        { href: '/inkomen/#wat-huisarts-ondernemers-verdienen', label: 'wat huisarts-ondernemers verdienen' },
        { href: '/uurtarief/#niveaus', label: 'de vergoeding per gewerkt uur' }
      ]
    },

    /* ---- Stap 5: hoe het vak veranderde ---- */
    {
      id: 'stap-5',
      kop: 'Meer huisartsen, niet meer praktijkhouders',
      tekst: `Het aantal werkzame huisartsen steeg van ${num(haEerst)} in
        ${jaarVan(vak.huisartsen, haEerst)} naar ${num(haLaatst)} in
        ${jaarVan(vak.huisartsen, haLaatst)}; het aantal praktijkhouders piekte in
        ${jaarVan(vak.praktijkhouders, phPiek)} en daalt sindsdien licht. Praktijken werden groter
        en voller: de solopraktijk is bijna verdwenen en ${pct(vak.stop2024, 0)} van de praktijken
        had in 2024 een patiëntenstop.`,
      visual: serieChart({
        label: 'Werkzame huisartsen, praktijkhouders en praktijken',
        bron: vak.bron, vindplaats: vak.vindplaats, status: vak.status,
        jaren: vak.jaren,
        reeksen: [
          { naam: 'Werkzame huisartsen', waarden: vak.huisartsen.waarden },
          { naam: 'Praktijkhouders', waarden: vak.praktijkhouders.waarden, serie: 2 },
          { naam: 'Huisartsenpraktijken', waarden: vak.praktijken.waarden, serie: 3 }
        ]
      }, { fmt: num, hoogte: 320, yNul: true }),
      waarom: uitleg([
        ['De cijfers erbij', `De gemeten werkweek van de praktijkhouder ging van
          ${num(eerste(vak.werkweek2013), 1)} uur (${vak.werkweekJaren[0]}) naar
          ${num(laatste(vak.werkweek2013), 1)} uur (${vak.werkweekJaren[vak.werkweekJaren.length - 1]}).
          De kosten per praktijk stegen van ${eur0(vak.kosten2015)} (2015) naar
          ${eur0(vak.kosten2022)} (2022). Praktijken met een patiëntenstop: van
          ${pct(vak.stop2018, 0)} (2018) naar ${pct(vak.stop2024, 0)} (2024). Nog
          ${pct(vak.solo2024, 0)} van de huisartsen werkt in een solopraktijk.`],
        ['Wat dat betekent', `De huisartsenzorg groeide als organisatie, maar de verantwoordelijkheid
          voor personeel, huisvesting en continuïteit rust op een relatief kleiner deel van de
          beroepsgroep.`],
        ['Nuance', `De beroepenregistratie van het Nivel is in 2020 herzien; de reeksen kennen daar
          een breuk. Hoe die herziening doorwerkt staat op de beroepsgroepspagina.`]
      ]),
      controleer: [
        { href: '/beroepsgroep/#meer-huisartsen-minder-praktijken', label: 'meer huisartsen, minder praktijken' },
        { href: '/werkdruk/#zes-op-de-tien-praktijken-zitten-vol', label: 'de patiëntenstops' },
        { href: '/praktijkhouderschap/#praktijkvorm', label: 'de verdwijnende solopraktijk' }
      ]
    },

    /* ---- Stap 6: de brug naar de bekostiging ---- */
    {
      id: 'stap-6',
      kop: 'De werkelijkheid en de tariefberekening gebruiken niet dezelfde grenzen',
      tekst: `De gemeten werkweek is ${num(ww.bruto, 1)} uur; zonder de apart bekostigde dienst
        ${num(ww.netto, 1)} uur. De tariefberekening vraagt ${num(ww.uitgevraagd, 1)} uur uit en
        telt boven de ${num(ww.cap)} uur geen extra werktijdfactor — hier beginnen de dagelijkse
        werkelijkheid en de berekening uit elkaar te lopen.`,
      visual: meetlat({
        max: 60, fmt: v => num(v, 1), eenheid: ' uur',
        caption: 'Vier grenzen in dezelfde week',
        punten: [
          { waarde: ww.cap, label: 'Fte-plafond',
            toelichting: 'Boven deze grens stijgt de werktijdfactor niet verder.' },
          { waarde: ww.uitgevraagd, label: 'Uitgevraagd door de NZa', serie: 4,
            toelichting: 'De categorieën die het kostprijsonderzoek uitvroeg.' },
          { waarde: ww.netto, label: 'Werkweek zonder dienst', serie: 3,
            toelichting: 'De gemeten werkweek zonder de apart bekostigde dienst.' },
          { waarde: ww.bruto, label: 'Volledige werkweek', serie: 2,
            toelichting: 'Nivel-tijdsbestedingsonderzoek 2024.' }
        ]
      }),
      waarom: uitleg([
        ['Rekenregel', `Boven de ${num(ww.cap)} uur stijgt de werktijdfactor niet verder. Na de
          landelijke opschaling wordt bovendien een deel van de arbeidskostencomponent naar andere
          bekostiging verplaatst.`],
        ['Begrip', `Een fte is geen persoon, maar een rekeneenheid voor voltijd werk.`],
        ['Verder', `Hoe die berekening van begin tot eind werkt, staat in de andere rondleiding:
          de rekensom in zes stappen.`]
      ]),
      controleer: [
        { href: '/uren/#grenzen', label: 'de vier grenzen, met bronnen' },
        { href: '/uurtarief/#niveaus', label: 'wat dit per gewerkt uur betekent' }
      ]
    }
  ];

  const body = stappenreeks(stappen, {
    verderNaar: '/rondleiding/',
    verderLabel: 'Volg de rekensom in zes stappen →'
  }) + `

<section id="verder">
  <h2>Verder lezen</h2>
  <p class="sub">Elk cijfer in deze rondleiding komt uit de dossiers, waar de volledige reeksen,
  methodes en voorbehouden staan.</p>
  <div class="grid c3">
    ${evidenceCard({
      claim: 'De rekensom in zes stappen',
      bewijs: 'Hoe de vergoeding voor het werk van de praktijkhouder in de tarieven belandt.',
      href: '/rondleiding/', hrefLabel: 'Naar de rekensom'
    })}
    ${evidenceCard({
      claim: 'Werkdruk en patiëntenstops',
      bewijs: 'Hoeveel praktijken vol zitten, en wat er bekend is over werkdruk en verzuim.',
      href: '/werkdruk/', hrefLabel: 'Naar werkdruk'
    })}
    ${evidenceCard({
      claim: 'Zelf een cijfer controleren',
      bewijs: 'Alle bronnen, parameters en rekenstappen, doorzoekbaar en met status.',
      href: '/bronnen/', hrefLabel: 'Naar de bronnen'
    })}
  </div>
</section>`;

  return { pad: '/huisarts-zijn/', html: pagina({
    pad: '/huisarts-zijn/',
    titel: 'Hoe is het om huisarts te zijn?',
    eyebrow: 'Rondleiding',
    h1: 'Hoe is het om huisarts te zijn? Het vak in zes stappen',
    omschrijving: 'Wat een praktijkhoudend huisarts doet, wat de drie rollen in het vak verdienen ' +
      'en dragen, en hoe het vak veranderde — in zes stappen, met bronnen bij elk cijfer.',
    lede: `Deze rondleiding gaat over het vak zelf: de werkweek, de rollen, het inkomen en hoe het
      veranderde. Elke stap toont één kerngetal en maximaal twee zinnen uitleg; wie meer wil weten,
      klapt per stap &ldquo;Waarom?&rdquo; open of controleert het cijfer in het dossier. De laatste
      stap leidt door naar de rekensom achter de bekostiging.`,
    status: ['Zes stappen', 'eigen samenstelling uit gepubliceerde bronnen',
             'leestijd circa vijf minuten'],
    acties: { primair:   { href: '#stap-1', label: 'Begin bij stap 1' },
              secundair: { href: '/rondleiding/', label: 'Liever meteen de rekensom?' } },
    body }) };
}
