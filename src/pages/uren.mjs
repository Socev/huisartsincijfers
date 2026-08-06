import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, callout, dataTable, table, tile, barChart, compareBars, bronLabel, stackedBar,
         anwNoot, trechter, meetlat, methodDisclosure, begrippenBalk } from '../lib/components.mjs';
import { nacKeten, werkweek } from '../lib/metrics.mjs';
import { num, pct, uur, eur, esc } from '../lib/format.mjs';

export default function () {
  const T = data.uren.tabellen;
  const u = werkweek();
  const k = nacKeten(2025);
  const G = T.voltijd_groot;
  const inScope = T.nivel_taken.rijen.filter(r => r[2] === 'ja').reduce((s,r)=>s+r[1],0);
  const buiten  = T.nivel_taken.rijen.filter(r => r[2] === 'nee').reduce((s,r)=>s+r[1],0);

  const body = `
<section id="grenzen">
  <h2>Vier grenzen, en ze meten niet hetzelfde</h2>
  <p class="sub">Dezelfde eenheid — uren per week — maar vier verschillende dingen. Ze staan hier op één
  schaal omdat het verschil ertussen de boodschap is; ze tellen niet bij elkaar op.</p>
  ${panel(meetlat({
    max: u.bruto,
    eenheid: ' uur',
    fmt: v => num(v, 1),
    punten: [
      { waarde: u.cap, serie: 2, label: 'Fte-plafond',
        toelichting: 'Boven deze grens stijgt de werktijdfactor niet verder; 1,0 fte is bereikt.' },
      { waarde: u.uitgevraagd, serie: 4, label: 'NZa-uitgevraagde categorieën',
        toelichting: 'Gemiddelde urenopgave binnen de categorieën waar de NZa naar vraagt. Geen meting van de werkweek.' },
      { waarde: u.netto, serie: 3, label: 'Werkweek exclusief dienst',
        toelichting: 'De gemeten werkweek minus de apart bekostigde dienst op de huisartsenpost.' },
      { waarde: u.bruto, serie: 1, label: 'Volledige Nivel-werkweek',
        toelichting: 'Tijdsbestedingsonderzoek 2024, inclusief de dienst op de huisartsenpost.' }
    ],
    caption: `Vier urengrenzen voor de praktijkhoudend huisarts, uren per week.`
  }))}

  ${callout(`<strong>${pct(u.bovenCapAandeel, 0)} van de eigenaren geeft meer dan ${num(u.cap)} uur per week
    op.</strong> Voor die groep ligt de opgave gemiddeld ${num(u.bovenCapUren, 1)} uur boven de grens, maar de
    werktijdfactor blijft 1,0. Die uren tellen dus niet mee in de tariefonderbouwing.`, 'inzicht')}

  <p class="small">Het verschil tussen ${num(u.netto,1)} en ${num(u.uitgevraagd,1)} uur is
  <b>${num(u.nietUitgevraagd,1)} uur per week</b> die nergens in beeld komt: bestuur, extern overleg, scholing
  en een deel van het overige werk. Dat is geen meetfout — het is het gevolg van waar de uitvraag naar vraagt.</p>
</section>

<section id="scope">
  <h2>De werkweek, en welk deel ervan de NZa telt</h2>
  <p class="sub">Het Nivel meet met momentmetingen hoeveel een praktijkhoudend huisarts werkt. De NZa vraagt in
  het uitvraagformat naar drie dingen: zorg verlenen, praktijk managen en inzet apotheek. Onderstaande balk is
  de volledige gemeten werkweek; het gekleurde deel is wat de tariefonderbouwing ziet.</p>
  ${panel(stackedBar({
    items:[
      { naam:'Uitgevraagd door de NZa', kort:'Uitgevraagd', waarde:u.uitgevraagd,
        toelichting:'Zorg verlenen, praktijk managen en inzet apotheek. Zit in de overdagtarieven.' },
      { naam:'Dienst op de huisartsenpost', kort:'Anw-dienst', waarde:u.anw,
        toelichting:'Aparte bekostiging; bewust buiten de overdagtarieven gehouden.' },
      { naam:'Bestuur, extern overleg, scholing, overig', kort:'Nergens belegd', waarde:u.nietUitgevraagd,
        toelichting:'Valt buiten alle drie de categorieen waar de NZa naar vraagt, en buiten de anw-bekostiging.' }
    ],
    fmt: v => num(v,1) + ' u', unit:' per week',
    caption:`Werkweek van de praktijkhoudend huisarts, uren per week. Totaal ${num(u.bruto,1)} uur volgens het Nivel.`
  }))}
  ${panel(dataTable(T.werkweek_opbouw, [null, v=>num(v,1), null]))}
  ${anwNoot(u.bruto, u.anw)}
  <p class="small">De NZa publiceert zelf ${num(u.uitgevraagd,1)} uur per fte. Dat is de gemiddelde urenopgave
  binnen de uitgevraagde categorieën, en klopt met de eigen vraagstelling; het is geen meting van de werkweek.
  Wie beide getallen naast elkaar legt zonder dat onderscheid, vergelijkt een volledige werkweek met een
  uitsnede ervan.</p>
</section>

<section>
  <h2>Van ruim zevenduizend huisartsen naar zesduizend arbeidskostencomponenten</h2>
  <p class="sub">Nederland telt ruim zevenduizend praktijkhoudend huisartsen. In de tariefonderbouwing komen daar
  aanzienlijk minder normatieve arbeidskostencomponenten uit. Onderweg gaat er drie keer iets af: eerst door
  deeltijd en de aftopping op 1,0 fte, dan door de schoning op omzet, en tot slot doordat maar een deel van de
  omzet binnen de honderd procent een NZa-maximumtarief kent. De twee registers verschillen overigens al bij de
  eerste stap: <a href="/beroepsgroep/">het pensioenfonds telt er ruim duizend minder</a>.</p>
  ${panel(trechter({
    stappen:[
      { label:'Praktijkhoudend huisartsen (personen)', waarde:k.personen, serie:1, nadruk:true,
        toelichting:'Mensen, geen rekeneenheden. Het pensioenfonds telt er ruim duizend minder.' },
      { label:`Nac's vóór schoning (rekeneenheden)`, waarde:k.brutoNac, serie:3,
        toelichting:`Ingeschreven verzekerden gedeeld door ${num(k.perFte)} per fte — zie de herkomst op de arbeidskostenpagina`,
        reden:'deeltijd en de aftopping van de werktijdfactor op 1,0' },
      { label:`Nac's binnen de 100%`, waarde:k.binnen100, serie:4,
        toelichting:'Na schoning buiten de honderd procent en de correctie poh-ggz', reden:'schoning op omzet' },
      { label:'Gedekt door NZa-maximumtarieven', waarde:k.maxTarief, serie:2, nadruk:true,
        toelichting:'De rest wordt verondersteld uit vrij onderhandelbare omzet te komen',
        reden:`${pct(w('nac','tarief_gereguleerd'),1)} van de omzet is tarief gereguleerd` }
    ],
    fmt: v => num(v, 0), caption:`Van beroepsgroep naar tariefonderbouwing, cijfers voor ${k.jaar}.
      Let op de eenheden: de eerste stap telt mensen, de rest rekeneenheden.`
  }))}
  ${callout(`De gemiddelde praktijkhouder werkt ${num(u.bruto,1)} uur per week volgens het
  Nivel en geeft er ${num(u.uitgevraagd,1)} op in het kostprijsonderzoek. Toch komen ruim
  zevenduizend van hen samen niet verder dan ${num(k.maxTarief,0)} volledig door tarieven gedekte
  arbeidskostencomponenten. <strong>Het verschil zit niet in te weinig werken, maar in twee rekenregels:
  de aftopping en de schoning.</strong> <a href="/arbeidskosten/#herkomst">Waar dat aantal precies vandaan komt,
  met de controle en de marge erbij</a>.`)}
