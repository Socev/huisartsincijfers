/* ===========================================================================
   Bouwstenen voor de rondleidingen (bezoekersreis, review §5-§7).

   Eén stap = voortgang, kop, kerngetal, maximaal twee zinnen, uitklapbaar
   "Waarom?", "Controleer dit" naar exacte dossier-ankers, en de knoppen
   Vorige en Verder. Gewone links, geen JavaScript nodig; de pijltoetsen in
   site.js zijn een extraatje. Beide routes gebruiken deze module, zodat de
   rondleidingen identiek aanvoelen.
   =========================================================================== */
import { panel, methodDisclosure } from './components.mjs';
import { esc } from './format.mjs';

/** Genummerde lijst "Kop. tekst"-alinea's voor het Waarom?-blok. */
export const uitleg = delen => delen.map(([kop, tekst]) =>
  `<p><b>${esc(kop)}.</b> ${tekst}</p>`).join('');

/**
 * Eén stap van een rondleiding. `verderNaar` overschrijft waar de laatste
 * stap heen leidt (standaard het #verder-blok op dezelfde pagina).
 */
export function stap({ nr, totaal, id, kop, tekst, visual, waarom, controleer,
                       laatste, verderNaar, verderLabel }) {
  const vorige = nr > 1 ? `#stap-${nr - 1}` : null;
  const verder = laatste ? (verderNaar ?? '#verder') : `#stap-${nr + 1}`;
  const checks = (controleer ?? []).map(c =>
    `<a href="${esc(c.href)}">${esc(c.label)}</a>`).join('<span class="sep"> · </span>');
  return `
<section id="${id}">
  <p class="stapkop">Stap ${nr} van ${totaal}</p>
  <h2>${kop}</h2>
  <p class="sub">${tekst}</p>
  ${visual ? panel(visual) : ''}
  ${waarom ? methodDisclosure('Waarom?', waarom) : ''}
  ${checks ? `<p class="controleer"><b>Controleer dit:</b> ${checks}</p>` : ''}
  <nav class="stapnav" aria-label="Stap ${nr} van ${totaal}: navigatie">
    ${vorige ? `<a class="knop-sec" href="${vorige}">← Vorige stap</a>` : '<span class="leeg"></span>'}
    <a class="knop" href="${verder}">${verderLabel ?? (laatste ? 'Verder lezen ↓' : 'Verder →')}</a>
  </nav>
</section>`;
}

/** Alle stappen achter elkaar, met nummering en totaal ingevuld. */
export const stappenreeks = (stappen, slot = {}) =>
  stappen.map((s, i) => stap({
    ...s, nr: i + 1, totaal: stappen.length,
    laatste: i === stappen.length - 1,
    verderNaar: i === stappen.length - 1 ? slot.verderNaar : undefined,
    verderLabel: i === stappen.length - 1 ? slot.verderLabel : undefined
  })).join('');
