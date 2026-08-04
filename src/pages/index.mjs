import { pagina } from '../lib/layout.mjs';
import { w, data } from '../lib/data.mjs';
import { nacKeten, werkweek, uurbedragVerschil } from '../lib/metrics.mjs';
import { tile, stackedBar, callout, panel, statContrast, causalChain,
         evidenceCard, begrippenBalk, methodDisclosure } from '../lib/components.mjs';
import { eur, num, pct, uur } from '../lib/format.mjs';

export default function () {
  const k = nacKeten(2025);
  const u = werkweek();
  const knik = uurbedragVerschil(2024, 2025);

  /* Dezelfde keten, alleen uitgedrukt in euro's per gewerkt uur in plaats van
     in rekeneenheden. Geen tweede route naar hetzelfde getal: de aandelen
     komen uit nacKeten, de noemer uit werkweek(). */
  const uren  = k.personen * u.netto * u.werkweken;
  const bruto = k.brutoNac * w('nac', 'nac_2025_vc') / uren;
  const b100  = w('nac', 'binnen_100'), tg = w('nac', 'tarief_gereguleerd');
  const delen = data.nac.dekkingsbronnen.map((d, i) => ({
    ...d, waarde: [bruto*b100*tg, bruto*b100*(1-tg),
                   bruto*w('nac','schoning_buiten_100'), bruto*w('nac','correctie_poh_ggz')][i]
  }));

  const body = `
<section>
  ${statContrast({
    links:  { waarde: num(k.personen), label: 'praktijkhoudend huisartsen',
              eenheid: `mensen · gemiddeld ${num(u.netto,1)} uur per week, exclusief dienst`,
              status: k.status.personen },
    rechts: { waarde: num(k.binnen100), label: `nac's binnen de 100%`,
              eenheid: 'rekeneenheden in de tariefonderbouwing',
              status: k.status.binnen100 },
    ratio: `Dat is <b>${num(k.nacPerPersoon, 2)}</b> normatieve arbeidskostencomponent per praktijkhouder.
      Het verschil ontstaat niet doordat praktijkhouders gemiddeld te weinig werken, maar doordat uren boven
      de grens niet extra meetellen en er na de fte-telling nog kosten worden geschoond.`
  })}
</section>

<section id="keten">
  <h2>Waar de rekeneenheden onderweg verdwijnen</h2>
  <p class="sub">Vier stappen, van mensen naar het deel dat een wettelijk maximumtarief achter zich heeft.
  Bij elke pijl staat de rekenregel die de stap veroorzaakt.</p>

  ${begrippenBalk([
    { term: 'Personen',            uitleg: 'mensen' },
    { term: `Nac's vóór schoning`, uitleg: 'rekeneenheden' },
    { term: 'Binnen 100%',         uitleg: 'na kostentoerekening' },
    { term: 'Maximumtarieven',     uitleg: 'wettelijk gereguleerd deel' }
  ])}

  ${panel(causalChain({ stappen: k.stappen, fmt: v => num(v, 0) }))}

  ${callout(`De eerste stap telt geen mensen maar patiënten: het model deelt de ingeschreven verzekerden door
    ${num(k.perFte)} per fte. Daarna gaat er nog ${pct(k.aandeelGeschoond, 2)} af. Wat overblijft is geen
    salaris en geen uitbetaling — het is een kostenpost in een tariefberekening.
    <a href="/arbeidskosten/">De volledige keten met alle tussenstappen</a>.`, 'letop')}
</section>

<section id="oorzaken">
  <h2>Waarom ontstaat het verschil?</h2>
  <p class="sub">Drie rekenregels, elk met een eigen gevolg. Samen verklaren zij waarom ruim zevenduizend
  mensen uitkomen op bijna zesduizend rekeneenheden.</p>
  <div class="grid c3">
    ${evidenceCard({
      claim: 'Uren boven 36 tellen niet extra mee',
      kern: pct(u.bovenCapAandeel, 0),
      bewijs: `van de eigenaren geeft meer dan ${num(u.cap)} uur per week op. Voor die groep ligt de opgave
        gemiddeld ${num(u.bovenCapUren, 1)} uur boven de grens, maar de werktijdfactor blijft 1,0.`,
      status: 'afgeleid', href: '/uren/#aftopping' })}
    ${evidenceCard({
      claim: 'De urenuitvraag is smaller dan de werkweek',
      kern: uur(u.nietUitgevraagd),
      bewijs: `per week komt nergens in beeld. Het Nivel meet ${num(u.bruto,1)} uur; na aftrek van
        ${num(u.anw,1)} uur apart bekostigde dienst resteert ${num(u.netto,1)} uur, terwijl de NZa
        ${num(u.uitgevraagd,1)} uur binnen haar uitgevraagde categorieën rapporteert.`,
      status: u.status.nietUitgevraagd, href: '/uren/#scope' })}
    ${evidenceCard({
      claim: 'Na de fte-telling volgt nog schoning',
      kern: pct(k.aandeelGeschoond, 2),
      bewijs: `wordt uit de arbeidskostencomponent binnen de honderd procent gehaald of elders belegd:
        ${pct(w('nac','schoning_buiten_100'), 2)} als omzet buiten de honderd procent en
        ${pct(w('nac','correctie_poh_ggz'), 2)} naar de poh-ggz-module.`,
      status: 'afgeleid', href: '/arbeidskosten/#schoning' })}
  </div>
