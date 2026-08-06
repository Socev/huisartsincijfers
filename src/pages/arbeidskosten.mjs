import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { stackedBar, table, panel, callout, dataTable, bronLabel, tile, compareBars, anwNoot,
         heroNumber, statContrast, causalChain, evidenceCard, begrippenBalk,
         methodDisclosure } from '../lib/components.mjs';
import { nacKeten, werkweek, nacHerkomst } from '../lib/metrics.mjs';
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
  const k = nacKeten(2025), u = werkweek();
  const H = nacHerkomst();

  /* De verdeling over dekkingsbronnen, per gewerkt uur. Stond eerst op de
     homepage; die vertelt nu één verhaal en verwijst hierheen. */
  const urenTotaal = k.personen * u.netto * u.werkweken;
  const perUur = k.brutoNac * J[2025].nac / urenTotaal;
  const delen = data.nac.dekkingsbronnen.map((d, i) => ({
    ...d, waarde: [perUur*b100*tg, perUur*b100*(1-tg), perUur*sb, perUur*sp][i]
  }));
  /* De urenslider loopt van de NZa-uitvraag tot de Nivel-werkweek min de dienst. */
  const nzaU = w('uren','nza_uren_per_fte'),
        netU = +(w('uren','nivel_werkweek') - w('uren','anw_dienst')).toFixed(1);
  const rij = (lbl, k, extra='') => [lbl, num(c25[k],0), num(c26[k],0), mln(c25[k]*c25.nac), mln(c26[k]*c26.nac), extra];

  const nJaar = netU * w('uren','werkweken');            // Nivel-werkweek exclusief dienst, maal 46 weken
  const zJaar = nzaU * w('uren','werkweken');            // de urenopgaaf van de NZa, maal dezelfde 46 weken

  const body = `
<section id="contrast">
  ${statContrast({
    links:  { waarde: num(k.personen), label: 'praktijkhoudend huisartsen',
              eenheid: `mensen · gemiddeld ${num(u.netto,1)} uur per week, exclusief dienst`,
              status: k.status.personen },
    rechts: { waarde: num(k.binnen100), label: `nac's binnen de 100%`,
              eenheid: 'toegerekende rekeneenheden, geen uitbetalingen',
              status: k.status.binnen100 },
    ratio: `Ofwel <b>${num(k.nacPerPersoon,2)}</b> nac per praktijkhouder. Het verschil ontstaat niet doordat
      praktijkhouders gemiddeld te weinig werken, maar doordat uren boven de grens niet extra meetellen en er
      na de fte-telling nog kosten worden geschoond of elders belegd.`
  })}
</section>

<section id="keten">
  <h2>De vier stappen, met de rekenregel per stap</h2>
  <p class="sub">Let op de eenheden: alleen de eerste stap telt mensen. Alles daarna zijn rekeneenheden in een
  kostprijsmodel. Bij elke pijl staat de regel die de stap veroorzaakt, en de reden waarom die regel bestaat.</p>

  ${begrippenBalk([
    { term: 'Personen',            uitleg: 'mensen' },
    { term: `Nac's vóór schoning`, uitleg: 'rekeneenheden' },
    { term: 'Binnen 100%',         uitleg: 'na kostentoerekening' },
    { term: 'Maximumtarieven',     uitleg: 'wettelijk gereguleerd deel' }
  ])}

  ${panel(causalChain({ stappen: k.stappen, fmt: v => num(v, 0) }))}

  ${callout(`Een nac is geen salaris en geen uitbetaling. Het is een normatieve kostenpost die per berekende
    fte praktijkhoudend huisarts in de kostprijs wordt toegerekend, met de werktijdfactor gemaximeerd op 1,0
    per persoon. Wat een praktijkhouder feitelijk overhoudt hangt af van praktijkomvang, productie,
    contractafspraken en bedrijfsvoering. <a href="/inkomen/">Wat daarover bekend is</a>.`, 'letop')}
</section>

<section id="oorzaken">
  <h2>Drie rekenregels</h2>
  <p class="sub">Alle drie op zichzelf verdedigbaar. Samen verklaren ze het verschil precies. De vraag is niet
  of de rekensom klopt, maar of de uitkomst is wat je wilt.</p>
  <div class="grid c3">
    ${evidenceCard({
      claim: 'A · Patiëntengrondslag',
      kern: num(k.brutoNac, 0),
      bewijs: `nac's vóór schoning. Het aantal volgt niet uit het aantal huisartsen maar uit het aantal
        verzekerden: ${num(k.ingeschrevenen)} gedeeld door ${num(k.perFte)} per fte.`,
      status: k.status.brutoNac, href: '#personen-naar-fte', hrefLabel: 'Naar de uitleg' })}
    ${evidenceCard({
      claim: 'B · Aftopping op 1,0',
      kern: num(u.cap) + ' uur',
      bewijs: `De werktijdfactor is uren gedeeld door ${num(u.cap)}, maar nooit hoger dan 1,0 per persoon.
        Wie ${num(u.netto,1)} uur werkt telt precies even zwaar als wie er ${num(u.cap)} maakt.`,
      status: 'definitief', href: '/uren/#grenzen', hrefLabel: 'Naar de urengrenzen' })}
    ${evidenceCard({
      claim: 'C · Schoning',
      kern: pct(b100, 2),
      bewijs: `van de uitkomst blijft binnen de honderd procent; daarvan is ${pct(tg, 1)} tariefgereguleerd.
        De rest wordt verondersteld elders te worden verdiend.`,
      status: 'afgeleid', href: '#schoning', hrefLabel: 'Naar de schoning' })}
  </div>