</section>

<section>
  <h2>Wat de microdata laten zien</h2>
  <p class="sub">De onderliggende opgaven van de huisarts-eigenaren in het kostprijsonderzoek. De som van de
  afgetopte werktijdfactoren komt uit op ${num(w('uren','fte_gecapt'),2)} fte, precies het getal dat de NZa in
  Tabel 9 publiceert — een controle dat wij met dezelfde grondslag rekenen.</p>
  ${panel(dataTable(T.opgave_verdeling, [null, v=>pct(v,1)]))}
  <p class="small">Zichtbare zelfrapportage-artefacten: bij toeval zou ongeveer een vijfde van de opgaven op een
  veelvoud van vijf uitkomen. Dat is geen bewijs dat de meting onbruikbaar is, wel dat het om schattingen achteraf gaat.</p>
</section>

<section>
  <h2>Identieke opgaven binnen maatschappen</h2>
  <p class="sub">Bij ruim de helft van de tweemansmaatschappen geven beide maten exact hetzelfde aantal uren op.</p>
  ${panel(dataTable(T.maatschappen, [null, v=>pct(v,1)]))}
  ${callout(`<strong>Voorzichtig hiermee.</strong> Slechts dertig procent van die identieke waarden is een rond
  getal — ze liggen op 39, 34, 38 en 46 uur. Dat wijst eerder op één opgave die op praktijkniveau is ingevuld en
  over de maten gekopieerd, dan op afronding. Maar twee maten die werkelijk evenveel werken is niet vreemd.
  Dit is een aanwijzing, geen bevinding.`)}
</section>

