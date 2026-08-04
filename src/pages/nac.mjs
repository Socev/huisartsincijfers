import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, dataTable, compareBars, bronLabel,
         statContrast, methodDisclosure } from '../lib/components.mjs';
import { eur, eur0, num, pct } from '../lib/format.mjs';

/* Een citaat uit een NZa-document. Letterlijk, met vindplaats erbij, zodat de
   lezer het zelf kan terugzoeken en wij er niets tussen kunnen schuiven. */
const citaat = (tekst, waar) => `<div class="panel citaat">
  <blockquote>${tekst}</blockquote>
  <p class="bron">${waar}</p></div>`;

export default function () {
  const T = data.nacopbouw.tabellen;
  const nac26 = w('nac','nac_2026'), nac22 = w('nac','nac_2022');
  const fh = w('nacopbouw','usb_functiehouder'), ph = w('nacopbouw','usb_praktijkhouder'),
        mm = w('nacopbouw','usb_maatmens'), meer = w('nacopbouw','usb_meerwaarde');
  const uIn = w('nacopbouw','uren_ingerekend'), uGe = w('nacopbouw','uren_voltijd_gemeten'),
        uRe = w('nacopbouw','uren_rekeneenheid');
  const R = data.nacopbouw.reeksen.nac.reeksen[0];

  const body = `
<section id="openbaarheid">
  ${statContrast({
    pijl: 'maar',
    links:  { waarde: eur0(nac26), label: 'nac per fte, prijspeil 2026',
              eenheid: 'gepubliceerd in de beslissing op bezwaar', status: 'definitief' },
    rechts: { waarde: num(mm) + ' punten', label: 'functiezwaarte van de maatmens',
              eenheid: 'gepubliceerd in het onderzoek van Berenschot', status: 'definitief' },
    ratio: `Beide uiteinden van de keten staan in openbare stukken. <b>De formule ertussen niet.</b> Welke drie
      zorg-cao's de loonlijn vormen, hoe die lijn is opgebouwd en hoe het bedrag zich splitst tussen primaire
      beloning en sociale lasten, is niet gepubliceerd. Juist de stap waarin functiepunten geld worden, is
      daardoor niet na te rekenen.`
  })}
</section>

<section>
  <h2>Eén bedrag, vijf stappen</h2>
  <p class="sub">De arbeid van een praktijkhouder staat nergens in een boekhouding. De NZa stelt die kosten
  daarom normatief vast: een bedrag dat in de kostprijs wordt opgenomen alsof het een factuur was.
  Dat bedrag heet de normatieve arbeidskostencomponent, kortweg de nac. Het is geen salaris en geen
  inkomensgarantie — het is een kostenpost in een tariefberekening.</p>
  <div class="grid c3">
    ${tile({ waarde: eur0(nac26), label:'nac per fte, prijspeil voorcalculatorisch 2026', bron:'NZa, beslissing op bezwaar 30 juni 2026' })}
    ${tile({ waarde: num(mm), label:'USB-punten functiezwaarte van de maatmens praktijkhoudend huisarts', bron:'Berenschot, Functiezwaarte huisartsenzorg' })}
    ${tile({ waarde: num(meer), label:'van die punten komen uit het praktijkhouderschap; de rest uit het artsenwerk', bron:'Eigen berekening op de scoretabel' })}
  </div>
  ${panel(dataTable(T.stappen, null))}
  ${callout(`<strong>Waar de keten open ligt.</strong> Stap 1 en 2 zijn na de uitspraak van het CBb openbaar
  gemaakt en na te rekenen. Stap 3 en 4 — de loonlijn uit drie zorg-cao's en de opslag voor sociale lasten —
  zijn dat niet. Van de weg van 374 punten naar ${eur0(nac22)} (prijspeil 2022) is alleen het eindpunt bekend.`)}
</section>

<section>
  <h2>Stap 1 en 2: de maatmens en zijn punten</h2>
  <p class="sub">Berenschot beschrijft twee rollen apart — de arts en de ondernemer — en weegt beide met het
  Universeel Systeem Berenschot over acht gezichtspunten. De ‘maatmens praktijkhoudend huisarts’ is
  vervolgens per gezichtspunt de hoogste van de twee. Geen optelsom dus, maar een maximum.</p>
  ${panel(dataTable(T.usb_scores, [null, num, num, num, null]))}
  ${panel(compareBars({
    items:[
      { label:'Functiehouderschap: het artsenwerk op zichzelf', waarde: fh, serie:1 },
      { label:'Praktijkhouderschap: het runnen van de praktijk op zichzelf', waarde: ph, serie:2 },
      { label:'Maatmens praktijkhoudend huisarts: het maximum per gezichtspunt', waarde: mm, serie:3,
        toelichting:'Op zes van de acht gezichtspunten wint het functiehouderschap' }
    ], fmt: num, eenheid:' punten', caption:'Functiezwaarte in USB-punten.'
  }))}
  ${callout(`<strong>Het praktijkhouderschap voegt ${num(meer)} punten toe.</strong> Alleen op
  ‘Leidinggeven — hiërarchisch’ (${num(21)}) en ‘Leidinggeven — operationeel extern’ (${num(3)}) is de
  ondernemersrol zwaarder dan de artsenrol. Op alle andere gezichtspunten telt de score van het
  functiehouderschap. Eigenaar zijn van een praktijk — personeel, huisvesting, financiering, continuïteit,
  aansprakelijkheid — verhoogt de gewogen functiezwaarte dus met ${pct(meer/mm,1)}. Wie vindt dat het
  ondernemerschap zwaarder weegt, moet het in déze tabel zoeken; hier valt de beslissing.`)}
  <p class="small">De NZa erkent het bezwaar hierover wel, maar wijst het af met het argument dat
  functiewaardering het ‘wat’ van een functie weegt en niet de beleving ervan, en dat binnen deze systematiek
  per gezichtspunt het zwaarste element wordt meegewogen. De herbeoordeling na de uitspraak van het CBb
  leidde tot exact dezelfde ${num(mm)} punten als de oorspronkelijke weging — op totaalniveau én per
  gezichtspunt.</p>
</section>

<section>
  <h2>Stap 3: van punten naar geld</h2>
  <p class="sub">De punten zeggen op zichzelf niets over een bedrag. Daarvoor is een loonlijn nodig: een
  wiskundig verband tussen functiezwaarte en beloning, geschat op drie zorg-cao's. De praktijkhouder wordt
  vervolgens op die lijn geplaatst.</p>
  ${citaat(`“Berenschot gebruikt de cao’s namelijk alleen voor het vaststellen van de (wiskundige) relatie die in
  de markt lijkt te gelden tussen de (complexiteit van) inhoudelijke taken en verantwoordelijkheden enerzijds,
  en beloning anderzijds. Daaruit volgt een (wiskundige formule), die zich laat vertalen in een (oneindig
  doorlopende) loonlijn.”`, 'NZa, (herziene) beslissing op bezwaar 30 juni 2026, randnummer 425')}
  <p>Drie dingen zijn hierover bekend, en ze zijn alle drie van belang.</p>
  <ul>
    <li><strong>Het zijn cao's voor werknemersfuncties.</strong> De NZa bevestigt dat, en verweert zich tegen het
    bezwaar dat een ondernemer niet aan loondienstschalen kan worden geijkt met de redenering dat de cao's
    alleen de <em>verhouding</em> tussen zwaarte en beloning leveren.</li>
    <li><strong>De cao voor medisch specialisten zit er niet bij.</strong> Niet omdat die minder passend zou zijn,
    maar omdat de AMS uit één schaal bestaat en er dus geen lijn door te trekken valt.</li>
    <li><strong>De salaristabellen gaan uit van 36 uur.</strong> Dat is de voltijdnorm in de gebruikte cao's — en
    precies de reden dat de NZa 36 uur als rekeneenheid voor een volledige nac hanteert.</li>
  </ul>
  ${callout(`<strong>Openstaande vraag.</strong> Wélke drie zorg-cao's het zijn, welke functies daarin als ijkpunt
  dienden, en hoe de formule van de loonlijn luidt, staat niet in de openbare stukken. Het functiebeeld waarmee
  het onderzoek begon is wél te herleiden: dat is de functiebeschrijving uit de cao huisarts in dienst bij een
  huisarts 2022-2024. Zonder de drie cao's en de formule is stap 3 niet na te rekenen — terwijl juist dáár de
  punten in euro's veranderen. Wij hebben dit opgevraagd.`)}
</section>

<section>
  <h2>Stap 4 en 5: sociale lasten erbij</h2>
  <p class="sub">Op de primaire beloning die van de loonlijn wordt afgelezen, komen toeslagen voor sociale
  lasten. Samen vormen ze de nac.</p>
  ${citaat(`“3 Vervolgens is voor de praktijkhoudend huisarts een primaire beloning bepaald aan de hand van een
  benchmark met drie zorg cao’s. 4 Als laatste stap zijn toeslagen voor sociale lasten op de primaire beloning
  bepaald. 5 De primaire beloning en sociale lasten vormen tezamen de totale nac.”`,
  'NZa, Verantwoordingsdocument tarieven huisartsenzorg 2025, paragraaf 5.1')}
  ${callout(`<strong>Openstaande vraag.</strong> De verdeling van de nac over primaire beloning en sociale lasten
  is niet gepubliceerd. Dat maakt één vergelijking onmogelijk die vaak wordt gemaakt: de nac naast de winst van
  een praktijkhouder leggen. In de nac zit een werkgeversdeel; uit de winst moet een ondernemer zelf pensioen
  en arbeidsongeschiktheidsdekking betalen. Zonder de splitsing is niet te zeggen hoeveel van het verschil
  daardoor komt. <a href="/inkomen/">Wat er wél over inkomen te zeggen valt</a>.`)}
</section>

<section id="uren">
  <h2>Hoeveel uur hoort er bij één nac?</h2>
  <p class="sub">Berenschot koppelt de nac uitdrukkelijk niet aan een urenaantal: gewogen worden taken en
  verantwoordelijkheden, niet tijd. De NZa moet voor de tariefberekening wél kiezen wanneer iemand een
  volledige nac krijgt toegerekend. Die keuze noemt zij zelf beleidsmatig.</p>
  ${citaat(`“Het is ten behoeve van het berekenen en vaststellen van de tarieven een puur beleidsmatige keuze
  van de NZa geweest om al een volledige nac toe te rekenen bij een gemiddelde werkweek van 36 uur (en 46
  weken per jaar).”`, 'NZa, (herziene) beslissing op bezwaar 30 juni 2026, bijlage 6, geciteerd in randnummer 428')}
  ${panel(dataTable(T.uren_varianten, [null, v=>num(v,1), eur, null]))}
  ${panel(compareBars({
    items:[
      { label:'De rekeneenheid: 36 uur maal 46 weken', waarde: uRe, serie:1 },
      { label:'Waarvoor in de kostprijzen al een volledige nac is ingerekend', waarde: uIn, serie:1,
        toelichting:'46,2 uur per week maal 46 weken' },
      { label:'Wat een voltijd werkende praktijkhouder feitelijk maakt', waarde: uGe, serie:2,
        toelichting:'Gemeten in hetzelfde kostprijsonderzoek, met dezelfde beperkte urenvraag' }
    ], fmt: v=>num(v,1), eenheid:' uur', caption:'Uren per jaar, alle drie afkomstig uit NZa-documenten.'
  }))}
  ${callout(`<strong>De eigen cijfers van de NZa laten een gat van ${num(uGe-uIn,0)} uur zien.</strong> In dezelfde alinea
  waarin de NZa concludeert dat er ‘geen uren weglekken’, staat dat een voltijd werkende praktijkhouder
  gemiddeld ${num(uGe,1)} uur per jaar maakt, terwijl in de kostprijzen een volledige nac is ingerekend voor
  iedere ${num(uIn,1)} uur. Dat is ${pct(uGe/uIn-1,1)} meer uren dan waarvoor is betaald, en het verlaagt de nac
  per uur van ${eur(nac26/uIn)} naar ${eur(nac26/uGe)}.`)}
  ${callout(`<strong>En dit is nog de gunstige lezing.</strong> Beide getallen komen uit dezelfde urenuitvraag, en
  die vraagt alleen naar zorg verlenen, praktijk managen en apotheek. Bestuurswerk, extern overleg, nascholing
  en de dienst op de huisartsenpost zitten er niet in. <a href="/uren/">Hoe groot dat verschil is, staat op de
  pagina over uren</a>; <a href="/arbeidskosten/#rekentool">met de rekentool kunt u het zelf verschuiven</a>.`)}
</section>

<section>
  <h2>Wat het bedrag deed</h2>
  <p class="sub">De nac is in 2024 vastgesteld op peildatum 1 januari van dat jaar en daarna alleen nog
  geïndexeerd. De herbeoordeling na de uitspraak van het CBb heeft het bedrag niet veranderd.</p>
  ${panel(compareBars({
    items: data.nacopbouw.reeksen.nac.jaren.map((j, i) => ({
      label: 'Prijspeil ' + j, waarde: R.waarden[i], serie: 1
    })), fmt: eur0, caption: 'Nac per fte praktijkhoudend huisarts, per prijspeil.'
  }))}
  <p class="bron" style="margin-top:12px">${bronLabel(data.nacopbouw.reeksen.nac)}</p>
  ${callout(`De sprong van ${eur0(R.waarden[2])} naar ${eur0(R.waarden[3])} is voor het grootste deel indexatie,
  met daarbovenop een eenmalige correctie op de indexeringsmethode. De functiewaardering zelf leverde na de
  herbeoordeling exact hetzelfde aantal punten op. <a href="/arbeidskosten/">Wat er van de nac in de tarieven
  terechtkomt, staat hier</a>.`)}
</section>`;

  return { pad:'/nac/', html: pagina({
    pad:'/nac/', titel:'De normatieve arbeidskostencomponent',
    eyebrow:'Normbedrag voor de arbeid van de praktijkhouder',
    h1:`${eur0(nac26)} per fte. De formule van ${num(mm)} functiepunten naar euro's is niet openbaar.`,
    status:[`Prijspeil voorcalculatorisch 2026`, `nac: definitief`,
            `loonlijn: niet gepubliceerd`],
    omschrijving:`De vijf stappen van functiebeeld naar normbedrag, en waarom de omzetting van ${num(mm)} functiepunten naar euro's niet reproduceerbaar is.`,
    lede:`De USB-weging en het uiteindelijke normbedrag zijn gepubliceerd. De drie gebruikte zorg-cao's, de
      formule van de loonlijn en de splitsing tussen primaire beloning en sociale lasten ontbreken. Daardoor is
      juist de stap waarin functiepunten geld worden niet volledig na te rekenen. Deze pagina volgt de keten
      stap voor stap en markeert per stap wat wél en wat niet controleerbaar is.`,
    body })};
}