</section>

<section>
  <h2>Wie moet welk deel dekken?</h2>
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
    ${num(u.werkweken)} werkweken. Dat geeft ${eur(bruto)} per gewerkt uur. Daarvan blijft
    ${pct(b100,2)} binnen de honderd procent, en daarvan is ${pct(tg,1)} tariefgereguleerd.</p>
    <p class="small">De dienst op de huisartsenpost zit niet in de noemer. Die zorg kent een aparte
    bekostiging en valt buiten de overdagtarieven; haar uren toerekenen aan een tarief dat ze niet vergoedt
    zou de uitkomst vertekenen. <a href="/uren/#anw">Waarom die aftrek nodig is</a>.</p>`)}
</section>

<section>
  <h2>Wat daarvan het gevolg was</h2>
  <div class="grid c3">
    ${tile({ waarde: '− ' + eur(Math.abs(knik.verschil)), href: '/uurtarief/',
      label: `per gewerkt uur verdween er tussen 2024 en 2025 uit de tarieven — ${pct(Math.abs(knik.aandeel),1)},
        in het jaar waarin het normbedrag per fte juist steeg.`,
      bron: 'Eigen berekening op de reeks 2018-2026' })}
    ${tile({ waarde: 'Modelwissel', href: '/modelwissel/',
      label: `Wat er in 2025 veranderde: de normpraktijk verdween als rekeneenheid en de vergoede fte per
        1.000 patiënten daalde met ${pct(1 - w('modelwissel','fte_p1000_2022')/w('modelwissel','fte_p1000_2015'), 1)}.` })}
    ${tile({ waarde: 'Praktijkkosten', href: '/praktijkkosten/',
      label: `Waar de groei van de praktijkkosten naartoe ging, en waarom de post voor de praktijkhouder
        tegelijk daalde.` })}
  </div>
</section>

<section>
  <h2>Alle onderwerpen</h2>
  <p class="sub">Elk cijfer is herleidbaar tot een gepubliceerde bron; wat wij zelf hebben afgeleid staat als
  zodanig gemarkeerd, met de rekenstap erbij.</p>
  <div class="grid c2">
    ${tile({ waarde:'Nac en arbeid', href:'/arbeidskosten/',
      label:'Wat de NZa normatief inrekent voor de arbeid van de praktijkhouder, en welk deel daarvan door gereguleerde tarieven wordt gedekt.' })}
    ${tile({ waarde:'Uren en fte', href:'/uren/',
      label:'Wat de NZa uitvraagt, wat het Nivel meet, en waarom die twee cijfers uit elkaar liggen.' })}
    ${tile({ waarde:'Beroepsgroep', href:'/beroepsgroep/',
      label:'Hoeveel praktijkhouders, huisartsen in dienst en waarnemers er zijn, en hoeveel uur zij werken.' })}
    ${tile({ waarde:'Praktijkkosten', href:'/praktijkkosten/',
      label:'Hoe de kosten van een praktijk zich tussen 2015 en 2022 hebben ontwikkeld, per 1.000 verzekerden.' })}
    ${tile({ waarde:'Inkomen en de norm', href:'/inkomen/',
      label:'Wat huisarts-ondernemers verdienen volgens het CBS, en waarom dat niet hetzelfde is als de norm in het tarief.' })}
    ${tile({ waarde:'Omzet en scope', href:'/omzet/',
      label:'Het scope-model, de schoning, en waaruit de omzet buiten de honderd procent werkelijk bestaat.' })}
  </div>
</section>

<section>
  ${callout(`<strong>Feiten eerst. Interpretatie zichtbaar.</strong> Brondata, eigen berekeningen en conclusies
  zijn op deze site afzonderlijk gelabeld. Daardoor hoeft u de afzender niet op zijn woord te geloven: iedere
  stap is na te rekenen. De cijfers komen uit de stukken van de NZa, het tijdsbestedingsonderzoek van het
  Nivel, de beroepenregistratie en de jaarverslagen van het pensioenfonds.
  <a href="/over/">Lees hoe wij werken</a>.`, 'inzicht')}
</section>`;

  return { pad:'/', html: pagina({
    pad:'/', titel:'Kerncijfers',
    eyebrow:'Bekostiging van de huisartsenzorg',
    h1:`${num(k.personen)} praktijkhouders. ${num(k.binnen100)} nac's in de tariefonderbouwing.`,
    omschrijving:'Hoeveel normatieve arbeidskostencomponenten er tegenover het aantal praktijkhouders staan, en welk deel daarvan door NZa-maximumtarieven wordt gedekt.',
    lede:`De gemiddelde praktijkhouder werkt ${num(u.netto,1)} uur per week, exclusief de apart bekostigde
      dienst op de huisartsenpost. Toch rekent het model binnen de honderd procent gemiddeld ongeveer
      ${num(k.nacPerPersoon,2)} normatieve arbeidskostencomponent per praktijkhouder toe. Hier staat stap voor
      stap hoe dat ontstaat.`,
    status: [`Prijspeil ${k.jaar}`, `praktijkhouders: ${k.status.personen}`,
             `nac's: eigen berekening uit gepubliceerde NZa-grondslagen`],
    acties: { primair:   { href:'/arbeidskosten/', label:'Bekijk de volledige rekensom' },
              secundair: { href:'/bronnen/#afgeleid', label:'Controleer de bronnen en rekenstappen' } },
    body })};
}
