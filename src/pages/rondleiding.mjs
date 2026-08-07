/* ===========================================================================
   Route B van de bezoekersreis: "De rekensom in zes stappen" (review §6-§7).

   Eén pagina, alle stappen in de HTML. Per stap drie niveaus van diepgang:
   standaard één kop + één kerngetal + maximaal twee zinnen; uitklapbaar
   "Waarom?" met rekenregel, begrip en nuance; en "Controleer dit" naar het
   exacte anker in het dossier. Geen autoplay, geen modal, geen cookie; de
   navigatie is een set gewone links en werkt zonder JavaScript.

   Alle waarden komen uit de rekenlaag via verhaal.mjs — hier staat geen
   kerngetal getypt.
   =========================================================================== */
import { pagina } from '../lib/layout.mjs';
import { rekensom } from '../lib/verhaal.mjs';
import { stap, stappenreeks, uitleg } from '../lib/stappen.mjs';
import { statContrast, meetlat, trechter, compareBars,
         evidenceCard } from '../lib/components.mjs';
import { eur, num, pct } from '../lib/format.mjs';

const rond100 = v => Math.round(v / 100) * 100;

export default function () {
  const d = rekensom();
  const ww = d.werkweek;

  const stappen = [

    /* ---- Stap 1: mensen en hun werkweek ---- */
    {
      id: 'stap-1',
      kop: `Circa ${num(rond100(d.personen))} praktijkhouders doen het werk`,
      tekst: `Nederland telt ongeveer ${num(rond100(d.personen))} praktijkhoudend huisartsen:
        huisartsen met een eigen praktijk. Zij werken gemiddeld ${num(ww.netto, 1)} uur per week,
        de dienst op de huisartsenpost niet meegerekend.`,
      visual: statContrast({
        links:  { waarde: num(d.personen), label: 'praktijkhoudend huisartsen',
                  eenheid: 'mensen', status: d.personenStatus },
        rechts: { waarde: num(ww.netto, 1), label: 'uur per week, gemiddeld',
                  eenheid: 'zonder de dienst op de huisartsenpost', status: ww.status.netto },
        pijl: '×'
      }),
      waarom: uitleg([
        ['Rekenregel', `Nivel mat in 2024 een werkweek van ${num(ww.bruto, 1)} uur. Daar gaat
          ${num(ww.anw, 1)} uur dienst op de huisartsenpost af, omdat die zorg een eigen bekostiging
          heeft: ${num(ww.bruto, 1)} − ${num(ww.anw, 1)} = ${num(ww.netto, 1)} uur.`],
        ['Begrip', `Een praktijkhouder is een huisarts met een eigen praktijk. Huisartsen in
          loondienst en waarnemers doen ook huisartsenwerk, maar deze rekensom gaat over de
          vergoeding voor de arbeid van de praktijkhouder.`],
        ['Nuance', `De werkweek is op drie momenten gemeten: 2013, 2018 en 2024. Het aantal
          praktijkhouders na 2023 is een schatting op basis van de Nivel-registratie.`]
      ]),
      controleer: [
        { href: '/uren/#grenzen', label: 'de gemeten werkweek' },
        { href: '/beroepsgroep/#functies', label: 'het aantal praktijkhouders' }
      ]
    },

    /* ---- Stap 2: de aftopping ---- */
    {
      id: 'stap-2',
      kop: `Boven de ${num(ww.cap)} uur telt een uur niet extra mee`,
      tekst: `De NZa rekent niet in personen maar in fte: een rekeneenheid die hier bij
        ${num(ww.cap)} uur per week vol is. Wat een praktijkhouder daarboven werkt, maakt de
        rekeneenheid niet groter.`,
      visual: meetlat({
        max: 60, fmt: v => num(v, 1), eenheid: ' uur',
        caption: 'Drie grenzen in dezelfde week',
        punten: [
          { waarde: ww.cap, label: 'Grens van één fte',
            toelichting: 'De werktijdfactor is afgetopt op 1,0.' },
          { waarde: ww.uitgevraagd, label: 'Uitgevraagd door de NZa', serie: 4,
            toelichting: 'De uren die het kostprijsonderzoek uitvroeg.' },
          { waarde: ww.netto, label: 'Gemeten werkweek', serie: 3,
            toelichting: 'Nivel 2024, zonder de dienst op de huisartsenpost.' }
        ]
      }),
      waarom: uitleg([
        ['Rekenregel', `Wie ${num(ww.netto, 1)} uur werkt, telt even zwaar mee als wie
          ${num(ww.cap)} uur werkt: als één fte. ${pct(d.bovenCapAandeel, 0)} van de
          praktijkhouders werkt boven die grens.`],
        ['Begrip', `Een fte is geen persoon, maar een rekeneenheid voor voltijd werk.`],
        ['Nuance', `De aftopping is een keuze in het model, geen telfout. Het gevolg: er worden
          minder voltijdsplaatsen geteld dan er aan gewerkte uren tegenover staat. Ook de uitvraag
          zelf (${num(ww.uitgevraagd, 1)} uur) is smaller dan de gemeten werkweek.`]
      ]),
      controleer: [
        { href: '/uren/#de-aftopping-op-1-0-fte', label: 'de aftopping op 1,0 fte' },
        { href: '/uren/#scope', label: 'wat de uitvraag meet' }
      ]
    },

    /* ---- Stap 3: de telling en de landelijke opschaling ---- */
    {
      id: 'stap-3',
      kop: `De NZa telde één voltijdsplaats per ${num(d.perFte)} patiënten`,
      tekst: `In het kostprijsonderzoek kwam de NZa, na die aftopping, uit op één voltijds
        werkende praktijkhouder per ${num(d.perFte)} patiënten. Landelijk levert dat voor
        ${d.jaar} circa ${num(rond100(d.brutoNac))} volledige arbeidsvergoedingen op.`,
      visual: statContrast({
        links:  { waarde: num(d.ingeschrevenen), label: 'ingeschreven verzekerden',
                  eenheid: 'heel Nederland' },
        rechts: { waarde: num(Math.round(d.brutoNac)), label: 'volledige arbeidsvergoedingen',
                  eenheid: 'terecht geacht door de NZa', status: d.brutoNacStatus },
        ratio: `${num(d.ingeschrevenen)} ingeschreven verzekerden ÷ ${num(d.perFte)} patiënten
          per voltijdsplaats = <b>${num(Math.round(d.brutoNac))}</b>.`
      }),
      waarom: uitleg([
        ['Begrip', `Zo'n volledige arbeidsvergoeding heet de normatieve arbeidskostencomponent,
          kortweg nac: het bedrag dat de NZa in de kostprijs opneemt voor de arbeid van de
          praktijkhouder.`],
        ['Rekenregel', `De verhouding van ${num(d.perFte)} patiënten per voltijdsplaats is in het
          onderzoek van 2022 gemeten bij een steekproef van praktijken; de landelijke opschaling
          deelt alle ingeschreven verzekerden door dat getelde verhoudingsgetal.`],
        ['Nuance', `${num(d.perFte)} is een telling, geen norm voor hoeveel patiënten een praktijk
          hoort te hebben. De oude normpraktijk van ${num(d.delerOud)} patiënten is met het nieuwe
          model losgelaten.`]
      ]),
      controleer: [
        { href: '/arbeidskosten/#herkomst', label: 'waar het aantal vandaan komt' },
        { href: '/arbeidskosten/#personen-naar-fte', label: 'van personen naar fte' }
      ]
    },

    /* ---- Stap 4: de drie niveaus ---- */
    {
      id: 'stap-4',
      kop: 'Terecht geacht, in de basistarieven, via NZa-maximumtarieven',
      tekst: `Van de circa ${num(rond100(d.brutoNac))} nac's die de NZa terecht acht, komen er
        circa ${num(rond100(d.binnen100))} in de basistarieven; ${pct(d.aandeelGeschoond, 2)}
        hoort volgens haar bij werk dat uit andere bekostiging wordt betaald. Van wat overblijft
        staat ${pct(d.aandeelTariefGereguleerd, 1)} achter NZa-maximumtarieven: circa
        ${num(rond100(d.maxTarief))}.`,
      visual: trechter({
        fmt: v => num(Math.round(v)),
        caption: `Volledige arbeidsvergoedingen (nac's), ${d.jaar}`,
        stappen: [
          { label: 'Terecht geacht door de NZa', waarde: d.brutoNac,
            toelichting: 'Alle volledige arbeidsvergoedingen na de telling en de opschaling.' },
          { label: 'In de basistarieven', waarde: d.binnen100, serie: 3,
            reden: `schoning: ${pct(d.aandeelGeschoond, 2)} is verplaatst naar andere bekostiging` },
          { label: 'Via NZa-maximumtarieven', waarde: d.maxTarief, serie: 2,
            reden: `${pct(d.aandeelTariefGereguleerd, 1)} van de kosten is tariefgereguleerd;
              de rest moet uit vrije tarieven komen` }
        ]
      }),
      waarom: uitleg([
        ['Begrip', `Bij schoning haalt de NZa een deel van de kosten uit de basistariefberekening,
          omdat dat werk volgens haar uit een andere geldstroom wordt betaald — zoals de griepprik
          en het bevolkingsonderzoek.`],
        ['Begrip', `Tariefgereguleerd betekent dat de NZa een maximumtarief vaststelt. Voor vrije
          tarieven bestaat zo'n wettelijke bovengrens niet — en dus ook geen onderbouwde
          kostendekking.`],
        ['Nuance', `Verplaatst is niet hetzelfde als geschrapt, maar ook niet hetzelfde als
          gegarandeerd: of dat andere geld een praktijk bereikt, hangt af van contracten.`]
      ]),
      controleer: [
        { href: '/arbeidskosten/#schoning', label: 'hoe de schoning werkt' },
        { href: '/omzet/#het-scope-model', label: 'het scope-model' }
      ]
    },

    /* ---- Stap 5: de delers van de modelwissel ---- */
    {
      id: 'stap-5',
      kop: `De deler ging van ${num(d.delerOud)} naar ${num(d.perFte)} — effectief ${num(d.delerNieuw)}`,
      tekst: `Tot en met 2024 zat er per ${num(d.delerOud)} patiënten één volledige
        arbeidsvergoeding in de tarieven. Vanaf ${d.jaar} is de deler ${num(d.perFte)}, en na de
        schoning zit er effectief per ${num(d.delerNieuw)} patiënten één volledige vergoeding in
        de basistarieven.`,
      visual: compareBars({
        fmt: num, eenheid: ' patiënten',
        caption: 'Patiënten per volledige arbeidsvergoeding — hoe hoger de deler, hoe minder vergoedingen',
        items: [
          { label: 'Tot en met 2024 (normpraktijk van het model 2015)', waarde: d.delerOud },
          { label: `Vanaf ${d.jaar}, vóór schoning (telling van het onderzoek 2022)`,
            waarde: d.perFte, serie: 3 },
          { label: `Vanaf ${d.jaar}, effectief in de basistarieven`,
            waarde: d.delerNieuw, serie: 2 }
        ]
      }),
      waarom: uitleg([
        ['Rekenregel', `${num(d.perFte)} ÷ ${pct(d.aandeelBinnen100, 2)} ≈ ${num(d.delerNieuw)}:
          de schoning maakt de effectieve deler groter.`],
        ['Begrip', `${num(d.delerOud)} was de normpraktijk uit het kostprijsmodel van 2015;
          ${num(d.perFte)} komt uit de telling van het onderzoek van 2022.`],
        ['Nuance', `Het normbedrag per fte steeg tegelijk. De daling zit dus niet in het bedrag
          per vergoeding, maar in het aantal vergoedingen dat wordt ingerekend.`]
      ]),
      controleer: [
        { href: '/arbeidskosten/#delers', label: 'de verantwoording van de delers' },
        { href: '/modelwissel/#twee-modellen-twee-manieren-van-tellen', label: 'twee modellen, twee manieren van tellen' }
      ]
    },

    /* ---- Stap 6: per gewerkt uur ---- */
    {
      id: 'stap-6',
      kop: `Per gewerkt uur: ${eur(Math.abs(d.knik.totaal))} minder in de basistarieven`,
      tekst: `Deel het landelijke bedrag door alle gewerkte uren, en de arbeidsvergoeding in de
        basistarieven daalt van ${eur(d.uurBasis2024)} per uur in 2024 naar ${eur(d.uurBasis2025)}
        in ${d.jaar}. Van dat verschil komt ${eur(Math.abs(d.knik.minderTerecht))} doordat de NZa
        minder vergoedingen terecht acht, en ${eur(Math.abs(d.knik.verplaatst))} is verplaatst
        naar andere bekostiging.`,
      visual: trechter({
        fmt: eur,
        caption: 'De knik van 2024 op 2025, per gewerkt uur, in twee delen',
        stappen: [
          { label: 'In de basistarieven, per gewerkt uur, 2024', waarde: d.uurBasis2024 },
          { label: `Terecht geacht, ${d.jaar}`, waarde: d.uurTerecht2025, serie: 3,
            reden: 'de NZa acht minder volledige vergoedingen terecht' },
          { label: `In de basistarieven, ${d.jaar}`, waarde: d.uurBasis2025, serie: 2,
            reden: 'verplaatst naar andere bekostiging, niet geschrapt' }
        ]
      }),
      waarom: uitleg([
        ['Rekenregel', `Alle nac's maal het normbedrag, gedeeld door alle uren die praktijkhouders
          samen werken: personen × werkweek zonder dienst × ${num(d.werkweken)} weken per jaar.`],
        ['Begrip', `Dit is geen uitbetaald uurloon. Het is wat de tariefonderbouwing per gewerkt
          uur aan arbeidsvergoeding bevat; wat een praktijkhouder overhoudt, hangt af van praktijk
          en bedrijfsvoering.`],
        ['Nuance', `Naast deze rekenlijnen staat in het dossier ook wat praktijkhouders werkelijk
          aan winst realiseerden — die vergelijking hoort erbij.`]
      ]),
      controleer: [
        { href: '/uurtarief/#niveaus', label: 'de drie niveaus per gewerkt uur' },
        { href: '/uurtarief/#waar-de-knik-vandaan-komt', label: 'de knik ontleed' }
      ]
    }
  ];

  const body = stappenreeks(stappen) + `

<section id="verder">
  <h2>Verder lezen</h2>
  <p class="sub">De zes stappen hierboven zijn de korte route. Elk cijfer komt uit dezelfde
  rekenlaag als de dossiers, waar de volledige reeksen, methodes en voorbehouden staan.</p>
  <div class="grid c3">
    ${evidenceCard({
      claim: 'De arbeidsvergoeding per gewerkt uur, 2018-2026',
      bewijs: 'Het volledige dossier: de drie niveaus als reeks, naast de gerealiseerde winst.',
      href: '/uurtarief/', hrefLabel: 'Naar het dossier'
    })}
    ${evidenceCard({
      claim: `Wat er in ${d.jaar} precies veranderde`,
      bewijs: 'De modelwissel: twee kostprijsmodellen, twee manieren van tellen.',
      href: '/modelwissel/', hrefLabel: 'Naar de modelwissel'
    })}
    ${evidenceCard({
      claim: 'Zelf een cijfer controleren',
      bewijs: 'Alle bronnen, parameters en rekenstappen, doorzoekbaar en met status.',
      href: '/bronnen/', hrefLabel: 'Naar de bronnen'
    })}
  </div>
</section>`;

  return { pad: '/rondleiding/', html: pagina({
    pad: '/rondleiding/',
    titel: 'De rekensom in zes stappen',
    eyebrow: 'Rondleiding',
    h1: 'Hoe wordt de huisartsenzorg bekostigd? De rekensom in zes stappen',
    omschrijving: `Van circa ${num(rond100(d.personen))} praktijkhouders naar de arbeidsvergoeding ` +
      `per gewerkt uur: de bekostiging van de huisartsenzorg in zes controleerbare stappen.`,
    lede: `Deze rondleiding volgt de berekening van begin tot eind: van de mensen die het werk
      doen tot het bedrag per gewerkt uur dat de tarieven daarvoor vergoeden. Elke stap toont één
      kerngetal en maximaal twee zinnen uitleg. Wie meer wil weten, klapt per stap
      &ldquo;Waarom?&rdquo; open — en elk cijfer heeft een link om het te controleren.`,
    status: [`Prijspeil en grondslagen ${d.jaar}`, 'eigen berekening uit gepubliceerde bronnen',
             'leestijd circa vijf minuten'],
    acties: { primair:   { href: '#stap-1', label: 'Begin bij stap 1' },
              secundair: { href: '/bronnen/', label: 'Liever zelf zoeken? Naar de bronnen' } },
    body }) };
}
