import { pagina } from '../lib/layout.mjs';
import { w, p, data } from '../lib/data.mjs';
import { panel, callout, dataTable, table, tile, barChart, compareBars, bronLabel, stackedBar } from '../lib/components.mjs';
import { num, pct, uur, eur, esc } from '../lib/format.mjs';

export default function () {
  const T = data.uren.tabellen;
  const inScope = T.nivel_taken.rijen.filter(r => r[2] === 'ja').reduce((s,r)=>s+r[1],0);
  const buiten  = T.nivel_taken.rijen.filter(r => r[2] === 'nee').reduce((s,r)=>s+r[1],0);

  const body = `
<section>
  <div class="grid c3">
    ${tile({ waarde: num(w('uren','uren_per_nac')), label:'opgegeven uren per jaar tegenover één normatieve arbeidskostencomponent', bron:'Microdata kostprijsonderzoek 2022' })}
    ${tile({ waarde: num(w('uren','cao_hidha')), label:'uren per jaar rekent de NZa voor één fte volgens de cao hidha', bron:'NZa par. 10.4.9' })}
    ${tile({ waarde: uur(w('uren','niet_uitgevraagd')), label:'per week valt buiten de drie categorieën waar de NZa naar vraagt', bron:'Nivel 2024 en NZa par. 10.4.9' })}
  </div>
  ${callout(`Eén nac koopt ${num(w('uren','uren_per_nac'))} opgegeven uren. De cao hidha rekent
    ${num(w('uren','cao_hidha'))} uur voor één volledige fte. <strong>De praktijkhouder levert dus een volledig
    hidha-jaar aan uren die de NZa telt</strong> — en daarbovenop nog eens ${num(w('uren','niet_uitgevraagd'),1)}
    uur per week waar niet naar gevraagd wordt.`)}
</section>

<section>
  <h2>Waarom Nivel 55,7 uur meet en de NZa 46,2 uur opgeeft</h2>
  <p class="sub">Dat verschil is geen meetfout. De NZa vraagt in het uitvraagformat naar drie dingen:
  <em>zorg verlenen, praktijk managen en inzet apotheek</em>. Nivel meet met momentmetingen alle tijd die een
  huisarts aan het vak besteedt. Leg je de twee naast elkaar, dan sluit het vrijwel exact.</p>
  ${panel(dataTable(T.nivel_taken, [null, v=>num(v,1), null]))}
  ${panel(compareBars({
    items:[
      { label:'Binnen de NZa-uitvraag (26 + 14 + 6)', waarde:inScope, serie:1, toelichting:'De NZa publiceert 46,2 uur per fte' },
      { label:'Buiten de uitvraag: bestuur, extern overleg, scholing, dienst', waarde:buiten, serie:2, toelichting:'Bestaat niet in de tariefonderbouwing' },
      { label:'Werkelijke werkweek volgens Nivel', waarde:w('uren','nivel_werkweek'), serie:3, toelichting:'Figuur 18, zelfstandig gevestigde huisartsen' }
    ], fmt:v=>num(v,1), eenheid:' u', caption:'Werkweek praktijkhoudend huisarts, uren per week.'
  }))}
  <p class="small">De onderverdeling van de niet-patiëntgebonden tijd is afgelezen uit figuur 19 van het
  Nivel-rapport en is bij benadering. De toewijzing wel of niet uitgevraagd is onze interpretatie van de drie
  categorienamen; de NZa licht de vraagstelling nergens verder toe.</p>
</section>

<section>
  <h2>Wat de microdata laten zien</h2>
  <p class="sub">De onderliggende opgaven van de huisarts-eigenaren in het kostprijsonderzoek. De som van de
  afgetopte werktijdfactoren komt uit op ${num(w('uren','fte_gecapt'),2)} fte, precies het getal dat de NZa in
  Tabel 9 publiceert — een controle dat wij met dezelfde grondslag rekenen.</p>
  ${panel(dataTable(T.opgave_verdeling, [null, v=>pct(v,1)]))}
  <p class="small">Zichtbare zelfrapportage-artefacten: bij toeval zou ongeveer een vijfde van de opgaven op een
  veelvoud van vijf uitkomen. Dat is geen bewijs dat de meting onbruikbaar is, wel dat het om schattingen achteraf gaat.</p>
</section>

<section>
  <h2>Identieke opgaven binnen maatschappen</h2>
  <p class="sub">Bij ruim de helft van de tweemansmaatschappen geven beide maten exact hetzelfde aantal uren op.</p>
  ${panel(dataTable(T.maatschappen, [null, v=>pct(v,1)]))}
  ${callout(`<strong>Voorzichtig hiermee.</strong> Slechts dertig procent van die identieke waarden is een rond
  getal — ze liggen op 39, 34, 38 en 46 uur. Dat wijst eerder op één opgave die op praktijkniveau is ingevuld en
  over de maten gekopieerd, dan op afronding. Maar twee maten die werkelijk evenveel werken is niet vreemd.
  Dit is een aanwijzing, geen bevinding.`)}
</section>

<section>
  <h2>De aftopping op 1,0 fte</h2>
  <p class="sub">De werktijdfactor is het aantal opgegeven uren gedeeld door 36, gemaximeerd op 1. Wie meer werkt,
  telt niet meer mee. Het gaat om ${pct(w('uren','boven_cap'),0)} van de eigenaren, gemiddeld
  ${num(w('uren','boven_cap_uren'),1)} uur per week boven de grens.</p>
  ${panel(compareBars({
    items:[
      { label:'Som fte zonder aftopping', waarde:w('uren','fte_ongecapt'), serie:2 },
      { label:'Som fte met aftopping — zoals ingerekend', waarde:w('uren','fte_gecapt'), serie:1,
        toelichting:'NZa Tabel 9' }
    ], fmt:v=>num(v,1), eenheid:' fte', caption:'Fte praktijkhoudend huisarts in de onderzoeksgroep van het kostprijsonderzoek.'
  }))}
  <p class="small" style="margin-top:6px">Verschil: ${num(w('uren','fte_ongecapt')-w('uren','fte_gecapt'),1)} fte,
  ofwel ${pct(w('uren','fte_ongecapt')/w('uren','fte_gecapt')-1,1)} bovenop de ingerekende fte.
  ${bronLabel(p('uren','fte_ongecapt'))}</p>
  ${callout(`Voor personeel rekent de NZa uren om naar fte tegen 38 uur maal 52 weken (cao huisartsenzorg) of
  40 maal 52 (cao hidha), en de werkelijke loonkosten staan gewoon in de boeken. Voor de praktijkhouder geldt
  36 uur maal 46 weken, en dan afgetopt. <strong>De praktijkhouder is de enige in de praktijk wiens extra uren
  nergens in de kostprijs terechtkomen.</strong>`)}
</section>

<section>
  <h2>Hoeveel uur telt één fte?</h2>
  ${panel(dataTable(T.uren_per_fte, [null, num]))}
</section>`;

  return { pad:'/uren/', html: pagina({
    pad:'/uren/', titel:'Uren en de fte-definitie', eyebrow:'Arbeidsduur praktijkhoudend huisarts',
    h1:'Wat telt als een fte, en wat telt helemaal niet mee',
    omschrijving:'Waarom de NZa 46,2 uur per fte opgeeft terwijl Nivel 55,7 uur meet, en wat de aftopping op 1,0 fte betekent.',
    lede:`De NZa bepaalt het aantal fte praktijkhoudend huisarts uit zelf opgegeven uren, gedeeld door 36 en
      afgetopt op 1,0. Hier staat wat er in die opgave zit, wat er buiten valt, en wat dat betekent.`,
    body })};
}
