import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, dataTable, callout, stackedBar, tile, table, bronLabel } from '../lib/components.mjs';
import { num, pct, eur0, mln, esc } from '../lib/format.mjs';

export default function () {
  const T = data.omzet.tabellen;
  const B = T.buiten_100_samenstelling.rijen;
  const som = k => B.filter(r => r[2] === k).reduce((s,r) => s + r[1], 0);
  const tot = B.reduce((s,r) => s + r[1], 0);
  const wel = som('ja'), niet = som('nee'), geen = som('geen arbeidsinzet'), onb = som('onbekend');
  const ondergrens = (niet + geen) / tot, bovengrens = (niet + geen) / (tot - onb);
  const nacs = w('nac','ingeschrevenen_2025') / w('nac','patienten_per_fte');
  const sb = w('nac','schoning_buiten_100');

  const body = `
<section>
  <h2>Het scope-model</h2>
  <p class="sub">De NZa deelt alle opbrengsten van een praktijk in drie categorieën in. Die indeling bepaalt
  voor welk deel van de kosten geschoond wordt — en dus ook hoeveel van de arbeidsvergoeding van de
  praktijkhouder in de tarieven overblijft.</p>
  ${panel(dataTable(T.scope_model, null))}
  ${callout(`De NZa formuleert het criterium zelf, in twee richtingen. Bij <em>buiten scope</em>: geen schoning
  omdat er <em>“geen kosten of inzet verbonden is die wordt uitgevraagd in dit onderzoek”</em>. En bij de
  poh-ggz-correctie juist wél schoning, omdat die tijd <em>“wel onderdeel uitmaakt van het opgegeven aantal uren
  per week”</em>. Bij de schoning buiten de honderd procent wordt die toets niet toegepast.`)}
</section>

<section>
  <h2>Omzetaandelen binnen de honderd procent</h2>
  <p class="sub">Kosten worden naar rato van omzet toegerekend. Binnen de honderd procent is
  ${pct(w('omzet','tarief_gereguleerd_2022'),1)} tarief gereguleerd; de rest heeft vrije tarieven en dus geen
  wettelijk maximum en geen kostendekkingsgarantie. In 2015 was dat aandeel nog
  ${pct(w('omzet','tarief_gereguleerd_2015'),1)}.</p>
  ${panel(dataTable(T.omzetaandelen, [null, v=>pct(v,1), v=>pct(v,1)]))}
</section>

<section>
  <h2>Waaruit bestaat de omzet buiten de honderd procent?</h2>
  <p class="sub">Voor deze omzet wordt een deel van álle kosten geschoond, inclusief de arbeidsvergoeding van de
  praktijkhouder. Wij hebben de opgaven uit het kostprijsonderzoek uitgesplitst, inclusief de vrije invulvelden
  met de omschrijving die de praktijk zelf gaf.</p>
  ${panel(stackedBar({
    items:[
      { naam:'Uren wél uitgevraagd — schoning terecht', kort:'Wel uitgevraagd', waarde:wel,
        toelichting:'Griepprik, bevolkingsonderzoek, keuringen, zorgactiviteiten in de vrije velden' },
      { naam:'Niet te classificeren', kort:'Onbekend', waarde:onb,
        toelichting:'De omschrijving in het vrije invulveld is te summier' },
      { naam:'Uren niet uitgevraagd', kort:'Niet uitgevraagd', waarde:niet,
        toelichting:'SBOH, opleiding en onderwijs, bestuur en overleg, waarneming' },
      { naam:'Geen arbeidsinzet van de praktijkhouder', kort:'Geen arbeid', waarde:geen,
        toelichting:'Verhuur, rente, subsidie' }
    ],
    fmt: eur0, caption:`Omzet binnen scope maar buiten de honderd procent in de onderzoeksgroep, totaal ${eur0(tot)}.`
  }))}
  ${panel(dataTable(T.buiten_100_samenstelling, [null, eur0, null]))}
</section>

<section>
  <h2>Een asymmetrie</h2>
  <p class="sub">De urenmeting wordt impliciet geschoond door de vraagstelling: er wordt niet gevraagd naar
  bestuur, opleiding of nascholing. De kosten worden vervolgens wél geschoond voor de omzet die uit precies die
  activiteiten voortkomt. Dat telt dubbel af.</p>
  ${panel(table({
    cols:[{label:'Lezing'},{label:'Aandeel van de schoning',r:true},{label:'Deel van de nac',r:true},{label:"NAC's landelijk",r:true}],
    rows:[
      ['Ondergrens — het onbekende deel telt als terecht', pct(ondergrens,1), pct(ondergrens*sb,2), num(nacs*ondergrens*sb,0)],
      ['Bovengrens — het onbekende deel pro rata verdeeld', pct(bovengrens,1), pct(bovengrens*sb,2), num(nacs*bovengrens*sb,0)]
    ]
  }))}
  ${callout(`<strong>Wat dit wel en niet is.</strong> Dit is geen claim dat de nac te laag is vastgesteld. Het is
  een claim dat de schoning op een bredere grondslag rust dan de meting waarop de nac is gebaseerd. De omvang is
  beperkt — enkele tientallen miljoenen — maar de inconsistentie is principieel. En bijna dertig procent van de
  grondslag zit in vrije invulvelden die de NZa nergens specificeert.`)}
  <p class="small">De classificatie van de vrije invulvelden is gedaan op trefwoorden in de door de praktijk zelf
  ingevulde omschrijving. Dat is interpretatie; iemand die het overdoet komt op andere marges uit.
  ${bronLabel(T.buiten_100_samenstelling)}</p>
</section>`;

  return { pad:'/omzet/', html: pagina({
    pad:'/omzet/', titel:'Omzet, scope en schoning', eyebrow:'Verdeelsleutel van de kostentoerekening',
    h1:'De uren worden smal uitgevraagd; de schoning wordt breder toegepast',
    status:[`Kostprijsonderzoek 2022`, `eigen classificatie`, `bandbreedte, geen puntschatting`],
    omschrijving:'Het scope-model van de NZa, de omzetaandelen, en waaruit de omzet buiten de honderd procent werkelijk bestaat.',
    lede:`Bestuur, opleiding en extern overleg vallen buiten de urenuitvraag. Opbrengsten uit zulke
      activiteiten kunnen via de omzetverdeling wél leiden tot schoning van de arbeidskostencomponent.
      Daardoor worden tijd en kosten niet op dezelfde grondslag behandeld.`,
    body })};
}
