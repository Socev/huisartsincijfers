/* ===========================================================================
   Welke pagina gebruikt welke parameter?

   Leest tijdens de build de paginabronnen en zoekt de aanroepen w('bestand',
   'sleutel') en p('bestand','sleutel'). Zo kan de bronnenpagina bij elk cijfer
   tonen waar het op de site terechtkomt — de omgekeerde weg van de gewone
   bronvermelding, en precies wat je wilt als je één cijfer wantrouwt en wilt
   weten welke conclusies eraan hangen.

   Bewust een tekstuele scan en geen slimme analyse: die zou stukgaan zodra
   iemand de code anders schrijft, en dan is een lege lijst erger dan geen
   lijst. Wat hier niet uit komt, staat er gewoon niet bij.
   =========================================================================== */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MAP = 'src/pages';

/** Pad en titel per paginabestand, uit de default-export van de pagina zelf. */
function paginaPad(bron) {
  const m = bron.match(/pad\s*:\s*'([^']+)'/);
  return m ? m[1] : null;
}

function paginaTitel(bron) {
  const m = bron.match(/titel\s*:\s*'([^']+)'/);
  return m ? m[1] : null;
}

/**
 * Retourneert een map `bestand.sleutel` → [{ pad, titel }].
 * Wordt één keer opgebouwd; de build leest elk bestand toch al.
 */
let cache = null;

export function gebruikPerParameter() {
  if (cache) return cache;
  cache = {};
  const bestanden = readdirSync(MAP).filter(f => f.endsWith('.mjs') && !f.startsWith('_'));

  for (const bestand of bestanden) {
    const bron = readFileSync(join(MAP, bestand), 'utf8');
    const pad = paginaPad(bron);
    if (!pad) continue;
    const titel = paginaTitel(bron) ?? pad;

    /* w('nac','nac_2026') en p('uren','anw_dienst'), met enkele of dubbele
       aanhalingstekens en willekeurige spaties ertussen. */
    const patroon = /\b[wp]\(\s*['"]([a-z_]+)['"]\s*,\s*['"]([a-z0-9_]+)['"]\s*\)/gi;
    const gezien = new Set();
    let m;
    while ((m = patroon.exec(bron)) !== null) {
      const sleutel = `${m[1]}.${m[2]}`;
      if (gezien.has(sleutel)) continue;
      gezien.add(sleutel);
      (cache[sleutel] ??= []).push({ pad, titel });
    }
  }
  return cache;
}

/** De pagina's waarop één parameter wordt gebruikt. */
export const gebruiktOp = (bestand, sleutel) =>
  gebruikPerParameter()[`${bestand}.${sleutel}`] ?? [];
