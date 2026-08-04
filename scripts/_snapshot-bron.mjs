/* Momentopname van 4 augustus 2026, opgehaald uit zorgdata.v_actueel via de
   Supabase-connector. Dit bestand bestaat alleen om de snapshot te kunnen
   herbouwen zonder databanktoegang; de reguliere weg is npm run data:sync. */
import { writeFileSync } from 'node:fs';
import { bouwSnapshot } from './sync-cijfermeester.mjs';

const R = [];
/* code, indicator, eenheid, bron, organisatie, vanaf-jaar, waarden, status-overrides, opmerkingen */
const reeks = (code, indicator, eenheid, bron, organisatie, van, waarden,
               statusPer = {}, opm = {}, basisStatus = 'definitief') => {
  waarden.forEach((v, i) => {
    if (v === null) return;
    const jaar = van + i;
    R.push({ code, indicator, eenheid, jaar, waarde: v,
             status: statusPer[jaar] ?? basisStatus, bron, organisatie,
             opmerking: opm[jaar] ?? null });
  });
};

const NIVEL_PIK   = ['Nivel - Huisartsen en praktijken in kaart; Beroepenregistraties 2023-2024', 'Nivel'];
const NIVEL_WEEK  = ['Nivel - De werkweek van de Nederlandse huisarts in 2024 (Flinterman e.a., 2025)', 'Nivel'];
const NIVEL_ARB   = ['Nivel - De arbeidsmarkt van de Nederlandse huisartsenzorg in 2024', 'Nivel'];
const NZA_IDX     = ['NZa - Indexatiecijfers en tariefonderbouwing (NAC/PKO)', 'NZa'];
const NZA_HERIJK  = ['NZa - Aangepaste tarieven huisartsenzorg 2025/2026 incl. herijkte NAC (nza.nl, vastgesteld 30-6-2026)', 'NZa'];
const CM          = ['Afgeleide reeks: tariefdekking per 1.000 ingeschrevenen (Cijfer-Meester)', 'Cijfer-Meester (afleiding uit NZa-verantwoordingen + werkboek David)'];
const CBS_CPI     = ['CBS StatLine 83131NED - Consumentenprijzen; prijsindex 2015=100', 'CBS'];
const CBS_ZELF    = ['CBS StatLine 84467NED - Zelfstandigen; inkomen, vermogen, bedrijfstak (SBI 8621)', 'CBS'];
const CBS_AZW     = ['CBS AZW 24015NED - Ziekteverzuimpercentage; branche Huisartsen en gezondheidscentra', 'CBS/AZW'];
const SPH         = ['SPH Jaarverslagen 2014-2025', 'Stichting Pensioenfonds voor Huisartsen (SPH)'];

const HERZIEN = 'Herziene reeks Nivel-registratie (PIK jan 2025, figuur 2); vervangt eerdere classificatie';

reeks('ha_zelfstandig', 'Zelfstandig gevestigde huisartsen (praktijkhouders)', 'personen', ...NIVEL_PIK, 2013,
  [7860, 7872, 7888, 7906, 7920, 7903, 7873, 7602, 7588, 7585, 7561], {},
  Object.fromEntries([2015,2016,2017,2018,2019,2020,2021,2023].map(j => [j, HERZIEN])));

reeks('ha_hidha_vast', 'HIDHA\'s / vaste waarnemers', 'personen', ...NIVEL_PIK, 2013,
  [1234, 1387, 1757, 1958, 2061, 2042, 2067, 3616, 3995, 4169, 4341], {},
  { 2020: 'Nivel-registratie; vervangt werkboek-schatting', 2021: 'Nivel-registratie; vervangt werkboek-schatting' });

reeks('ha_waarnemers_wisselend', 'Wisselende waarnemers', 'personen', ...NIVEL_PIK, 2013,
  [2201, 2314, 2176, 2243, 2427, 2821, 2899, 2146, 1909, 2015, 2200], {},
  { 2023: 'rapport geeft schatting' }, 'geschat');

reeks('ha_totaal', 'Werkzame huisartsen (totaal)', 'personen', ...NIVEL_PIK, 2013,
  [11295, 11573, 11821, 12107, 12408, 12766, 12839, 13364, 13492, 13769, 14102], {},
  { 2023: 'geextraheerd uit pdf-rapport' });

reeks('ha_praktijken', 'Aantal huisartsenpraktijken (per 1 januari)', 'praktijken', ...NIVEL_PIK, 2012,
  [4895, 5044, 5053, 5038, 5025, 5012, 4998, 4988, 4885, 4860, 4874, 4833, 4837], {},
  { 2023: 'per 1 januari', 2024: 'per 1 januari' });

reeks('ha_uren_week_praktijkhouder', 'Gewerkte uren per week, praktijkhouders', 'uur/week', ...NIVEL_WEEK, 2013,
  [49.4, null, null, null, null, 49.0, null, null, null, null, null, 55.7]);

reeks('nac', 'Arbeidskostenbestanddeel / norminkomen (NAC)', 'EUR', ...NZA_IDX, 2015,
  [128311, 128875.5684, 131504.63, 135397.167, 140027.7502, 144620.6604, 147527.5356,
   154048.2527, 163845.7216, 171939.7002], { 2024: 'voorlopig' }, { 2015: 'PKO-basisjaar' });
reeks('nac', 'Arbeidskostenbestanddeel / norminkomen (NAC)', 'EUR', ...NZA_HERIJK, 2025,
  [202476, 219479], {},
  { 2025: 'herijkte kostprijzen (NZa 30-6-2026); trendbreuk t.o.v. reeks t/m 2024',
    2026: 'herijkte kostprijzen (NZa 30-6-2026); trendbreuk t.o.v. reeks t/m 2024' });