<section>
  <h2>De aftopping op 1,0 fte</h2>
  <p class="sub">De werktijdfactor is het aantal opgegeven uren gedeeld door 36, gemaximeerd op 1. Wie meer werkt,
  telt niet meer mee. Het gaat om ${pct(w('uren','boven_cap'),0)} van de eigenaren, gemiddeld
  ${num(w('uren','boven_cap_uren'),1)} uur per week boven de grens.</p>
  ${panel(compareBars({
    items:[
      { label:'Som fte zonder aftopping', waarde:w('uren','fte_ongecapt'), serie:2 },
      { label:'Som fte met aftopping — zoals ingerekend', waarde:w('uren','fte_gecapt'), serie:1,
        toelichting:'NZa Tabel 9' }
    ], fmt:v=>num(v,1), eenheid:' fte', caption:'Fte praktijkhoudend huisarts in de onderzoeksgroep van het kostprijsonderzoek.'
  }))}
  <p class="small" style="margin-top:6px">Verschil: ${num(w('uren','fte_ongecapt')-w('uren','fte_gecapt'),1)} fte,
  ofwel ${pct(w('uren','fte_ongecapt')/w('uren','fte_gecapt')-1,1)} bovenop de ingerekende fte.
  ${bronLabel(p('uren','fte_ongecapt'))}</p>
  ${callout(`Voor personeel rekent de NZa uren om naar fte tegen 38 uur maal 52 weken (cao huisartsenzorg) of
  40 maal 52 (cao hidha), en de werkelijke loonkosten staan gewoon in de boeken. Voor de praktijkhouder geldt
  36 uur maal 46 weken, en dan afgetopt. <strong>De praktijkhouder is de enige in de praktijk wiens extra uren
  nergens in de kostprijs terechtkomen.</strong>`)}
</section>

<section id="honderd-voltijders">
  <h2>Hoe dat uitpakt, in een tabel van de NZa zelf</h2>
  <p class="sub">Om aan te tonen dát er niets weglekt, publiceerde de NZa een technische bijlage waarin zij
  honderd voltijd werkende praktijkhouders uit de grootste praktijken op een rij zet, gesorteerd van de
  kortste naar de langste werkweek. Zij deelt ze in vier groepen van vijfentwintig. <b>Alle vier de groepen
  krijgen precies vijfentwintig volledige arbeidsvergoedingen ingerekend</b> — één per persoon. Het enige
  wat tussen de groepen verschilt, is hoeveel uur ze werken.</p>
  ${panel(compareBars({
    items: G.rijen.slice(0, 4).map((r, i) => ({
      label: r[0], waarde: r[3], serie: i === 3 ? 2 : i === 0 ? 3 : 1,
      toelichting: `${num(r[1],0)} uur samen, ${num(r[2])} volledige vergoedingen — dat is ${eur(r[4])} per gewerkt uur.`
    })),
    fmt: v => num(v,1), eenheid:' uur per vergoeding',
    caption:'Uren die één volledige arbeidsvergoeding moeten dragen, per groep van 25 voltijd werkende praktijkhouders.'
  }))}
  ${callout(`<strong>De groep met de langste werkweken werkt ${pct(G.rijen[3][3]/G.rijen[0][3]-1,0)} meer uren
  dan de groep met de kortste, en krijgt exact evenveel betaald.</strong> Omgerekend zakt de arbeidsvergoeding
  van ${eur(G.rijen[0][4])} naar ${eur(G.rijen[3][4])} per gewerkt uur — binnen dezelfde groep, die de NZa
  allemaal ‘voltijd werkend’ noemt. Dit is de aftopping, zichtbaar in de bijlage waarmee de NZa het bezwaar
  van het College van Beroep juist wilde weerleggen.`, 'inzicht')}
  ${panel(dataTable(T.voltijd_groot, [null, v=>num(v,0), num, v=>num(v,1), eur]))}
</section>

<section>
  <h2>Hoeveel uur telt één fte?</h2>
  ${panel(dataTable(T.uren_per_fte, [null, num]))}
</section>`;

  return { pad:'/uren/', html: pagina({
    pad:'/uren/', titel:'Uren en de fte-definitie', eyebrow:'Werkweek, uitvraag en fte-grens',
    h1:`${num(u.netto,1)} uur gewerkt. ${num(u.uitgevraagd,1)} uur in beeld. Boven ${num(u.cap)} uur telt niet extra mee.`,
    status:[`Werkweek gemeten in 2024`, `uitvraag: kostprijsonderzoek 2022`, `aftopping: ${p('uren','fte_uren_norm').status}`],
    omschrijving:'Waarom de NZa 46,2 uur per fte opgeeft terwijl Nivel 55,7 uur meet, en wat de aftopping op 1,0 fte betekent.',
    lede:`Het Nivel meet voor praktijkhouders ${num(u.bruto,1)} uur per week. Na aftrek van ${num(u.anw,1)} uur
      apart bekostigde dienst op de huisartsenpost resteert ${num(u.netto,1)} uur. De NZa rapporteert gemiddeld
      ${num(u.uitgevraagd,1)} uur binnen haar uitgevraagde categorieën, en begrenst de werktijdfactor op 1,0
      vanaf ${num(u.cap)} uur.`,
    body })};
}
