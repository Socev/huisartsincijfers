/* ===========================================================================
   Wanneer is de site voor het laatst bijgewerkt?

   Stond eerst als datum in layout.mjs, en liep daardoor achter zodra iemand
   vergat hem bij te werken — precies wat een site over actualiteit niet moet
   doen. Nu komt hij uit de laatste commit die in de build zit.

   Drie bronnen, in deze volgorde:
     1. de datum van de laatste git-commit;
     2. build-meta.json, als een bouwomgeving die alvast heeft weggeschreven
        (handig bij een shallow clone zonder git-binary);
     3. de bouwdatum, als laatste redmiddel.

   De gebruikte bron staat in `herkomst`, zodat zichtbaar is of de datum echt
   iets zegt over de inhoud of alleen over het moment van bouwen.
   =========================================================================== */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

function uitGit() {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return iso ? { datum: iso.slice(0, 10), herkomst: 'commit' } : null;
  } catch { return null; }
}

function uitBestand() {
  if (!existsSync('build-meta.json')) return null;
  try {
    const m = JSON.parse(readFileSync('build-meta.json', 'utf8'));
    return m.commitDatum ? { datum: String(m.commitDatum).slice(0, 10), herkomst: 'commit' } : null;
  } catch { return null; }
}

const gevonden = uitGit() ?? uitBestand() ??
  { datum: new Date().toISOString().slice(0, 10), herkomst: 'bouwdatum' };

export const BIJGEWERKT = gevonden.datum;
export const BIJGEWERKT_HERKOMST = gevonden.herkomst;
