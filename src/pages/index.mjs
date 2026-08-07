import { pagina } from '../lib/layout.mjs';
import { w, data } from '../lib/data.mjs';
import { nacKeten, werkweek, uurbedragVerschil } from '../lib/metrics.mjs';
import { tile, callout, statContrast, evidenceCard } from '../lib/components.mjs';
import { eur, num, pct, uur } from '../lib/format.mjs';

export default function () {
  const k = nacKeten(2025);
  const u = werkweek();
  const knik = uurbedragVerschil(2024, 2025);

  /* De kop noemt de orde van grootte, niet de precisie. 7.538 is een schatting
     en 5.888 een afleiding; exact opschrijven suggereert een zekerheid die er
     niet is. De exacte waarden en hun status staan in het contrastblok eronder. */
  const rond100 = v => Math.round(v / 100) * 100;


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
      de grens niet extra meetellen en er na de fte-telling nog kosten worden geschoond.
      <a href="/arbeidskosten/#herkomst">Hoe dat aantal is berekend, en hoe hard het is</a>.`
  })}
</section>

<section id="ingangen">
  <h2>Drie manieren om te beginnen</h2>
  <div class="grid c3">
    ${tile({ waarde:'Het dagelijkse werk', href:'/huisarts-zijn/',
      label:'Hoe ziet het werk van een huisarts eruit? De werkweek, de rollen, het inkomen en hoe het vak veranderde — in zes stappen.' })}
    ${tile({ waarde:'De rekensom', href:'/rondleiding/',
      label:'Hoe werkt de bekostiging? Volg de berekening van praktijkhouders naar de vergoeding per gewerkt uur — in zes stappen.' })}
    ${tile({ waarde:'Cijfer controleren', href:'/bronnen/',
      label:'Waar komt een getal vandaan? Zoek in alle bronnen, parameters en rekenstappen, elk met een status.' })}
  </div>
</section>

<section id="keten">
  <h2>Hoe de arbeidskostencomponent over drie niveaus wordt verdeeld</h2>
  <p class="sub">Van mensen naar rekeneenheden, in drie niveaus: wat de NZa <b>terecht acht</b>
  (circa ${num(Math.round(k.brutoNac/100)*100)}), wat daarvan <b>in de basistarieven</b> wordt opgenomen
  (circa ${num(Math.round(k.binnen100/100)*100)}), en wat daarvan <b>via NZa-maximumtarieven</b> te verdienen
  is (circa ${num(Math.round(k.maxTarief/100)*100)}).</p>
  ${callout(`Het begint bij een telling: één voltijdsplaats per ${num(k.perFte)} patiënten. Daarna gaat er
    ${pct(k.aandeelGeschoond, 2)} af — niet geschrapt, maar verplaatst naar andere bekostiging.
    <a href="/rondleiding/">De rondleiding loopt er in zes stappen doorheen</a>;
    <a href="/arbeidskosten/">de volledige keten met alle tussenstappen staat in het dossier</a>.`, 'letop')}
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
      status: 'afgeleid', href: '/uren/#de-aftopping-op-1-0-fte' })}
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
  <h2>Wat daarvan het gevolg was</h2>
  <div class="grid c3">
    ${tile({ waarde: '− ' + eur(Math.abs(knik.verschil)), href: '/uurtarief/',
      label: `per gewerkt uur verdween er tussen 2024 en 2025 uit de tarieven — ${pct(Math.abs(knik.aandeel),1)},
        in het jaar waarin het normbedrag per fte juist steeg.`,
      bron: 'Eigen berekening op de reeks 2018-2026' })}
    ${tile({ waarde: 'Modelwissel', href: '/modelwissel/',
      label: `Wat er in 2025 veranderde: de normpraktijk verdween als rekeneenheid en de toegerekende fte per
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
    h1:`Circa ${num(rond100(k.personen))} praktijkhouders. Circa ${num(rond100(k.binnen100))} nac's in de tariefonderbouwing.`,
    omschrijving:'Hoeveel normatieve arbeidskostencomponenten er tegenover het aantal praktijkhouders staan, en welk deel daarvan door NZa-maximumtarieven wordt gedekt.',
    lede:`De gemiddelde praktijkhouder werkt ${num(u.netto,1)} uur per week, exclusief de apart bekostigde
      dienst op de huisartsenpost. Toch rekent het model binnen de honderd procent gemiddeld ongeveer
      ${num(k.nacPerPersoon,2)} normatieve arbeidskostencomponent per praktijkhouder toe. Hier staat stap voor
      stap hoe dat ontstaat.`,
    status: [`Prijspeil ${k.jaar}`, `praktijkhouders: ${k.status.personen}`,
             `nac's: eigen berekening uit gepubliceerde NZa-grondslagen`],
    acties: { primair:   { href:'/rondleiding/', label:'Volg de rekensom in zes stappen' },
              secundair: { href:'/bronnen/#afgeleid', label:'Controleer de bronnen en rekenstappen' } },
    body })};
}
