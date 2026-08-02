/* Laadt de datalaag en biedt één plek waar een cijfer met zijn bron wordt
   opgehaald. Pagina's schrijven nooit een getal op; ze vragen het hier op. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = new URL('../data/', import.meta.url).pathname;
const laad = f => JSON.parse(readFileSync(join(DIR, f), 'utf8'));

export const bronnen = laad('bronnen.json');
export const data = Object.fromEntries(
  readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'bronnen.json')
                  .map(f => [f.replace('.json',''), laad(f)])
);

/** Alle parameters uit alle bestanden, plat, voor de bronnenpagina. */
export function alleParameters(){
  const out = [];
  for (const [bestand, inhoud] of Object.entries(data))
    for (const [sleutel, p] of Object.entries(inhoud.parameters ?? {}))
      out.push({ bestand, sleutel, ...p, bronObj: bronnen[p.bron] });
  return out;
}

/** Eén parameter ophalen; faalt hard als hij niet bestaat, zodat een typefout
    tijdens de build zichtbaar wordt en niet als leeg vlak op de site belandt. */
export function p(bestand, sleutel){
  const v = data[bestand]?.parameters?.[sleutel];
  if (!v) throw new Error(`Onbekende parameter: ${bestand}.${sleutel}`);
  return v;
}
export const w = (bestand, sleutel) => p(bestand, sleutel).waarde;