</section>

<section id="herkomst">
  <h2>Waar dat aantal vandaan komt</h2>
  <p class="sub">Het aantal arbeidsvergoedingen in de tarieven is het meest geciteerde cijfer op deze site.
  Het is <b>geen telling maar een deling</b>: het aantal ingeschreven verzekerden gedeeld door het aantal
  patiënten dat de NZa aan één voltijdplaats toerekent. Dat is precies hoe de NZa zelf rekent — de
  fte-telling volgt de patiëntengrondslag, niet het aantal huisartsen. Hieronder staan de twee getallen die
  die deling maken, een controle langs een tweede weg, en wat er gebeurt als de deler anders was gekozen.</p>

  ${panel(table({
    cols:[{label:'Wat er in de deling gaat'},{label:'Waarde',r:true},{label:'Waar het vandaan komt'},{label:'Status'}],
    rows:[
      ['Ingeschreven verzekerden, ' + k.jaar, num(k.ingeschrevenen,0),
       'Vektis-verzekerdejaren, doorgetrokken naar ' + k.jaar, `<span class="badge ${esc(p('nac','ingeschrevenen_2025').status)}">${esc(p('nac','ingeschrevenen_2025').status)}</span>`],
      ['Ingeschrevenen per fte praktijkhoudend huisarts', num(H.perFte,0),
       'NZa Verantwoordingsdocument, Tabel 36, invalshoek 2', `<span class="badge ${esc(p('nac','patienten_per_fte').status)}">${esc(p('nac','patienten_per_fte').status)}</span>`],
      ['<b>Vergoedingen vóór schoning</b>', '<b>'+num(k.brutoNac,0)+'</b>',
       num(k.ingeschrevenen,0) + ' ÷ ' + num(H.perFte,0), `<span class="badge ${esc(k.status.brutoNac)}">${esc(k.status.brutoNac)}</span>`]
    ]
  }))}
  <p class="small">Van die uitkomst blijft ${pct(H.aandeelBinnen100,2)} binnen de honderd procent, en daarvan
  is ${pct(H.aandeelTariefGereguleerd,1)} tariefgereguleerd. <a href="#personen-naar-fte">Die twee stappen
  staan hieronder uitgewerkt</a>.</p>
</section>

<section id="kruiscontrole">
  <h2>Twee wegen naar hetzelfde getal</h2>
  <p class="sub">Een afleiding die je nergens tegen kunt houden, is een aanname. Daarom loopt er een tweede
  weg naar dit cijfer, die niets met de eerste te maken heeft: de Cijfer-Meester leidt het af uit de
  tariefdekking per duizend ingeschrevenen in de NZa-verantwoordingen, zonder de deling hierboven te
  gebruiken. Als beide wegen op hetzelfde uitkomen, is dat een echte controle.</p>
  ${panel(table({
    cols:[{label:'Jaar'},{label:'Keten van deze site',r:true},{label:'Cijfer-Meester',r:true},{label:'Verschil',r:true}],
    rows: H.routes.map(r => [String(r.jaar), num(r.eigen,1), num(r.extern,0),
      (r.afwijking >= 0 ? '+' : '−') + pct(Math.abs(r.afwijking),2)])
  }))}
  ${callout(`<strong>Ze liggen ${pct(H.grootsteAfwijking,2)} uit elkaar.</strong> Dat is geen toeval en ook
  geen kunstje: de twee routes delen alleen het onderwerp, niet de rekenwijze. Een test in de broncode
  faalt zodra het verschil boven een half procent komt, zodat een fout in de ene weg niet stilletjes kan
  meelopen met de andere.`, 'inzicht')}
</section>

