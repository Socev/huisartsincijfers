import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, callout, dataTable, table, tile, barChart, compareBars, bronLabel, stackedBar, anwNoot, trechter } from '../lib/components.mjs';
import { num, pct, uur, eur, esc } from '../lib/format.mjs';

export default function () {
  const T = data.uren.tabellen;
  const inScope = T.nivel_taken.rijen.filter(r => r[2] === 'ja').reduce((s,r)=>s+r[1],0);
  const buiten  = T.nivel_taken.rijen.filter(r => r[2] === 'nee').reduce((s,r)=>s+r[1],0);

  const body = `
<section>
  <h2>De werkweek, en welk deel ervan de NZa telt</h2>
  <p class="sub">Het Nivel meet met momentmetingen hoeveel een praktijkhoudend huisarts werkt. De NZa vraagt in
  het uitvraagformat naar drie dingen: zorg verlenen, praktijk managen en inzet apotheek. Onderstaande balk is
  de volledige gemeten werkweek; het gekleurde deel is wat de tariefonderbouwing ziet.</p>
  ${panel(stackedBar({
    items:[
      { naam:'Uitgevraagd door de NZa', kort:'Uitgevraagd', waarde:46.2,
        toelichting:'Zorg verlenen, praktijk managen en inzet apotheek. Zit in de overdagtarieven.' },
      { naam:'Dienst op de huisartsenpost', kort:'Anw-dienst', waarde:2.6,
        toelichting:'Aparte bekostiging; bewust buiten de overdagtarieven gehouden.' },
      { naam:'Bestuur, extern overleg, scholing, overig', kort:'Nergens belegd', waarde:6.9,
        toelichting:'Valt buiten alle drie de categorieen waar de NZa naar vraagt, en buiten de anw-bekostiging.' }
    ],
    fmt: v => num(v,1) + ' u', unit:' per week',
    caption:'Werkweek van de praktijkhoudend huisarts, uren per week. Totaal 55,7 uur volgens het Nivel.'
  }))}
  ${panel(dataTable(T.werkweek_opbouw, [null, v=>num(v,1), null]))}
  ${anwNoot(w('uren','nivel_werkweek'), w('uren','anw_dienst'))}
  <p class="small">De NZa publiceert zelf 46,2 uur per fte. Dat cijfer klopt met de eigen vraagstelling; het is
  geen meting van de werkweek. Wie beide getallen naast elkaar legt zonder dat onderscheid, vergelijkt een
  volledige werkweek met een uitsnede ervan.</p>
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
      { label:'Praktijkhoudend huisartsen', waarde:7561, serie:1, nadruk:true,
        toelichting:'Personen. Nivel-beroepenregistratie 2023; het pensioenfonds komt voor 2024 op 6.479' },
      { label:'Fte in de tariefberekening', waarde:6604, serie:3,
        toelichting:'Werkelijke bezetting: 1 fte per 2.650 ingeschrevenen',
        reden:'deeltijd en de aftopping van de werktijdfactor op 1,0' },
      { label:'Arbeidskostencomponenten binnen 100%', waarde:5888, serie:4,
        toelichting:'Na schoning buiten 100% en de correctie poh-ggz', reden:'schoning op omzet' },
      { label:'Gedekt door NZa-maximumtarieven', waarde:4381, serie:2, nadruk:true,
        toelichting:'De rest moet uit vrij onderhandelbare omzet komen', reden:'74,4% van de omzet is tarief gereguleerd' }
    ],
    fmt: num, caption:'Van beroepsgroep naar tariefonderbouwing, cijfers voor 2025.'
  }))}
  ${callout(`De gemiddelde praktijkhouder werkt ${num(w('uren','nivel_werkweek'),1)} uur per week volgens het
  Nivel en geeft er ${num(w('uren','nza_uren_per_fte'),1)} op in het kostprijsonderzoek. Toch komen ruim
  zevenduizend van hen samen niet verder dan ${num(4381)} volledig door tarieven gedekte
  arbeidskostencomponenten. <strong>Het verschil zit niet in te weinig werken, maar in twee rekenregels:
  de aftopping en de schoning.</strong> <a href="/arbeidskosten/">Die keten staat hier uitgewerkt</a>.`)}
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

<section>
  <h2>Hoeveel uur telt één fte?</h2>
  ${panel(dataTable(T.uren_per_fte, [null, num]))}
</section>`;

  return { pad:'/uren/', html: pagina({
    pad:'/uren/', titel:'Uren en de fte-definitie', eyebrow:'Arbeidsduur praktijkhoudend huisarts',
    h1:'Wat telt als een fte, en wat telt helemaal niet mee',
    omschrijving:'Waarom de NZa 46,2 uur per fte opgeeft terwijl Nivel 55,7 uur meet, en wat de aftopping op 1,0 fte betekent.',
    lede:`De NZa bepaalt het aantal fte praktijkhoudend huisarts uit zelf opgegeven uren, gedeeld door 36 en
      afgetopt op 1,0. Hier staat wat er in die opgave zit, wat er buiten valt, en wat dat betekent.`,
    body })};
}
