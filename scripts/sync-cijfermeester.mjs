#!/usr/bin/env node
/* ===========================================================================
   Haalt de reeksen die deze site gebruikt op uit de Cijfer-Meester
   (Supabase-project Ovis-Scribo, schema zorgdata) en schrijft ze weg als
   src/data/cijfermeester.json.

   De databank is read-only en de bron van waarheid. Dit script schrijft er
   nooit in; het leest v_actueel, dat alleen niet-vervangen waarden bevat.

   Draaien:  SUPABASE_DB_URL='postgresql://...' npm run data:sync

   De sleutel hoort in de omgeving, niet in de repo en niet in de bundel. De
   gegenereerde JSON wordt wél meegecommit: Cloudflare bouwt vanaf GitHub en
   heeft daar geen databanktoegang. Wat de site toont is daardoor een bevroren,
   citeerbare momentopname met een datum erbij.
   =========================================================================== */
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

/* De reeksen die de site gebruikt. Bewust een expliciete lijst: zo groeit de
   snapshot niet ongemerkt mee met de databank, en is per reeks te zien waar
   hij op de site landt. */
export const REEKSEN = {
  ha_zelfstandig:              'praktijkhouders (personen)',
  ha_hidha_vast:               'hidha\'s en vaste waarnemers',
  ha_waarnemers_wisselend:     'wisselende waarnemers',
  ha_totaal:                   'werkzame huisartsen totaal',
  ha_praktijken:               'huisartsenpraktijken',
  ha_uren_week_praktijkhouder: 'gemeten werkweek praktijkhouder',
  nac:                         'normbedrag per fte',
  nacs_in_tarieven_nl:         'nac\'s in de tarieven',
  ingeschrevenen_nl:           'ingeschreven verzekerden',
  normpraktijk_ptn:            'normpraktijk',
  cpi_2015:                    'consumentenprijsindex 2015 = 100',
  praktijken_patientenstop_pct:'praktijken met een patiëntenstop',
  werkdruk_score_huisarts:     'werkdrukscore huisartsen',
  werkplezier_score_praktijk:  'werkplezierscore praktijken',
  verzuim_huisartsenzorg:      'ziekteverzuim in de branche',
  sph_deelnemers_actief:       'actieve deelnemers pensioenfonds',
  sph_pensioengerechtigden:    'pensioengerechtigden pensioenfonds',
  ha_winst_zelfst_gem:         'gemiddelde winst, alle huisarts-ondernemers',
  ha_winst_zelfst_mp_gem:      'gemiddelde winst, ondernemers met personeel',
  ha_winst_zelfst_mp_mediaan:  'mediane winst, ondernemers met personeel',
  ha_dga_pers_inkomen_gem:     'gemiddeld persoonlijk inkomen dga\'s'
};

/* De databank kent definitief / voorlopig / geschat. De site kent
   definitief / afgeleid / schatting. "Voorlopig" bestond hier nog niet: een
   cijfer dat nog kan wijzigen is geen definitief cijfer, maar ook geen
   extrapolatie. Wij tonen het als schatting met de reden erbij, zodat er geen
   status verdwijnt in de vertaling. */
export const STATUSKAART = {
  definitief: 'definitief',
  voorlopig:  'schatting',
  geschat:    'schatting'
};

const QUERY = codes => `
  select code, indicator, eenheid, jaar, waarde, status, bron, organisatie, opmerking
  from zorgdata.v_actueel
  where regio = 'NL' and code in (${codes.map(c => `'${c}'`).join(',')})
  order by code, jaar;`;

function haalOp(codes) {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('SUPABASE_DB_URL ontbreekt. Zet hem in de omgeving, niet in de repo.');
    process.exit(1);
  }
  const uit = execFileSync('psql', [url, '-At', '-c',
    `select json_agg(t) from (${QUERY(codes).replace(/;$/, '')}) t`], { encoding: 'utf8' });
  return JSON.parse(uit.trim());
}

export function bouwSnapshot(rijen, gegenereerdOp) {
  const per = {};
  for (const r of rijen) {
    (per[r.code] ??= { code: r.code, indicator: r.indicator, eenheid: r.eenheid,
                       rol: REEKSEN[r.code] ?? null, jaren: [], waarden: [], status: [],
                       bron: r.bron, organisatie: r.organisatie, opmerkingen: {} });
    const s = per[r.code];
    s.jaren.push(r.jaar);
    s.waarden.push(r.waarde === null ? null : Number(r.waarde));
    s.status.push(STATUSKAART[r.status] ?? r.status);
    if (r.opmerking) s.opmerkingen[r.jaar] = r.opmerking;
  }
  return {
    _titel: 'Momentopname uit de Cijfer-Meester',
    _bron: 'Supabase-project Ovis-Scribo, schema zorgdata, view v_actueel (regio NL)',
    _gegenereerd_op: gegenereerdOp,
    _let_op: 'Dit bestand wordt gegenereerd door scripts/sync-cijfermeester.mjs. ' +
      'Bewerk het niet met de hand: een wijziging hoort in de Cijfer-Meester thuis, ' +
      'waarna deze snapshot opnieuw wordt gedraaid.',
    reeksen: per
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const codes = Object.keys(REEKSEN);
  const rijen = haalOp(codes);
  const snap = bouwSnapshot(rijen, new Date().toISOString().slice(0, 10));
  writeFileSync('src/data/cijfermeester.json', JSON.stringify(snap, null, 1) + '\n');
  console.log(`Snapshot geschreven: ${Object.keys(snap.reeksen).length} reeksen, ${rijen.length} waarden.`);
  const ontbreekt = codes.filter(c => !snap.reeksen[c]);
  if (ontbreekt.length) console.warn(`Let op — geen data gevonden voor: ${ontbreekt.join(', ')}`);
}
