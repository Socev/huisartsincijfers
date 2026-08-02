import { pagina, SITE } from '../lib/layout.mjs';
import { panel, callout } from '../lib/components.mjs';
import { datum } from '../lib/format.mjs';

export default function () {
  const body = `
<section id="methode">
  <h2>Hoe wij werken</h2>
  <p>Deze site brengt openbare brondata over de bekostiging van de huisartsenzorg bij elkaar en rekent ermee.
  Het uitgangspunt is simpel: geen enkel getal zonder bron, en geen enkele bewerking zonder dat de rekenstap
  erbij staat.</p>
  <p>Alle cijfers staan in één datalaag. De pagina's, grafieken en rekentools lezen daaruit; nergens staat een
  getal los in de tekst. Wordt een bron bijgewerkt, dan wijzigt één bestand en loopt de hele site mee. De
  <a href="/bronnen/">bronnenpagina</a> wordt uit diezelfde laag opgebouwd.</p>
  <h3>Drie statussen</h3>
  <p>Bij elk cijfer staat waar het vandaan komt:</p>
  <ul>
    <li><b>Definitief</b> — staat letterlijk in de genoemde bron, op de genoemde plaats.</li>
    <li><b>Afgeleid</b> — door ons berekend uit een of meer bronnen. De rekenstap staat er altijd bij.</li>
    <li><b>Schatting</b> — berust op extrapolatie of op een aanname. Zulke cijfers dragen de conclusie nooit alleen.</li>
  </ul>
  <h3>Openbaar rekenwerk</h3>
  <p>De volledige broncode en de wijzigingshistorie staan op
  <a href="https://github.com/Socev/huisartsincijfers" rel="noopener">GitHub</a>. Van elk getal is na te gaan wanneer
  het is toegevoegd of gewijzigd. Dat is bewust: bij een site die over cijfers gaat, moet ook de eigen
  cijferbehandeling controleerbaar zijn.</p>
</section>

<section id="voorbehoud">
  <h2>Voorbehoud</h2>
  ${callout(`Dit is geen medisch, juridisch of financieel advies. Het is een verzameling openbare cijfers met
  bewerkingen erop. Wie er beslissingen op baseert, doet dat op eigen verantwoordelijkheid.`)}
  <p>Wij zijn geen onafhankelijke partij: deze site wordt gemaakt door mensen die zelf in de huisartsenzorg
  werken. Dat is precies de reden om elk getal herleidbaar te maken. U hoeft ons niet te geloven; u kunt het
  narekenen.</p>
  <h3>Wat wij niet doen</h3>
  <ul>
    <li>Wij publiceren geen cijfer waarvan wij de bron niet kunnen aanwijzen.</li>
    <li>Wij presenteren geen vermoeden als bevinding. Waar wij iets aannemelijk maar onbewezen vinden, staat dat erbij.</li>
    <li>Wij verwijderen geen cijfer stilzwijgend. Correcties gaan via een zichtbare wijziging.</li>
  </ul>
  <h3>Bekende beperkingen</h3>
  <ul>
    <li>Het aantal praktijkhoudend huisartsen en het aantal ingeschreven verzekerden voor 2025 en 2026 zijn
    geëxtrapoleerd. Ze staan als schatting gemarkeerd.</li>
    <li>De onderverdeling van de niet-patiëntgebonden tijd uit het Nivel-onderzoek is afgelezen uit een figuur
    en is bij benadering.</li>
    <li>De classificatie van de vrije invulvelden in het kostprijsonderzoek is gedaan op trefwoorden en is
    interpretatie.</li>
    <li>Twee NZa-documenten geven verschillende tarieven voor voorcalculatorisch 2025. Wij kiezen daar geen kant
    in tot dat is opgehelderd.</li>
  </ul>
</section>

<section id="correcties">
  <h2>Een fout gevonden?</h2>
  <p>Graag. Een verkeerd cijfer op deze site schaadt het punt dat de site probeert te maken, dus correcties zijn
  welkom — ook als ze slecht uitkomen. Meld het via
  <a href="https://github.com/Socev/huisartsincijfers/issues" rel="noopener">GitHub</a>, met vermelding van de pagina
  en de bron waarop u zich baseert.</p>
  <p class="small">Laatst bijgewerkt op ${datum(SITE.bijgewerkt)}.</p>
</section>`;

  return { pad:'/over/', html: pagina({
    pad:'/over/', titel:'Over deze site', eyebrow:'Verantwoording en voorbehoud',
    h1:'Wat dit is, en wat het niet is',
    omschrijving:'Hoe deze site met cijfers omgaat, welke statussen wij hanteren, en waar de grenzen liggen.',
    lede:`Een site die anderen op hun cijfers aanspreekt, moet zelf boven twijfel staan. Daarom staat hier hoe
      wij werken, wat wij niet doen, en waar de zwakke plekken zitten.`,
    body })};
}
