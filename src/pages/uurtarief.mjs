import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, tile, callout, dataTable, heroNumber, serieChart, anwNoot } from '../lib/components.mjs';
import { eur, eur0, num, pct } from '../lib/format.mjs';

export default function () {
  const T = data.modelwissel.tabellen;
  const u24 = w('modelwissel','nac_uur_2024'), u25 = w('modelwissel','nac_uur_2025'),
        u26 = w('modelwissel','nac_uur_2026');
  const R = data.modelwissel.reeksen;
  const reeel = R.uurbedrag.reeksen[1].waarden;

  const body = `
<section>
  <h2>Twaalf euro per uur, in één jaar</h2>
  ${heroNumber('− ' + eur(u24-u25),
    `per gewerkt uur. Zoveel arbeidsvergoeding voor de praktijkhouder verdween tussen 2024 en 2025 uit de
     tarieven — ${pct(1-u25/u24,1)}, in het jaar waarin de nac per fte juist fors omhoog ging.`)}
  <p class="sub" style="margin-top:20px">Deze pagina deelt één ding door één ander ding: het bedrag aan
  arbeidsvergoeding voor praktijkhouders dat landelijk in de gereguleerde tarieven verwerkt zit, gedeeld door
  alle uren die praktijkhouders samen maken. Die maat omzeilt de discussie over wat een fte is — je rekent
  gewoon in uren.</p>
  <div class="grid c4" style="margin-top:24px">
    ${tile({ waarde: eur(u24), label:'per gewerkt uur in de tarieven, 2024 — het hoogste punt van de reeks', bron:'Eigen berekening' })}
    ${tile({ waarde: eur(u25), label:'per gewerkt uur, 2025, na de overgang naar het herziene model', bron:'Eigen berekening' })}
    ${tile({ waarde: eur(u26), label:'per gewerkt uur, 2026 — nog altijd onder het niveau van 2024', bron:'Eigen berekening' })}
    ${tile({ waarde: pct(reeel[7]/reeel[0]-1,1), label:'verandering sinds 2018 na correctie voor inflatie, op prijspeil 2015', bron:'Eigen berekening, CBS-consumentenprijsindex' })}
  </div>
</section>

<section>
  <h2>De reeks</h2>
  <p class="sub">Nominaal liep het uurbedrag van ${eur(61.54)} in 2018 op tot ${eur(u24)} in 2024. In 2025
  valt het terug op het niveau van 2018. Gecorrigeerd voor inflatie is het beeld scherper: dan ligt 2025
  ruim een vijfde onder 2018.</p>
  ${panel(serieChart(R.uurbedrag, { fmt: eur, hoogte: 330 }))}
  ${panel(dataTable(T.uurreeks, [v=>String(v), num, v=>num(v,1), num, v=>num(v,1), eur, eur]))}
  ${anwNoot(w('uren','nivel_werkweek'), w('uren','anw_dienst'), { kort:true })}
  <p class="small">Wie de dienst op de post buiten beschouwing laat, deelt door minder uren en komt dus
  ${pct(w('uren','nivel_werkweek')/(w('uren','nivel_werkweek')-w('uren','anw_dienst'))-1,1)} hóger uit:
  ${eur(u24*w('uren','nivel_werkweek')/(w('uren','nivel_werkweek')-w('uren','anw_dienst')))} in 2024 en
  ${eur(u25*w('uren','nivel_werkweek')/(w('uren','nivel_werkweek')-w('uren','anw_dienst')))} in 2025. De
  knik van ${pct(1-u25/u24,1)} verandert daar niet door — die is in elke variant hetzelfde.</p>
</section>

<section>
  <h2>Waar de knik vandaan komt</h2>
  <p class="sub">Niet uit een verlaging van het normbedrag. Dat steeg juist. De daling zit volledig in het
  aantal normbedragen dat in de tarieven wordt ingerekend.</p>
  ${panel(serieChart(R.nacs, { fmt: num, hoogte: 320 }))}
  ${callout(`<strong>Twee lijnen die uit elkaar lopen.</strong> De ureninzet van praktijkhouders groeide
  tussen 2018 en 2024 van ${num(10698)} naar ${num(11699)} fte van 36 uur — niet doordat er meer
  praktijkhouders kwamen, maar doordat de werkweek langer werd. Het aantal nac’s in de tarieven kroop in
  diezelfde jaren van ${num(8052)} naar ${num(8305)}, en viel in 2025 terug naar ${num(5885)}.
  <a href="/modelwissel/">Wat er in 2025 precies veranderde</a>.`)}
  ${panel(dataTable(T.normbedrag, [null, eur0, num, v => '€ ' + num(v,1) + ' mln']))}
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
      const a = u24*46/wk, b = u25*46/wk;
      return ['' + wk + ' weken', +a.toFixed(2), +b.toFixed(2), -(1-b/a)];
    }),
    toelichting:'Meer weken betekent meer uren en dus een lager bedrag per uur. Het procentuele verschil tussen 2024 en 2025 blijft in alle varianten gelijk: de schaal verandert, de knik niet.'
  }, [null, eur, eur, v=>pct(v,1)]))}
</section>

<section>
  <h2>Lees dit voordat u ermee naar buiten gaat</h2>
  <ul>
    <li><strong>Dit is geen uitbetaald uurloon.</strong> Het is het bedrag aan arbeidskostenvergoeding dat in
    de <em>tariefonderbouwing</em> zit, gedeeld door de werkelijk gewerkte uren. Wat een praktijkhouder
    feitelijk overhoudt, hangt af van praktijkomvang, productie, contractafspraken en bedrijfsvoering.
    <a href="/inkomen/">Wat daarover bekend is</a>.</li>
    <li><strong>De uren zijn op drie momenten gemeten</strong> — 2013, 2018 en 2024 — in het
    tijdsbestedingsonderzoek van het Nivel. Alles ertussen is lineaire interpolatie, en 2025 en 2026 houden
    de werkweek constant. De werkelijke ontwikkeling kan sprongsgewijs zijn verlopen.</li>
    <li><strong>Het aantal praktijkhouders is grotendeels geschat.</strong> 2018 en 2019 zijn definitief;
    2021 is uit een grafiek afgelezen en die piek is daardoor deels een artefact. 2025 en 2026 zijn
    geëxtrapoleerd.</li>
    <li><strong>De nac-reeks in de tarieven is onze afleiding</strong>, geen door de NZa gepubliceerd getal.
    Tot en met 2024 gaat het bovendien om het normatieve inkomen uit het oude model, dat anders is onderbouwd
    dan de nac van nu.</li>
    <li><strong>Alleen praktijkhouders.</strong> De uren van hidha’s en waarnemers zitten in de
    personeelskosten van de praktijk, niet in de nac. <a href="/beroepsgroep/">Hoe die verhouding zich
    ontwikkelt</a>.</li>
  </ul>
</section>`;

  return { pad:'/uurtarief/', html: pagina({
    pad:'/uurtarief/', titel:'Arbeidsvergoeding per gewerkt uur', eyebrow:'Reeks 2018-2026',
    h1:'Wat er per gewerkt uur voor de praktijkhouder in de tarieven zat',
    omschrijving:'De arbeidsvergoeding voor praktijkhouders in de gereguleerde tarieven, gedeeld door de gewerkte uren van de beroepsgroep, van 2018 tot 2026.',
    lede:`Discussies over de nac lopen vast op de vraag wat een fte is. Deze pagina omzeilt dat: zij deelt het
      landelijke arbeidskostenbedrag in de tarieven door de uren die praktijkhouders werkelijk maken. Dan
      wordt zichtbaar wat de overgang naar het nieuwe kostprijsmodel per uur betekende.`,
    body })};
}