reeks('nacs_in_tarieven_nl', 'Aantal NAC\'s landelijk in de tarieven', 'fte (1 fte = 1x NAC)', ...CM, 2018,
  [8052, 8107, 8133, 8179, 8221, 8272, 8305, 5885, 5914],
  { 2024: 'voorlopig', 2025: 'geschat', 2026: 'geschat' },
  { 2024: 'Def-index 2024 nog niet verwerkt.',
    2025: 'Modelwissel: -29% t.o.v. 2024. Voor schoning: 6.600.',
    2026: 'Voor schoning: 6.632.' });

reeks('ingeschrevenen_nl', 'Ingeschreven verzekerden bij huisartsenpraktijken (NL)', 'personen', ...CM, 2018,
  [16870343, 16985302, 17039624, 17136157, 17224936, 17329993, 17399407, 17499537, 17584903],
  { 2025: 'geschat', 2026: 'geschat' },
  { 2018: 'Niet-ingeschrevenen 2019 als benadering.',
    2025: 'VJ geschat (bevolking x ratio 2024); ni 2024 doorgetrokken.',
    2026: 'VJ geschat; ni 2024 doorgetrokken.' });

reeks('normpraktijk_ptn', 'Patienten per normpraktijk (NZa-norm)', 'patienten', ...NZA_IDX, 2015,
  [2168, 2168, 2168, 2095, 2095, 2095, 2095, 2095, 2095, 2095]);

reeks('cpi_2015', 'Consumentenprijsindex (2015=100)', 'index', ...CBS_CPI, 2010,
  [91.59, 93.73, 96.04, 98.44, 99.4, 100, 100.32, 101.7, 103.44, 106.16,
   107.51, 110.39, 121.43, 126.09, 130.31, 134.56]);

reeks('praktijken_patientenstop_pct', 'Praktijken met patientenstop (%)', '%', ...NIVEL_ARB, 2018,
  [48, 52, 54, 60, 58, 60, 60], {},
  { 2018: 'Vraag: afgelopen 5 jaar.', 2019: 'Vraag: afgelopen 5 jaar.', 2020: 'Vraag: afgelopen 5 jaar.',
    2021: 'Vraag: afgelopen 5 jaar.', 2022: 'Vraag: afgelopen 5 jaar.',
    2023: 'Vraag aangescherpt: afgelopen jaar.', 2024: 'Vraag: afgelopen jaar.' });

reeks('werkdruk_score_huisarts', 'Werkdruk-score huisartsen (0-100)', 'score 0-100', ...NIVEL_ARB, 2021, [84, 82, 78, 78]);
reeks('werkplezier_score_praktijk', 'Werkplezier-score praktijken (0-100)', 'score 0-100', ...NIVEL_ARB, 2021, [75, 76, 75, 76]);

reeks('verzuim_huisartsenzorg', 'Ziekteverzuimpercentage branche huisartsen en gezondheidscentra', 'procent', ...CBS_AZW, 2010,
  [3.3, 3.1, 2.8, 2.5, 3.5, 2.5, 3.2, 3.1, 2.8, 3.9, 5.2, 5.7, 7.9, 6.7, 5.7, 5.8],
  { 2025: 'voorlopig' }, { 2025: 'lopend jaar' });

reeks('sph_deelnemers_actief', 'SPH actieve deelnemers', 'personen', ...SPH, 2010,
  [9786, 9971, 10132, 10336, 10449, 10746, 11029, 11328, 11670, 12018, 12339, 14939, 15253, 15587, 15854, 15959], {},
  { 2021: 'Definitiebreuk: vanaf 2021 incl. huisartsen in opleiding (2.388 aios toegetreden).' });

reeks('sph_pensioengerechtigden', 'SPH pensioengerechtigden', 'personen', ...SPH, 2010,
  [5403, 5697, 5983, 6176, 6470, 6624, 6786, 6961, 7095, 7227, 7435, 7779, 7728, 7809, 7936, 8089], {},
  { 2022: 'Daling t.o.v. 2021 (7.779); geen toelichting in bron.' });

reeks('ha_winst_zelfst_gem', 'Gemiddeld inkomen als zelfstandige, huisarts-ondernemers (winst uit onderneming)', 'EUR', ...CBS_ZELF, 2010,
  [116400, 120900, 115200, 109900, 113100, 108300, 114800, 113200, 115200, 119400, 126700, 127600, 121400, 131000]);
reeks('ha_winst_zelfst_mp_gem', 'Gemiddeld inkomen als zelfstandige, huisarts-ondernemers met personeel', 'EUR', ...CBS_ZELF, 2010,
  [129900, 138600, 133400, 127900, 133000, 127800, 136800, 137200, 142600, 151400, 164700, 166800, 158600, 173600]);
reeks('ha_winst_zelfst_mp_mediaan', 'Mediaan inkomen als zelfstandige, huisarts-ondernemers met personeel', 'EUR', ...CBS_ZELF, 2010,
  [122200, 131200, 125000, 120000, 124000, 119400, 127200, 127900, 133900, 141800, 153400, 153600, 145400, 161300]);
reeks('ha_dga_pers_inkomen_gem', 'Gemiddeld persoonlijk inkomen dga\'s in huisartsenpraktijken', 'EUR', ...CBS_ZELF, 2010,
  [75200, 78900, 81000, 84400, 82300, 87000, 85600, 93500, 90200, 94600, 93800, 94900, 95700, 96500]);

const snap = bouwSnapshot(R, '2026-08-04');
writeFileSync('src/data/cijfermeester.json', JSON.stringify(snap, null, 1) + '\n');
console.log(`Snapshot: ${Object.keys(snap.reeksen).length} reeksen, ${R.length} waarden.`);
