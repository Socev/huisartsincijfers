import { pagina } from '../lib/layout.mjs';
import { w, data } from '../lib/data.mjs';
import { heroNumber, tile, stackedBar, callout, panel } from '../lib/components.mjs';
import { eur, num, pct, uur } from '../lib/format.mjs';

export default function () {
  const nacFte = w('nac','ingeschrevenen_2025') / w('nac','patienten_per_fte');
  const uren   = w('nac','praktijkhouders_2025') * (w('uren','nivel_werkweek') - w('uren','anw_dienst')) * w('uren','werkweken');
  const bruto  = nacFte * w('nac','nac_2025_vc') / uren;
  const b100 = w('nac','binnen_100'), tg = w('nac','tarief_gereguleerd');
  const delen = data.nac.dekkingsbronnen.map((d, i) => ({
    ...d, waarde: [bruto*b100*tg, bruto*b100*(1-tg), bruto*w('nac','schoning_buiten_100'), bruto*w('nac','correctie_poh_ggz')][i]
  }));

  const body = `
<section>
  ${heroNumber(eur(delen[0].waarde),
    `per daadwerkelijk gewerkt uur van de praktijkhoudend huisarts is gedekt door NZa-maximumtarieven,
     van de <b>${eur(bruto)}</b> die in totaal normatief wordt ingerekend`)}

  <div class="grid c4" style="margin:38px 0 0">
    ${tile({ waarde: num(w('uren','uren_per_nac')), href:'/uren/',
      label:'opgegeven uren koopt één normatieve arbeidskostencomponent. De cao hidha rekent 2.080 uur voor één fte.',
      bron:'Kostprijsonderzoek 2022 · cao hidha' })}
    ${tile({ waarde: '1 op ' + num(w('nac','patienten_per_fte')/w('nac','binnen_100')), href:'/arbeidskosten/',
      label:'patiënten zit er één volledige arbeidskostencomponent in de tariefonderbouwing. De werkelijke bezetting is 1 op 2.650.',
      bron:'NZa Tabel 19, 36 en 3' })}
    ${tile({ waarde: uur(w('uren','niet_uitgevraagd')), href:'/uren/',
      label:'per week wordt niet uitgevraagd: bestuur, extern overleg, nascholing en de dienst.',
      bron:'Nivel 2024 · NZa par. 10.4.9' })}
    ${tile({ waarde: pct(w('uren','boven_cap'),0), href:'/uren/',
      label:'van de praktijkhouders geeft meer dan 36 uur op. Die uren tellen niet mee: de fte-factor is afgetopt op 1,0.',
      bron:'Kostprijsonderzoek 2022' })}
  </div>
</section>

<section>
  <h2>Wie moet welk deel dekken?</h2>
  <p class="sub">De normatieve arbeidsvergoeding wordt naar rato van omzet toegerekend. Maar een deel landt in
  prestaties met een NZa-maximumtarief. De rest wordt verondersteld te worden verdiend uit vrij onderhandelbare
  zorg, uit de aparte poh-ggz-module, of uit activiteiten buiten de tariefbeschikking.</p>
  ${panel(stackedBar({
    items: delen.map(d => ({ naam: d.naam, kort: d.kort, waarde: d.waarde, toelichting: d.toelichting })),
    caption: `Opbouw van de normatieve arbeidsvergoeding per gewerkt uur, prijspeil 2025.
      Noemer: alle gewerkte uren van de beroepsgroep, exclusief de apart bekostigde dienst.`
  }))}
  <p class="small" style="margin-top:14px"><a href="/arbeidskosten/">De volledige keten van bezetting naar dekkingsbron →</a></p>
</section>

<section>
  <h2>Waar deze site over gaat</h2>
  <p class="sub">Zes ingangen. Elk cijfer is herleidbaar tot een gepubliceerde bron; wat wij zelf hebben
  afgeleid staat als zodanig gemarkeerd, met de berekening erbij.</p>
  <div class="grid c2">
    ${tile({ waarde:'Arbeidskosten', href:'/arbeidskosten/',
      label:'Wat de NZa normatief inrekent voor de arbeid van de praktijkhouder, en welk deel daarvan door gereguleerde tarieven wordt gedekt.' })}
    ${tile({ waarde:'Uren', href:'/uren/',
      label:'Wat de NZa uitvraagt, wat Nivel meet, en waarom die twee cijfers negen uur uit elkaar liggen.' })}
    ${tile({ waarde:'Beroepsgroep', href:'/beroepsgroep/',
      label:'Hoeveel praktijkhouders, huisartsen in dienst en waarnemers er zijn, en hoeveel uur zij werken.' })}
    ${tile({ waarde:'Praktijkkosten', href:'/praktijkkosten/',
      label:'Hoe de kosten van een praktijk zich tussen 2015 en 2022 hebben ontwikkeld, per 1.000 verzekerden.' })}
    ${tile({ waarde:'Inkomen', href:'/inkomen/',
      label:'Wat huisarts-ondernemers verdienen volgens het CBS, en waarom dat niet hetzelfde is als de norm in het tarief.' })}
    ${tile({ waarde:'Omzet en scope', href:'/omzet/',
      label:'Het scope-model, de schoning, en waaruit de omzet buiten de honderd procent werkelijk bestaat.' })}
  </div>
</section>

<section>
  ${callout(`<strong>Dit is geen actiesite.</strong> De cijfers komen uit de stukken van de NZa, het
  tijdsbestedingsonderzoek van het Nivel, de beroepenregistratie en de jaarverslagen van het pensioenfonds.
  Waar wij een eigen bewerking doen staat dat erbij, met de rekenstap, zodat u het kunt narekenen of weerleggen.
  <a href="/over/">Lees hoe wij werken</a>.`)}
</section>`;

  return { pad:'/', html: pagina({
    pad:'/', titel:'Kerncijfers', h1:'De huisartsenzorg in cijfers, herleidbaar tot de bron',
    eyebrow:'Financiering van de huisartsenzorg',
    omschrijving:'Wat er per gewerkt uur in het huisartsentarief zit, en welk deel door gereguleerde tarieven wordt gedekt.',
    lede:`Deze site brengt openbare brondata over de bekostiging van de huisartsenzorg bij elkaar en rekent
      ermee. Geen meningen, wel de rekensom — en de bron eronder.`,
    body })};
}
