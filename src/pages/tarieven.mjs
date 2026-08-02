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
    ${tile({ waarde: '+' + pct(w('tarieven','effect_herbeoordeling'),1), label:'bijstelling van de kostprijzen door de herbeoordeling na de uitspraak van het CBb', bron:'NZa, vraag en antwoord' })}
  </div>
</section>

<section>
  <h2>Van kostprijs naar tarief</h2>
  <p class="sub">De kostprijzen zijn berekend op onderzoeksjaar 2022 en worden daarna per kostencomponent
  geïndexeerd: arbeids- en personeelskosten met de ova, materiële kosten met de prijsindex particuliere
  consumptie, en de huisvestingscomponent met een vast percentage.</p>
  ${panel(dataTable(T.indexpercentages, [null, v=>pct(v,2), v=>pct(v,2), v=>pct(v,2), v=>pct(v,2), v=>pct(v,2)]))}
</section>

<section>
  <h2>Twee documenten, twee reeksen</h2>
  <p class="sub">Het Verantwoordingsdocument 2025 en het Addendum vanaf 2026 geven allebei een indexatiereeks
  voor de basisprestaties. Voor voorcalculatorisch 2025 geven ze verschillende bedragen.</p>
  ${panel(dataTable(T.indexatie_verantwoording, [null, eur, eur, eur, eur]))}
  ${panel(dataTable(T.indexatie_addendum, [null, eur, eur, eur]))}
  ${callout(`<strong>Openstaande vraag.</strong> Voor het basistarief inschrijving op voorcalculatorisch niveau
  2025 noemt het Verantwoordingsdocument ${eur(V[0][4])} en het Addendum ${eur(A[0][1])} — een verschil van
  ${pct(V[0][4]/A[0][1]-1,1)}. Voor het consult en het passantenconsult loopt hetzelfde verschil mee.
  Waarschijnlijk gaat het om tarieven van vóór en ná de herbeoordeling, maar dat staat er niet bij.
  Wij hebben dit voorgelegd en publiceren hier geen afgeleide reeks tot het antwoord er is.`)}
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
  volgens de NZa met ${pct(w('tarieven','nac_stijging'),1)} exclusief indexatie. De maximumtarieven voor de
  basisprestaties liggen in 2026 ${pct(w('tarieven','stijging_2026'),1)} hoger dan in 2025, beide
  voorcalculatorisch.</p>
</section>`;

  return { pad:'/tarieven/', html: pagina({
    pad:'/tarieven/', titel:'Basistarieven', eyebrow:'Van kostprijs naar maximumtarief',
    h1:'De basistarieven en hoe ze tot stand komen',
    omschrijving:'Kostprijzen 2022, indexatie per kostencomponent, en een onverklaard verschil tussen twee NZa-documenten.',
    lede:`Drie basisprestaties dragen de onderbouwing: de inschrijving, het consult en het passantenconsult.
      Alle andere gereguleerde tarieven zijn daarvan afgeleid of apart onderbouwd.`,
    body })};
}
