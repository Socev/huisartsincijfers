import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { stackedBar, table, panel, callout, dataTable, bronLabel, tile, compareBars, anwNoot, heroNumber } from '../lib/components.mjs';
import { eur, eur0, num, pct, mln, esc } from '../lib/format.mjs';

/* Fte's krijgen twee decimalen, bedragen geen — anders leest 171.977,00 als onzin. */
const slim = v => Math.abs(v) < 10 ? num(v, 2) : num(v, 0);

export default function () {
  const J = { 2025: { nac: w('nac','nac_2025_vc'), ing: w('nac','ingeschrevenen_2025'), ph: w('nac','praktijkhouders_2025') },
              2026: { nac: w('nac','nac_2026'),    ing: w('nac','ingeschrevenen_2026'), ph: w('nac','praktijkhouders_2026') } };
  const pf = w('nac','patienten_per_fte'), sb = w('nac','schoning_buiten_100'),
        sp = w('nac','correctie_poh_ggz'), b100 = w('nac','binnen_100'), tg = w('nac','tarief_gereguleerd');

  const cascade = jr => {
    const n = J[jr].ing / pf;
    return { bruto:n, afB:n*sb, afP:n*sp, binnen:n*b100, tg:n*b100*tg, vrij:n*b100*(1-tg), nac:J[jr].nac };
  };
  const c25 = cascade(2025), c26 = cascade(2026);
  /* De urenslider loopt van de NZa-uitvraag tot de Nivel-werkweek min de dienst. */
  const nzaU = w('uren','nza_uren_per_fte'),
        netU = +(w('uren','nivel_werkweek') - w('uren','anw_dienst')).toFixed(1);
  const rij = (lbl, k, extra='') => [lbl, num(c25[k],0), num(c26[k],0), mln(c25[k]*c25.nac), mln(c26[k]*c26.nac), extra];

  const nJaar = netU * w('uren','werkweken');            // Nivel-werkweek exclusief dienst, maal 46 weken
  const zJaar = nzaU * w('uren','werkweken');            // de urenopgaaf van de NZa, maal dezelfde 46 weken

  const body = `
<section>
  <h2>Ruim zevenduizend mensen, minder dan zesduizend vergoedingen</h2>
  ${heroNumber(num(c25.binnen/J[2025].ph, 2),
    `nac in de tariefonderbouwing per praktijkhoudend huisarts. Niet per fte — per persoon.`)}
  <p class="sub" style="margin-top:20px">Nederland telt ongeveer ${num(J[2025].ph)} praktijkhoudend
  huisartsen. Zij werken gemiddeld ${num(netU,1)} uur per week, de dienst op de post er al vanaf. Tegenover
  die hele groep staan in de tariefonderbouwing ${num(c25.bruto,0)} nac’s, en na schoning blijven er
  ${num(c25.binnen,0)} over die de gereguleerde tarieven moeten dekken. Ruim zevenduizend mensen die stuk
  voor stuk fors boven voltijd werken, komen samen uit op minder dan zesduizend volledige
  arbeidsvergoedingen. Hoe kan dat?</p>
  ${callout(`<strong>Drie mechanismen, alle drie legitiem op zichzelf.</strong>
  <b>Eén:</b> het aantal nac’s volgt niet uit het aantal huisartsen maar uit het aantal patiënten, gedeeld
  door ${num(pf)}. <b>Twee:</b> een werktijdfactor is afgetopt op 1,0, zodat wie ${num(netU,1)} uur werkt
  precies evenveel telt als wie er ${num(36)} maakt — de uren daarboven verdwijnen uit de telling.
  <b>Drie:</b> ${pct(1-b100,1)} van de uitkomst wordt geschoond, omdat die arbeid volgens de NZa elders
  wordt betaald. Samen verklaren ze het verschil precies. De vraag is niet of de rekensom klopt, maar of de
  uitkomst is wat je wilt.`)}
</section>

<section>
  <h2>Van werkelijke bezetting naar dekkingsbron</h2>
  <p class="sub">De NZa bepaalt het aantal fte praktijkhoudend huisarts uit de opgegeven uren, vermenigvuldigt dat
  met de normatieve arbeidskostencomponent, en schoont het resultaat vervolgens naar rato van omzet. Wat overblijft
  is wat er in de tariefonderbouwing landt.</p>
  ${panel(table({
    cols:[{label:'Stap'},{label:"NAC's 2025",r:true},{label:"NAC's 2026",r:true},{label:'2025',r:true},{label:'2026',r:true},{label:'Grondslag'}],
    rows:[
      rij('Werkelijke bezetting praktijkhoudend huisartsen','bruto','Ingeschrevenen gedeeld door '+num(pf)),
      ['<span style="color:var(--text-secondary)">af: schoning binnen scope, buiten 100%</span>',
        '−'+num(c25.afB,0),'−'+num(c26.afB,0),'−'+mln(c25.afB*c25.nac).slice(2),'−'+mln(c26.afB*c26.nac).slice(2),
        pct(sb,2)+' — griepprik, SBOH, bevolkingsonderzoek, keuringen'],
      ['<span style="color:var(--text-secondary)">af: correctie poh-ggz</span>',
        '−'+num(c25.afP,0),'−'+num(c26.afP,0),'−'+mln(c25.afP*c25.nac).slice(2),'−'+mln(c26.afP*c26.nac).slice(2),
        pct(sp,2)+' — verplaatst naar de aparte poh-ggz-module'],
      ['<b>Blijft binnen 100%</b>','<b>'+num(c25.binnen,0)+'</b>','<b>'+num(c26.binnen,0)+'</b>',
        '<b>'+mln(c25.binnen*c25.nac)+'</b>','<b>'+mln(c26.binnen*c26.nac)+'</b>', pct(b100,2)+' van de bezetting'],
      rij('waarvan gedekt door NZa-maximumtarieven','tg', pct(tg,1)+' van de omzet binnen 100% (Tabel 34)'),
      rij('waarvan vrij onderhandelbaar','vrij', pct(1-tg,1)+' — zorggroep S2 en S3, en M&I')
    ]
  }))}
  <p class="bron" style="margin-top:12px">${bronLabel(p('nac','patienten_per_fte'))} · ${bronLabel(p('nac','binnen_100'))}</p>
</section>

<section>
  <h2>Hoe de schoning is afgeleid</h2>
  <p class="sub">De NZa publiceert geen landelijk schoningspercentage. Het volgt uit Tabel 19, gewogen met de
  landelijke verdeling van praktijken uit Tabel 3. Die weging reproduceert ook de 1,39 fte per praktijk en de
  2.650 patiënten per fte die de NZa elders noemt — een onafhankelijke controle op de keten.</p>
  ${panel(dataTable(data.nac.tabellen.schoning_per_subpopulatie, [null, slim, slim, slim]))}
  ${panel(dataTable(data.nac.tabellen.weging_praktijken, [null, v=>pct(v,2)]))}
</section>

<section>
  <h2>Wat één fte kost, en wat één fte oplevert</h2>
  <p class="sub">De nac is een normbedrag voor een voltijd werkende praktijkhoudend huisarts. Het bedrag zelf staat
  niet ter discussie op deze pagina; wat opvalt is hoeveel uren er tegenover staan.</p>
  <div class="grid c3">
    ${tile({ waarde: eur0(w('nac','nac_2026')), label:'normatieve arbeidskostencomponent per fte, prijspeil 2026', bron:'NZa, vraag en antwoord 13 juli 2026', href:'/nac/' })}
    ${tile({ waarde: num(nJaar,0), label:`uur per jaar werkt een praktijkhoudend huisarts volgens het Nivel — ${num(netU,1)} uur per week, exclusief dienst, maal ${num(w('uren','werkweken'))} weken`, bron:'Nivel, De werkweek van de Nederlandse huisarts in 2024', href:'/uren/' })}
    ${tile({ waarde: num(zJaar,0), label:`uur per jaar rekent de NZa als één volledige nac — ${num(nzaU,1)} uur per week uit het kostprijsonderzoek 2022`, bron:'NZa, vraag en antwoord 13 juli 2026', href:'/nac/#uren' })}
  </div>
  ${callout(`<strong>Het verschil is ${num(nJaar-zJaar,0)} uur per jaar.</strong> Dat is ${pct(nJaar/zJaar-1,1)}
  meer werk dan waarvoor één volledige arbeidsvergoeding in de kostprijs zit — en beide getallen gaan over
  dezelfde ${num(w('uren','werkweken'))} werkweken. Het verschil is geen meetfout: de NZa vraagt bewust niet
  naar bestuurswerk, extern overleg en nascholing. <a href="/uren/">Wat er precies buiten de vraagstelling
  valt</a>.`)}
</section>

<section>
  <h2>De nac per gewerkt uur</h2>
  <p class="sub">Twee noemers zijn verdedigbaar en ze geven een verschillende uitkomst. Wij tonen ze allebei,
  omdat het verschil zelf het punt is: het is precies de tijd die de NZa niet uitvraagt.</p>
  ${panel(compareBars({
    items:[
      { label:'Per daadwerkelijk gewerkt uur (Nivel, exclusief dienst)', serie:1,
        waarde: (J[2025].ing/pf)*J[2025].nac / (J[2025].ph*(w('uren','nivel_werkweek')-w('uren','anw_dienst'))*w('uren','werkweken')),
        toelichting:'Alle uren van de beroepsgroep gedeeld door alle nac’s' },
      { label:'Per uur zoals opgegeven in het kostprijsonderzoek', serie:2,
        waarde: J[2025].nac / w('uren','uren_per_nac'),
        toelichting:'De uren die de NZa telt: zorg verlenen, praktijk managen en apotheek' }
    ],
    fmt: eur, caption:'Volledige normatieve arbeidsvergoeding per uur, prijspeil 2025.'
  }))}
  ${anwNoot(w('uren','nivel_werkweek'), w('uren','anw_dienst'), { kort:true })}
  ${callout(`<strong>Waarom deze twee verschillen.</strong> De NZa vraagt alleen naar zorg verlenen, praktijk
  managen en apotheek. Bestuurswerk, extern overleg, nascholing en de dienst vallen buiten de vraagstelling —
  samen ${num(w('uren','niet_uitgevraagd'),1)} uur per week. <a href="/uren/">Die aansluiting staat hier uitgewerkt</a>.`)}
</section>

<section id="rekentool">
  <h2>Reken zelf mee</h2>
  <p class="sub">Eén knop die er werkelijk toe doet: hoeveel uur per week rekenen we mee. De ondergrens is de
  urenopgaaf die de NZa zelf uitvraagt, de bovengrens is de gemeten werkweek van de zelfstandig gevestigde
  huisarts ná aftrek van de dienst op de post. Daartussen ligt precies de tijd die niet wordt uitgevraagd.</p>
  ${panel(`<div class="calc">
    <div>
      <div class="ctrl"><label>Prijspeil</label>
        <div class="segbtn" id="i-jaar">
          <button type="button" data-jaar="2025" aria-pressed="true">2025</button>
          <button type="button" data-jaar="2026" aria-pressed="false">2026</button></div></div>
      <div class="ctrl">
        <label for="i-week">Werkweek, exclusief dienst <b><span id="v-week"></span> u</b></label>
        <input type="range" id="i-week" min="${nzaU}" max="${netU.toFixed(1)}" step="0.1" value="${netU.toFixed(1)}">
        <div class="rt"><button type="button" data-week="${nzaU}">${num(nzaU,1)} u<i>uitvraag NZa</i></button><button type="button" data-week="${netU.toFixed(1)}">${num(netU,1)} u<i>Nivel, excl. dienst</i></button></div>
      </div>
      <p class="vast">Vast gehouden: <b>${num(w('uren','werkweken'))} werkweken</b> per jaar, zoals in de
      fte-formule van de NZa, en <b><span id="v-ph"></span> praktijkhouders</b> in het gekozen jaar.</p>
      <button class="linkbtn" type="button" id="reset">Terug naar de brongegevens</button>
    </div>
    <div>
      <div class="out">
        <div><div class="b" id="o-tot"></div><div class="l">totaal per gewerkt uur</div></div>
        <div><div class="b" id="o-tar"></div><div class="l">via NZa-maximumtarieven</div></div>
        <div><div class="b" id="o-uur"></div><div class="l">gewerkte uren per nac</div></div>
      </div>
      <div class="barwrap"><div class="sbar" id="calcbar"></div></div>
      <div class="axis"><span>0</span><span id="calcmax"></span></div>
      <div class="legend" id="calcleg"></div>
    </div>
  </div>`)}
  <p class="small" style="margin-top:14px">Deze rekentool gebruikt dezelfde datalaag als de cijfers hierboven.
  Het aantal nac's volgt uit de ingeschreven verzekerden gedeeld door ${num(pf)}; de verdeling over
  dekkingsbronnen is de schoning uit de tabel bovenaan deze pagina.</p>
</section>

<script id="calcdata" type="application/json">${JSON.stringify({
  jaren:J, pf, sb, sp, b100, tg, wkn:w('uren','werkweken'), bronnen:data.nac.dekkingsbronnen
})}</script>
<script src="/calc-arbeidskosten.js" defer></script>`;

  return { pad:'/arbeidskosten/', html: pagina({
    pad:'/arbeidskosten/', titel:'Arbeidskosten praktijkhoudend huisarts',
    eyebrow:'Normatieve arbeidskostencomponent',
    h1:'Wat de tarieven inrekenen voor de arbeid van de praktijkhouder',
    omschrijving:'De keten van werkelijke bezetting naar het deel dat door NZa-maximumtarieven wordt gedekt.',
    lede:`De nac is het normbedrag dat de NZa in de kostprijs opneemt voor de arbeid van een voltijd werkende
      praktijkhoudend huisarts. Hier staat wat daarvan overblijft nadat de schoning is toegepast, en wie de rest
      volgens de NZa moet dekken.`,
    body })};
}