<section id="gevoeligheid">
  <h2>Hoe hard is dat getal?</h2>
  <p class="sub">Alle onzekerheid zit in dezelfde deler. De ${num(H.perFte,0)} patiënten per voltijdplaats is
  een uitkomst van het kostprijsonderzoek, geen natuurconstante. Hieronder staat wat er met de hele keten
  gebeurt als die anders was uitgevallen. De middelste regel is wat de site hanteert.</p>
  ${panel(table({
    cols:[{label:'Ingeschrevenen per fte'},{label:'Vóór schoning',r:true},{label:'Binnen de 100%',r:true},
          {label:'Gedekt door maximumtarieven',r:true},{label:'Verschil met de gehanteerde waarde',r:true}],
    rows: H.gevoeligheid.map(g => {
      const b = t => g.gehanteerd ? '<b>'+t+'</b>' : t;
      return [b(num(g.perFte,0) + (g.gehanteerd ? ' — gehanteerd' : '')), b(num(g.bruto,0)),
              b(num(g.binnen100,0)), b(num(g.gedekt,0)),
              b(g.afwijking === 0 ? '—' : (g.afwijking > 0 ? '+' : '−') + pct(Math.abs(g.afwijking),1))];
    })
  }))}
  ${callout(`<strong>Vijftig patiënten per voltijdplaats verzetten het getal met
  ${pct(Math.abs(H.gevoeligheid.find(g => g.perFte === H.perFte - 50)?.afwijking ?? 0), 1)}.</strong>
  Dat maakt de conclusies op deze site niet anders: de modelwissel van 2025 haalde er
  ${pct(1 - w('modelwissel','fte_p1000_2022') / w('modelwissel','fte_p1000_2015'), 1)} af, een orde van
  grootte meer. Maar het betekent wel dat ${num(k.binnen100,0)} moet worden gelezen als een afleiding met
  een marge, niet als een meting. Zo staat hij overal op de site ook gemarkeerd.`, 'letop')}
  <p class="small">Nog iets om te weten bij de reeks 2018-2026: tot en met 2024 komen de aantallen
  rechtstreeks uit de Cijfer-Meester, vanaf 2025 uit de keten hierboven. Die knip is de modelwissel — vóór
  2025 bestond deze rekenwijze nog niet. <a href="/modelwissel/">Wat er toen veranderde</a>.</p>
</section>

<section id="personen-naar-fte">
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

<section id="schoning">
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

<section id="maximumtarieven">
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

  <h3>Wie moet welk deel dekken?</h3>
  <p class="sub">Dezelfde keten, uitgedrukt per gewerkt uur. Een deel landt in prestaties met een
  NZa-maximumtarief. De rest wordt verondersteld te worden verdiend uit vrij onderhandelbare zorg, uit de
  aparte poh-ggz-module, of uit activiteiten buiten de tariefbeschikking.</p>
  ${panel(stackedBar({
    items: delen.map(d => ({ naam: d.naam, kort: d.kort, waarde: d.waarde, toelichting: d.toelichting })),
    caption: `Opbouw van de normatieve arbeidsvergoeding per gewerkt uur, prijspeil 2025.
      Noemer: alle gewerkte uren van de beroepsgroep, exclusief de apart bekostigde dienst.`
  }))}
  ${methodDisclosure('Hoe dit bedrag is opgebouwd', `
    <p class="small">Het landelijke bedrag aan normatieve arbeidskosten wordt gedeeld door alle uren die
    praktijkhouders samen werken: ${num(k.personen)} personen maal ${num(u.netto,1)} uur maal
    ${num(u.werkweken)} werkweken. Dat geeft ${eur(perUur)} per gewerkt uur. Daarvan blijft ${pct(b100,2)}
    binnen de honderd procent, en daarvan is ${pct(tg,1)} tariefgereguleerd.</p>
    <p class="small">De dienst op de huisartsenpost zit niet in de noemer. Die zorg kent een aparte
    bekostiging en valt buiten de overdagtarieven. <a href="/uren/#anw">Waarom die aftrek nodig is</a>.</p>`)}
</section>

<section id="rekentool">
  <h2>Wat gebeurt er als meer van de werkweek wordt meegeteld?</h2>
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
  <p class="small" style="margin-top:14px">Verschuif alleen de meegetelde werkweek; alle andere landelijke
  grondslagen blijven gelijk. Zo wordt zichtbaar hoeveel de uitkomst verandert door de gekozen urenscope — en
  niet door een andere aanname elders. Deze rekentool gebruikt dezelfde datalaag als de cijfers hierboven.
  Het aantal nac's volgt uit de ingeschreven verzekerden gedeeld door ${num(pf)}; de verdeling over
  dekkingsbronnen is de schoning uit de tabel bovenaan deze pagina.</p>
</section>

<script id="calcdata" type="application/json">${JSON.stringify({
  jaren:J, pf, sb, sp, b100, tg, wkn:w('uren','werkweken'), bronnen:data.nac.dekkingsbronnen
})}</script>
<script src="/calc-arbeidskosten.js" defer></script>`;

  return { pad:'/arbeidskosten/', html: pagina({
    pad:'/arbeidskosten/', titel:'Arbeidskosten praktijkhoudend huisarts',
    eyebrow:'Van beroepsgroep naar tariefonderbouwing',
    h1:`${num(k.personen)} praktijkhouders worden ${num(k.binnen100)} nac's binnen de 100%`,
    status:[`Prijspeil ${k.jaar}`, `praktijkhouders: ${k.status.personen}`,
            `keten: ${k.status.binnen100}`],
    omschrijving:'De keten van werkelijke bezetting naar het deel dat door NZa-maximumtarieven wordt gedekt.',
    lede:`De beroepsgroep werkt gemiddeld ruim boven voltijd. Toch komt de landelijke tariefonderbouwing
      binnen de honderd procent uit op ongeveer ${num(k.nacPerPersoon,2)} nac per praktijkhouder. Dat verschil
      ontstaat door de fte-systematiek, de aftopping op 1,0 en de schoning die daarna volgt.`,
    body })};
}
