import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { uurbedrag, uurbedragVerschil, reeleMutatie, uurreeksTabel, normbedragTabel,
         uurbedragSerie, nacsSerie, niveausUurSerie, niveausTabel, knikOntleding,
         uurbedragen } from '../lib/metrics.mjs';
import { panel, tile, callout, dataTable, heroNumber, serieChart, anwNoot } from '../lib/components.mjs';
import { eur, eur0, num, pct } from '../lib/format.mjs';

export default function () {
  const r = uurbedragen();
  const u24 = uurbedrag(2024), u25 = uurbedrag(2025), u26 = uurbedrag(2026);
  const knik = knikOntleding();
  const i23 = r.jaren.indexOf(2023), i24 = r.jaren.indexOf(2024), i25 = r.jaren.indexOf(2025);
  const dek = data.modelwissel.tabellen.dekking_nac;

  const body = `
<section>
  <h2>Twaalf euro per uur minder, in twee delen</h2>
  ${heroNumber('− ' + eur(Math.abs(knik.totaal)),
    `per gewerkt uur verdween tussen 2024 en 2025 uit de basistarieven. Dat bedrag valt in tweeën:
     ${eur(Math.abs(knik.minderTerecht))} doordat de NZa minder volledige arbeidsvergoedingen terecht acht,
     en ${eur(Math.abs(knik.verplaatst))} die niet verdween maar werd verplaatst — naar andere bekostiging,
     die een praktijk wel of niet ontvangt.`)}
  <p class="sub" style="margin-top:20px">Deze pagina deelt geld door uren: het landelijke bedrag aan
  arbeidsvergoeding voor praktijkhouders in de tariefonderbouwing, gedeeld door alle uren die praktijkhouders
  werkelijk maken. Geen fte's — juist de fte-definitie is het instrument waarmee het aantal vergoedingen
  wordt bepaald, dus hier wordt gerekend in mensen en gemeten uren.</p>
  <div class="grid c4" style="margin-top:24px">
    ${tile({ waarde: eur(u24.nominaal), label:'per gewerkt uur in de basistarieven, 2024 — het hoogste punt van de reeks', bron:'Eigen berekening' })}
    ${tile({ waarde: eur(u25.nominaal), label:'per gewerkt uur, 2025, na de overgang naar het herziene model', bron:'Eigen berekening' })}
    ${tile({ waarde: eur(r.perUurGereguleerd[i25]), label:'daarvan te verdienen uit de tariefgereguleerde omzet, 2025', bron:'Eigen berekening' })}
    ${tile({ waarde: eur(r.winstGemPerUur[i23]), label:'gerealiseerde winst per gewerkt uur in 2023, gemiddeld (CBS)', bron:'CBS StatLine 84467NED' })}
  </div>
</section>

<section id="niveaus">
  <h2>Drie niveaus, en wat er werkelijk uitkwam</h2>
  <p class="sub">Eén bedrag zegt te weinig. Het raamwerk kent drie scope-zuivere niveaus:
  wat de NZa aan volledige arbeidsvergoedingen <b>terecht acht</b>, wat daarvan <b>in de basistarieven</b>
  belandt (vanaf 2025 gaat er ${pct(w('nac','schoning_buiten_100') + w('nac','correctie_poh_ggz'),2)} af
  voor werk dat elders bekostigd wordt), en wat daarvan <b>uit de tariefgereguleerde omzet</b> moet komen.
  Daarnaast: de winst die praktijkhouders werkelijk realiseerden.</p>
  ${panel(serieChart(niveausUurSerie(), { fmt: eur, hoogte: 340 }))}
  ${panel(dataTable(niveausTabel(), [v=>String(v), eur, eur, eur, v=>v==null?'—':eur(v), v=>v==null?'—':eur(v)]))}
  ${callout(`<strong>De nac en de winst zijn één op één vergelijkbaar.</strong> De nac is er — samen met de
  aparte vergoeding voor gederfd rendement op eigen vermogen — precies voor bedoeld wat de winst is: de
  beloning voor arbeid, ondernemersrisico en kapitaal van de praktijkhouder. Tot en met 2021 liepen de
  ingerekende vergoeding en de gerealiseerde winst vrijwel gelijk op; vanaf 2022 blijft de winst er
  ${eur(r.nominaal[i23] - r.winstGemPerUur[i23])} per uur onder, vooral doordat de werkweek harder groeide
  dan de winst. De mediaan ligt structureel zo'n vijf euro onder het gemiddelde.`, 'inzicht')}
</section>

<section>
  <h2>De reeks</h2>
  <p class="sub">Nominaal liep het uurbedrag in de basistarieven van ${eur(uurbedrag(2018).nominaal)} in 2018
  op tot ${eur(u24.nominaal)} in 2024. In 2025 valt het terug op het niveau van 2018. Gecorrigeerd voor
  inflatie ligt 2025 ruim een vijfde onder 2018.</p>
  ${panel(serieChart(uurbedragSerie(), { fmt: eur, hoogte: 330 }))}
  ${panel(dataTable(uurreeksTabel(), [v=>String(v), num, v=>num(v,1), num, v=>num(v,1), eur, eur]))}
  ${anwNoot(w('uren','nivel_werkweek'), w('uren','anw_dienst'), { kort:true })}
</section>

<section>
  <h2>Waar de knik vandaan komt</h2>
  <p class="sub">Niet uit een lager normbedrag — dat steeg juist met ${pct(r.normbedrag[i25]/r.normbedrag[i24]-1,1)}.
  De daling zit volledig in het aantal normbedragen dat wordt ingerekend, en die valt in twee delen uiteen.</p>
  ${panel(serieChart(nacsSerie(), { fmt: num, hoogte: 320 }))}
  ${callout(`<strong>Twee bewegingen in één knik.</strong> De bovenste lijn daalt omdat de NZa sinds het
  kostprijsonderzoek 2022 rekent met ${num(w('nac','patienten_per_fte'),0)} patiënten per voltijds werkende
  praktijkhouder, waar de norm sinds 2018 ${num(w('modelwissel','normpraktijk_2015'),0)} was — dat kost
  ${eur(Math.abs(knik.minderTerecht))} per uur. De tweede lijn zakt daaronder omdat het nieuwe model
  ${pct(w('nac','schoning_buiten_100')+w('nac','correctie_poh_ggz'),2)} van elke nac vóór de honderd procent
  wegschoont — griepprik, bevolkingsonderzoek, opleiden, verloskunde en poh-ggz-managementtijd, werk dat
  volgens de NZa elders vergoed wordt. Dat is de verplaatste ${eur(Math.abs(knik.verplaatst))} per uur.
  Ondertussen groeide de ureninzet van de beroepsgroep van ${num(r.urenMln[0],1)} naar
  ${num(r.urenMln[i24],1)} miljoen uur per jaar — niet door meer praktijkhouders, maar door een langere
  werkweek. <a href="/modelwissel/">Wat er in 2025 precies veranderde</a>.`)}
  ${panel(dataTable(normbedragTabel(), [null, eur0, num, v => '€ ' + num(v,1) + ' mln']))}
</section>

<section id="dekking">
  <h2>Waar een hele nac vandaan moet komen</h2>
  <p class="sub">Beide modellen laten een deel van de arbeidsvergoeding uit niet-gereguleerde omzet komen,
  op basis van omzet-evenredigheid: de aanname dat elke euro omzet evenveel kosten draagt. Wat veranderde
  is niet dát er verdeeld wordt, maar hoeveel er vooraf buiten de honderd procent wordt gezet.</p>
  ${panel(dataTable(dek, [null, v=>pct(v,2), v=>pct(v,2), null]))}
  ${callout(`<strong>Het gereguleerde aandeel daalt al drie onderzoeken op rij:</strong> 77,0% (onderbouwing
  2010), 77,26% (PKO 2015), 74,1% (PKO 2022) — en op hele-nac-basis nu ${pct(0.6633,2)}. Omzet als
  verdeelsleutel heeft daarbij een ingebouwde neiging: de omzetaandelen worden gemeten uit gerealiseerde
  omzet, en die omzet is zelf een product van de tarieven die de NZa eerder vaststelde. Te laag gereguleerd
  tarief betekent een kleiner gereguleerd omzetaandeel, en dus bij het volgende onderzoek nóg minder
  kostentoerekening aan de gereguleerde tarieven. De reeks bewijst die spiraal niet — ketenzorg is ook
  werkelijk gegroeid — maar het mechanisme zit in de formule.`, 'letop')}
</section>

<section>
  <h2>Gevoeligheid: hoeveel weken werkt een praktijkhouder?</h2>
  <p class="sub">De berekening gaat uit van ${num(w('modelwissel','werkweken'))} werkweken per jaar, de
  rekeneenheid die de NZa zelf gebruikt. Wie een ander getal wil hanteren, schaalt lineair.</p>
  ${panel(dataTable({
    label:'Uurbedrag bij een ander aantal werkweken',
    bron:'eigen-berekening', vindplaats:'lineaire herschaling van dezelfde reeks', status:'afgeleid', eenheid:'euro',
    kolommen:['Werkweken per jaar','2024','2025','Verschil'],
    rijen:[44,46,48,52].map(wk => {
      const a = u24.nominaal*46/wk, b = u25.nominaal*46/wk;
      return ['' + wk + ' weken', +a.toFixed(2), +b.toFixed(2), -(1-b/a)];
    }),
    toelichting:'Meer weken betekent meer uren en dus een lager bedrag per uur. Het procentuele verschil tussen 2024 en 2025 blijft in alle varianten gelijk: de schaal verandert, de knik niet.'
  }, [null, eur, eur, v=>pct(v,1)]))}
</section>

<section>
  <h2>Lees dit voordat u ermee naar buiten gaat</h2>
  <ul>
    <li><strong>Dit is geen uitbetaald uurloon.</strong> De nac-lijnen tonen wat er in de
    <em>tariefonderbouwing</em> zit, gedeeld door werkelijk gewerkte uren; de winstlijn toont wat er
    gemiddeld uitkwam. Wat een individuele praktijkhouder overhoudt, hangt af van praktijkomvang, productie,
    contractafspraken en bedrijfsvoering. <a href="/inkomen/">Wat daarover bekend is</a>.</li>
    <li><strong>De uren zijn op drie momenten gemeten</strong> — 2013, 2018 en 2024 — met de gevalideerde
    sms-methode van het Nivel. Alles ertussen is lineaire interpolatie, en 2025 en 2026 houden de werkweek
    constant. De dienst-aftrek van ${num(w('uren','anw_dienst'),1)} uur is alleen in 2024 gemeten.</li>
    <li><strong>Het aantal praktijkhouders is deels geschat:</strong> Nivel-registratie tot en met 2023,
    daarna geëxtrapoleerd.</li>
    <li><strong>De nac-reeks is onze afleiding</strong>, geen door de NZa gepubliceerd landelijk getal. De
    herberekening sluit over alle jaren tot op ${pct(0.0005,2)} aan op de reeks in de eigen datalaag;
    <a href="/arbeidskosten/#kruiscontrole">de verantwoording van de delers</a>.</li>
    <li><strong>De winstreeks eindigt in 2023</strong> en betreft zelfstandig ondernemers met personeel;
    praktijkhouders met een bv vallen erbuiten. Het effect van de modelwissel van 2025 op de winst is dus
    nog in geen enkel cijfer zichtbaar.</li>
    <li><strong>Alleen praktijkhouders.</strong> De uren van hidha's en waarnemers zitten in de
    personeelskosten van de praktijk, niet in de nac. <a href="/beroepsgroep/">Hoe die verhouding zich
    ontwikkelt</a>.</li>
  </ul>
</section>`;

  return { pad:'/uurtarief/', html: pagina({
    pad:'/uurtarief/', titel:'Arbeidsvergoeding per gewerkt uur', eyebrow:'Reeks 2018-2026',
    h1:`In 2025 verdween ${eur(Math.abs(knik.totaal))} arbeidsvergoeding per gewerkt uur uit de basistarieven — ${eur(Math.abs(knik.verplaatst))} daarvan is verplaatst, niet geschrapt`,
    status:[`Reeks 2018-2026`, `noemer: gewerkte uren`, `eigen berekening`],
    omschrijving:'De arbeidsvergoeding voor praktijkhouders in de tarieven op drie niveaus, per gewerkt uur, naast de gerealiseerde winst, van 2018 tot 2026.',
    lede:`Dit is geen uitbetaald uurloon. Het is het landelijke bedrag aan arbeidskostenvergoeding voor
      praktijkhouders in de tariefonderbouwing, gedeeld door de uren die praktijkhouders gezamenlijk werken —
      op drie niveaus die elk een andere vraag beantwoorden, en met de gerealiseerde winst ernaast.`,
    body })};
}
