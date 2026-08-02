import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, dataTable, tile, callout, lineChart } from '../lib/components.mjs';
import { eur, num, pct } from '../lib/format.mjs';

export default function () {
  const T = data.tarieven.tabellen;
  const V = T.indexatie_verantwoording.rijen, A = T.indexatie_addendum.rijen;

  const body = `
<section>
  <div class="grid c3">
    ${tile({ waarde: eur(w('tarieven','kostprijs_inschrijving_2022')), label:'landelijke kostprijs van een basisinschrijving per kwartaal, prijspeil definitief 2022', bron:'NZa Tabel 27' })}
    ${tile({ waarde: eur(w('tarieven','kostprijs_consult_2022')), label:'landelijke kostprijs van een regulier consult, prijspeil definitief 2022', bron:'NZa Tabel 27' })}
    ${tile({ waarde: '+' + pct(w('tarieven','effect_2026_consult'),2), label:'wat de herbeoordeling werkelijk doet met het consulttarief van 2026 — de NZa communiceerde +2,2%', bron:'Tariefbeschikking TB/REG-26611-02', href:'#tweekommatwee' })}
  </div>
</section>

<section>
  <h2>Van kostprijs naar tarief</h2>
  <p class="sub">De kostprijzen zijn berekend op onderzoeksjaar 2022 en worden daarna per kostencomponent
  geïndexeerd: arbeids- en personeelskosten met de ova, materiële kosten met de prijsindex particuliere
  consumptie, en de huisvestingscomponent met een vast percentage.</p>
  ${panel(dataTable(T.indexpercentages, [null, v=>pct(v,2), v=>pct(v,2), v=>pct(v,2), v=>pct(v,2), v=>pct(v,2)]))}
</section>

<section id="tweereeksen">
  <h2>Twee documenten, twee reeksen — en nu weten we waarom</h2>
  <p class="sub">Het Verantwoordingsdocument 2025 en het Addendum vanaf 2026 geven allebei een indexatiereeks
  voor de basisprestaties, met verschillende bedragen. Het Addendum is de reeks van vóór de herbeoordeling; het
  Verantwoordingsdocument die van erná. Nergens staat dat er zo bij, maar de tariefbeschikking bewijst het.</p>
  ${panel(dataTable(T.indexatie_addendum, [null, eur, eur, eur]))}
  ${panel(dataTable(T.indexatie_verantwoording, [null, eur, eur, eur, eur]))}
  ${callout(`<strong>De controle.</strong> Voor het basistarief inschrijving voorcalculatorisch 2025 noemt het
  Addendum ${eur(A[0][1])} en het Verantwoordingsdocument ${eur(V[0][4])} — ${pct(V[0][4]/A[0][1]-1,1)} verschil.
  Trek je de vc-2026-waarde van het Addendum (${eur(A[0][3])}) door met datzelfde effect, dan kom je uit op het
  basistarief dat in de tariefbeschikking van 30 juni 2026 daadwerkelijk is vastgesteld. Dat maakt het verschil
  tussen de twee documenten verklaarbaar: het is de herbeoordeling.`)}
</section>

<section id="tweekommatwee">
  <h2>De 2,2% die geen 2,2% is</h2>
  <p class="sub">De NZa communiceert dat de herbeoordeling de kostprijzen met 2,2% heeft bijgesteld. Dat klopt —
  op prijspeil 2022. Op de tarieven die praktijken in 2026 daadwerkelijk in rekening brengen, is het effect
  kleiner: ${pct(w('tarieven','effect_2026_inschrijving'),1)} op de inschrijving en
  ${pct(w('tarieven','effect_2026_consult'),1)} op het consult. Voor een reeks prestaties is het nul.</p>
  <div class="panel">
    <p style="margin:0;font-style:italic;color:var(--text-secondary)">
    “De herbeoordeling heeft geleid tot een bijstelling van de kostprijzen met + 2,2% op basis van het prijspeil
    2022, het jaar van onderzoek en het startpunt voor de tariefberekening. Het precieze tariefeffect in
    opvolgende jaren (het verschil tussen de tarieven vóór en tarieven na herbeoordeling) kan door de indexatie
    per jaar iets verschillen.”</p>
    <p class="bron" style="margin:10px 0 0">NZa, Vraag en antwoord tarieven huisartsenzorg na herbeoordeling,
    13 juli 2026, onder de kop “Waarom zie ik de stijging van 2,2% na herbeoordeling niet direct terug?”</p>
  </div>
  ${panel(dataTable(T.herbeoordeling_2026, [null, eur, eur, v=>'+'+pct(v,2)]))}
  ${callout(`<strong>Waarom het percentage krimpt.</strong> De bijstelling zit vrijwel geheel in twee posten:
  de normatieve huisvestingscomponent en de arbeidskosten van de praktijkhouder. Die twee worden geïndexeerd
  met andere percentages dan de rest van de kostprijs — de huisvestingscomponent met een vaste
  ${pct(0.025,1)} per jaar. Het bijgestelde deel groeit dus langzamer dan het geheel, en het relatieve effect
  loopt ieder jaar iets terug: van ${pct(w('tarieven','effect_herbeoordeling'),1)} op prijspeil 2022 naar
  ${pct(w('tarieven','effect_2025_inschrijving'),1)} op 2025 en ${pct(w('tarieven','effect_2026_inschrijving'),1)}
  op 2026.`)}
</section>

<section>
  <h2>En voor deze prestaties is het nul</h2>
  <p class="sub">Niet elk gereguleerd tarief hangt aan de drie basisprestaties. Wat daar los van staat, deelt
  ook niet in de bijstelling — hoe de onderbouwing ervan ooit ook tot stand kwam.</p>
  ${panel(dataTable(T.niet_meegestegen, null))}
  ${callout(`<strong>Het anw-uurtarief is ooit juist wél op de nac gebouwd.</strong> Bij de herijking per 2023
  is de ophoging van het dienstuurtarief onderbouwd door “aansluiting te zoeken bij de hoogte van de nac voor
  huisartseigenaren zoals deze in 2022 gold”. Nu de nac fors is herijkt, legt de NZa die koppeling uitdrukkelijk
  niet meer: de dienstuurtarieven zijn sindsdien een vaste norm die alleen nog wordt geïndexeerd. De
  onderbouwing werkt dus één kant op. <a href="/uren/#anw">Wat dat betekent voor de dienst</a>.`)}
</section>

<section>
  <h2>Wat de NZa zelf over de ontwikkeling zegt</h2>
  <p class="sub">Uit de toelichting van 13 juli 2026:</p>
  <div class="panel">
    <p style="margin:0;font-style:italic;color:var(--text-secondary)">
    “Op basis van het recent uitgevoerde kostprijsonderzoek en de herbeoordeling is er sprake van een lichte
    daling van kostprijzen ten opzichte van het eerder uitgevoerde kostprijsonderzoek. Als gevolg van indexatie
    stijgen de tarieven alsnog.”</p>
  </div>
  <p class="small" style="margin-top:12px">De vergoeding voor de arbeidskosten van huisartseigenaren stijgt
  volgens de NZa met ${pct(w('tarieven','nac_stijging'),1)} exclusief indexatie. Dat die forse stijging in de
  tarieven nauwelijks te zien is, komt doordat het <em>aantal</em> nac’s dat wordt ingerekend tegelijk sterk
  daalde. <a href="/arbeidskosten/">Die twee bewegingen staan hier naast elkaar</a>.</p>
</section>`;

  return { pad:'/tarieven/', html: pagina({
    pad:'/tarieven/', titel:'Basistarieven', eyebrow:'Van kostprijs naar maximumtarief',
    h1:'De basistarieven en hoe ze tot stand komen',
    omschrijving:'Kostprijzen 2022, indexatie per kostencomponent, en een onverklaard verschil tussen twee NZa-documenten.',
    lede:`Drie basisprestaties dragen de onderbouwing: de inschrijving, het consult en het passantenconsult.
      Alle andere gereguleerde tarieven zijn daarvan afgeleid of apart onderbouwd.`,
    body })};
}
