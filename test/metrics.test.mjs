/* ===========================================================================
   Tests op de kernberekeningen. Draaien met: npm test

   Een site die anderen op hun cijfers aanspreekt, moet haar eigen rekenwerk
   vastzetten. Deze tests bewaken twee dingen: dat de kernsommen kloppen, en
   dat er geen tweede route naar hetzelfde getal ontstaat.
   =========================================================================== */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { data, w, alleParameters, bronnen } from '../src/lib/data.mjs';
import { nacKeten, nacPerUur, nacHerkomst, werkweek, uurbedragen, uurbedrag, uurbedragVerschil, statusUit, cmw, knikOntleding } from '../src/lib/metrics.mjs';

const rond = (v, n = 0) => +v.toFixed(n);

/* ---------- de vijf kernsommen ---------- */

test('ingeschreven verzekerden gedeeld door de fte-grondslag geeft de nac\'s vóór schoning', () => {
  const k = nacKeten(2025);
  assert.equal(k.ingeschrevenen, 17499537);
  assert.equal(k.perFte, 2650);
  assert.equal(rond(k.brutoNac), 6604);
});

test('nac\'s vóór schoning maal het aandeel binnen de 100% geeft 5.888', () => {
  const k = nacKeten(2025);
  assert.equal(rond(k.binnen100), 5888);
});

/* De audit noemt hier 4.381. Dat getal ontstaat door bij elke tussenstap af te
   ronden: 5.888 × 0,744. Onafgerond loopt de keten uit op 4.380,4. Wij ronden
   pas aan het eind af, dus op de site staat 4.380. */
test('nac\'s binnen de 100% maal het tariefgereguleerde aandeel geeft 4.380', () => {
  const k = nacKeten(2025);
  assert.equal(rond(k.maxTarief), 4380);
  assert.equal(rond(Math.round(k.binnen100) * w('nac', 'tarief_gereguleerd')), 4381);
});

test('de gemeten werkweek minus de dienst op de huisartsenpost is 53,1 uur', () => {
  const u = werkweek();
  assert.equal(u.bruto, 55.7);
  assert.equal(u.anw, 2.6);
  assert.equal(rond(u.netto, 1), 53.1);
});

test('de werkweek exclusief dienst minus de uitgevraagde uren is 6,9 uur', () => {
  const u = werkweek();
  assert.equal(u.uitgevraagd, 46.2);
  assert.equal(rond(u.nietUitgevraagd, 1), 6.9);
});

/* ---------- de keten hangt sluitend samen ---------- */

test('de stappen van de keten lopen aflopend en sluiten op de onderdelen', () => {
  const k = nacKeten(2025);
  const waarden = k.stappen.slice(1).map(s => s.waarde);
  for (let i = 1; i < waarden.length; i++)
    assert.ok(waarden[i] < waarden[i - 1], `stap ${i} is niet kleiner dan de vorige`);
  assert.equal(rond(k.binnen100 + k.buiten100 + k.pohGgz, 6), rond(k.brutoNac, 6));
  assert.equal(rond(k.maxTarief + k.vrijOnderhandelbaar, 6), rond(k.binnen100, 6));
});

test('de verhouding nac\'s binnen de 100% per praktijkhouder is circa 0,78', () => {
  const k = nacKeten(2025);
  assert.equal(rond(k.nacPerPersoon, 2), 0.78);
});

test('de keten werkt ook voor 2026', () => {
  const k = nacKeten(2026);
  assert.ok(k.binnen100 > k.maxTarief);
  assert.equal(rond(k.brutoNac), 6636);
});

/* ---------- status propagation ---------- */

test('een afleiding met een geschatte invoer heet niet gewoon afgeleid', () => {
  assert.equal(statusUit('definitief', 'definitief'), 'afgeleid');
  assert.equal(statusUit('definitief', 'schatting'), 'afgeleid, bevat schatting');
  assert.equal(statusUit('afgeleid', 'schatting'), 'afgeleid, bevat schatting');
});

test('de keten van 2025 draagt de schatting in haar noemer zichtbaar mee', () => {
  const k = nacKeten(2025);
  assert.match(k.status.brutoNac, /bevat schatting/);
  assert.match(k.status.ratio, /bevat schatting/);
});

/* ---------- de uurbedragreeks ---------- */

test('de uurbedragreeks deelt door de werkweek exclusief de dienst', () => {
  const r = uurbedragen();
  const i = r.jaren.indexOf(2024);
  assert.equal(rond(r.werkweekNetto[i], 1), 53.1);
  const handmatig = r.nacs[i] * r.normbedrag[i] / (r.praktijkhouders[i] * r.werkweekNetto[i] * r.werkweken);
  assert.equal(rond(r.nominaal[i], 6), rond(handmatig, 6));
});

test('elk jaar in de reeks heeft alle grondslagen', () => {
  const r = uurbedragen();
  r.jaren.forEach((j, i) => {
    for (const veld of ['praktijkhouders', 'werkweekNetto', 'nacs', 'normbedrag', 'nominaal'])
      assert.ok(Number.isFinite(r[veld][i]), `${veld} ontbreekt voor ${j}`);
  });
});

test('de knik van 2024 op 2025 is een daling van ruim twaalf euro per uur', () => {
  const v = uurbedragVerschil(2024, 2025);
  assert.ok(v.verschil < -12 && v.verschil > -13, `verschil is ${v.verschil}`);
  assert.ok(v.aandeel < -0.15 && v.aandeel > -0.18, `aandeel is ${v.aandeel}`);
});

test('de daling van 2025 komt niet uit een lager normbedrag', () => {
  const a = uurbedrag(2024), b = uurbedrag(2025);
  assert.ok(b.normbedrag > a.normbedrag, 'het normbedrag per fte steeg juist');
  assert.ok(b.nacs < a.nacs, 'het aantal nac\'s daalde');
});

/* ---------- geen tweede route naar hetzelfde getal ---------- */

test('de nac\'s voor 2025 en 2026 in de reeks komen uit dezelfde keten', () => {
  const r = uurbedragen();
  for (const jaar of [2025, 2026])
    assert.equal(r.nacs[r.jaren.indexOf(jaar)], nacKeten(jaar).binnen100);
});

test('het praktijkhoudersaantal volgt de Nivel-reeks uit de Cijfer-Meester', () => {
  const r = uurbedragen();
  for (const jaar of [2018, 2019, 2020, 2021, 2022, 2023])
    assert.equal(r.praktijkhouders[r.jaren.indexOf(jaar)], cmw('ha_zelfstandig', jaar),
      `praktijkhouders ${jaar} wijkt af van de Cijfer-Meester`);
});

test('de eigen keten loopt niet weg van de gepubliceerde reeks van de Cijfer-Meester', () => {
  /* De site rekent de keten zelf voor, zodat de rekenregel zichtbaar is. De
     Cijfer-Meester rondt per tussenstap af en komt daardoor iets anders uit.
     Zolang dat verschil onder een half procent blijft is het afrondingsruis;
     daarboven is er iets veranderd waar iemand naar moet kijken. */
  for (const jaar of [2025, 2026]) {
    const eigen = nacKeten(jaar).binnen100;
    const gepubliceerd = cmw('nacs_in_tarieven_nl', jaar);
    const afwijking = Math.abs(eigen / gepubliceerd - 1);
    assert.ok(afwijking < 0.005,
      `keten ${jaar}: eigen ${eigen.toFixed(1)} tegenover ${gepubliceerd} uit de databank (${(afwijking*100).toFixed(2)}%)`);
  }
});

test('de werkweekreeks interpoleert tussen de gemeten jaren', () => {
  const r = uurbedragen();
  assert.equal(r.werkweekBruto[r.jaren.indexOf(2018)], cmw('ha_uren_week_praktijkhouder', 2018));
  assert.equal(r.werkweekBruto[r.jaren.indexOf(2024)], cmw('ha_uren_week_praktijkhouder', 2024));
  for (let i = 1; i <= 6; i++)
    assert.ok(r.werkweekBruto[i] > r.werkweekBruto[i-1], 'de reeks hoort te stijgen tot 2024');
});

test('de snapshot is intern consistent', () => {
  const snap = data.cijfermeester;
  assert.ok(snap?._gegenereerd_op, 'de snapshot noemt geen generatiedatum');
  const geldig = new Set(['definitief', 'afgeleid', 'schatting']);
  for (const [code, r] of Object.entries(snap.reeksen)) {
    assert.equal(r.jaren.length, r.waarden.length, `${code}: jaren en waarden lopen niet gelijk`);
    assert.equal(r.jaren.length, r.status.length, `${code}: statussen lopen niet gelijk`);
    assert.ok(r.bron && r.organisatie, `${code}: bron of organisatie ontbreekt`);
    for (const s of r.status) assert.ok(geldig.has(s), `${code}: onbekende status ${s}`);
  }
});

test('het praktijkhoudersaantal voor 2025 en 2026 sluit aan op de datalaag', () => {
  const r = uurbedragen();
  assert.equal(r.praktijkhouders[r.jaren.indexOf(2025)], w('nac', 'praktijkhouders_2025'));
  assert.equal(r.praktijkhouders[r.jaren.indexOf(2026)], w('nac', 'praktijkhouders_2026'));
});

test('er staat geen uurbedrag of nac-totaal meer opgeslagen in de datalaag', () => {
  const verboden = /^(nac_uur_|nac_mln_)/;
  for (const p of alleParameters())
    assert.ok(!verboden.test(p.sleutel),
      `${p.bestand}.${p.sleutel} hoort in metrics.mjs te worden berekend, niet opgeslagen`);
});

/* ---------- de datalaag zelf ---------- */

test('elke parameter heeft een bekende bron en een geldige status', () => {
  const geldig = new Set(['definitief', 'afgeleid', 'schatting']);
  for (const p of alleParameters()) {
    assert.ok(bronnen[p.bron], `${p.bestand}.${p.sleutel} verwijst naar onbekende bron ${p.bron}`);
    assert.ok(geldig.has(p.status), `${p.bestand}.${p.sleutel} heeft status ${p.status}`);
  }
});

test('elke afgeleide of geschatte parameter noemt een vindplaats', () => {
  for (const p of alleParameters())
    if (p.status !== 'definitief')
      assert.ok(p.vindplaats && p.vindplaats.length > 3,
        `${p.bestand}.${p.sleutel} is ${p.status} maar noemt geen rekenstap`);
});

test('de schoning telt op tot het aandeel dat buiten de 100% valt', () => {
  const buiten = w('nac', 'schoning_buiten_100'), poh = w('nac', 'correctie_poh_ggz');
  assert.equal(rond(buiten + poh + w('nac', 'binnen_100'), 4), 1);
  assert.equal(rond(buiten + poh, 4), 0.1084);
});

/* ---------- praktijkkosten: de noemers niet mengen ---------- */

test('de mutatie van de totale praktijkkosten is niet die van de post praktijkkosten', () => {
  const t = data.praktijkkosten.tabellen.kerngetallen.rijen;
  const rij = naam => t.find(r => r[0] === naam);
  const totaal = rij('Totale kosten'), praktijk = rij('Praktijkkosten'), arbeid = rij('Arbeidskosten praktijkhouder');
  assert.equal(rond(totaal[3], 3), 0.228);
  assert.equal(rond(praktijk[3], 3), 0.462);
  assert.equal(rond(arbeid[3], 3), -0.103);
  assert.equal(rond(totaal[1] / totaal[2] - 1, 3), rond(totaal[3], 3));
});

/* ---------- de arbeidsvergoeding per gewerkt uur na schoning ----------
   Twee valkuilen. Ten eerste: het derde getal ontstaat door bééde aandelen,
   niet alleen door het tariefgereguleerde deel — 2.125,4 ÷ 74,4% geeft 2.856,7
   en dat is niet wat er staat. Ten tweede moet de reeks van de site dezelfde
   ketenvolgorde aanhouden als nacKeten(), anders bestaan er twee routes naar
   hetzelfde getal. */

test('de uren per volledige vergoeding lopen van 2.125,4 via 2.383,8 naar 3.204,0', () => {
  const n = nacPerUur(2026);
  const [in_, na, max] = n.stappen;
  assert.equal(rond(in_.uren, 1), 2125.4);
  assert.equal(rond(na.uren, 1), 2383.8);
  assert.equal(rond(max.uren, 1), 3204.0);
  assert.equal(rond(na.uren, 1), rond(in_.uren / w('nac', 'binnen_100'), 1));
  assert.equal(rond(max.uren, 1),
    rond(in_.uren / (w('nac', 'binnen_100') * w('nac', 'tarief_gereguleerd')), 1));
  assert.notEqual(rond(max.uren, 1), rond(in_.uren / w('nac', 'tarief_gereguleerd'), 1));
});

test('het bedrag per uur is de nac maal dezelfde aandelen, gedeeld door 2.125,4', () => {
  const n = nacPerUur(2026);
  assert.equal(n.nac, 219479);
  assert.equal(rond(n.stappen[0].perUur, 2), 103.26);
  assert.equal(rond(n.stappen[1].perUur, 2), 92.07);
  assert.equal(rond(n.stappen[2].perUur, 2), 68.50);
  /* Bedrag per uur maal uren per vergoeding is in elke stap weer één hele nac:
     de twee kolommen zijn twee lezingen van dezelfde breuk, geen los rekenwerk. */
  for (const s of n.stappen) assert.equal(rond(s.perUur * s.uren, 0), n.nac);
});

test('de vergoeding ná schoning ligt boven de jaarinzet die de NZa zelf het ijkpunt noemt', () => {
  const n = nacPerUur(2026);
  assert.ok(n.stappen[1].uren > w('nacopbouw', 'uren_voltijd_gemeten'),
    'de kern van de redenering op /nac/#doorgerekend valt weg als dit niet meer klopt');
});

/* ---------- de honderd voltijders uit bijlage 7 ----------
   Overgenomen uit een gepubliceerde tabel. De vier kwarten moeten optellen tot
   de totalen die de NZa er zelf onder zet, anders is er een tikfout gemaakt. */

test('de vier groepen van 25 tellen op tot de gepubliceerde totalen', () => {
  const r = data.uren.tabellen.voltijd_groot.rijen;
  const kwarten = r.slice(0, 4), totaal = r[4];
  assert.equal(rond(kwarten.reduce((s, x) => s + x[1], 0), 1), totaal[1]);
  assert.equal(kwarten.reduce((s, x) => s + x[2], 0), totaal[2]);
  assert.equal(rond(totaal[1] / totaal[2], 1), totaal[3]);
  for (const k of kwarten) assert.equal(rond(k[1] / k[2], 1), k[3]);
});

test('de kolom vergoeding per uur is de nac van 2026 gedeeld door de uren per vergoeding', () => {
  const nac = w('nac', 'nac_2026');
  for (const k of data.uren.tabellen.voltijd_groot.rijen)
    assert.equal(rond(nac / k[3], 2), k[4], `rij ${k[0]}`);
});

/* ---------- herkomst van het aantal nac's ----------
   De hele reeks 2018-2026 volgt één regel: ingeschrevenen gedeeld door het
   aantal patiënten per volledig vergoede nac. Deze tests bewaken dat die regel
   de gepubliceerde reeks reproduceert, dat de deler op precies één plek
   verspringt, en dat de gevoeligheidstabel dezelfde keten gebruikt als de rest
   van de site. */

test('de deling reproduceert de gepubliceerde reeks over alle jaren', () => {
  const h = nacHerkomst();
  assert.equal(h.jaarReeks.length, 9);
  for (const r of h.jaarReeks)
    assert.ok(Math.abs(r.afwijking) < 0.001,
      `${r.jaar}: ${r.ingeschrevenen} ÷ ${r.deler} = ${r.berekend.toFixed(1)}, gepubliceerd ${r.gepubliceerd}`);
  assert.ok(h.grootsteAfwijking < 0.001);
});

test('de deler verspringt precies één keer, tussen 2024 en 2025', () => {
  const h = nacHerkomst();
  const delers = h.jaarReeks.map(r => r.deler);
  const sprongen = delers.filter((d, i) => i && d !== delers[i-1]).length;
  assert.equal(sprongen, 1, 'de reeks hoort maar één modelwissel te kennen');
  assert.equal(h.jaarReeks.find(r => r.jaar === 2024).deler, h.delerOud);
  assert.equal(h.jaarReeks.find(r => r.jaar === 2025).deler, h.delerNieuw);
  assert.ok(h.delerNieuw > h.delerOud);
  assert.equal(rond(h.perDuizendVerschil, 3), -0.295);
});

test('de eigen keten en de Cijfer-Meester zijn dezelfde deling, anders afgerond', () => {
  const h = nacHerkomst();
  for (const r of h.routes) {
    /* Geen onafhankelijke bevestiging: beide komen neer op delen door bijna
       hetzelfde getal. De test bewaakt dat, en niet meer dan dat. */
    assert.ok(Math.abs(r.eigenDeler / r.externDeler - 1) < 0.005,
      `${r.jaar}: eigen deler ${r.eigenDeler.toFixed(2)} tegenover ${r.externDeler.toFixed(2)}`);
    assert.ok(Math.abs(r.afwijking) < 0.005);
  }
});

test('de drie niveaus zijn scope-zuiver en vallen samen waar dat hoort', () => {
  const r = uurbedragen();
  r.jaren.forEach((j, i) => {
    if (j <= 2024) {
      assert.equal(rond(r.terechtNacs[i], 1), rond(r.nacs[i], 1),
        `${j}: zonder schoning horen niveau 1 en 2 samen te vallen`);
    } else {
      assert.ok(r.terechtNacs[i] > r.nacs[i], `${j}: de schoning hoort niveau 2 onder niveau 1 te leggen`);
      assert.equal(rond(r.nacs[i] / r.terechtNacs[i], 4), rond(w('nac', 'binnen_100'), 4));
    }
    assert.ok(r.geregNacs[i] < r.nacs[i], `${j}: het gereguleerde deel is altijd kleiner dan het geheel`);
    assert.equal(rond(r.geregNacs[i] / r.nacs[i], 4),
                 rond(j <= 2024 ? w('modelwissel', 'aandeel_gereguleerd_2015') : w('nac', 'tarief_gereguleerd'), 4));
  });
});

test('de knik-ontleding sluit: totaal = minder terecht geacht + verplaatst', () => {
  const k = knikOntleding();
  assert.ok(Math.abs(k.totaal - (k.minderTerecht + k.verplaatst)) < 1e-9);
  assert.ok(k.totaal < -12 && k.totaal > -13.5, `knik ${k.totaal}`);
  assert.ok(k.minderTerecht < 0 && k.verplaatst < 0);
});

test('de dekking van een hele nac telt in beide modellen op tot honderd procent', () => {
  const t = data.modelwissel.tabellen.dekking_nac;
  for (const kolom of [1, 2]) {
    const som = t.rijen.reduce((s, rij) => s + rij[kolom], 0);
    assert.ok(Math.abs(som - 1) < 0.001, `kolom ${kolom} telt op tot ${som}`);
  }
});

test('de winst per gewerkt uur deelt door de volle werkweek en spoort met de controleversie', () => {
  const r = uurbedragen();
  const i23 = r.jaren.indexOf(2023);
  /* Referentiewaarden uit analyse/nac-raamwerk.xlsx, blad Berekening. */
  assert.equal(rond(r.winstGemPerUur[i23], 2), 69.14);
  assert.equal(rond(r.winstMedPerUur[i23], 2), 64.25);
  assert.equal(r.winstGemPerUur[r.jaren.indexOf(2024)], null, 'na 2023 is er geen winstcijfer');
  /* De noemer is de bruto werkweek: gem. winst 2023 / (bruto x weken). */
  assert.equal(rond(r.winstGemPerUur[i23] * r.werkweekBruto[i23] * 46, 0),
               rond(173600, 0));
});

/* ---------- de rondleiding rekent niet zelf ---------- */

test('de rondleiding-configuratie geeft dezelfde getallen als de rekenlaag', async () => {
  const { rekensom } = await import('../src/lib/verhaal.mjs');
  const d = rekensom();
  const k = nacKeten(2025), u = uurbedragen(), knik = knikOntleding();
  assert.equal(d.personen, k.personen);
  assert.equal(d.brutoNac, k.brutoNac);
  assert.equal(d.binnen100, k.binnen100);
  assert.equal(d.maxTarief, k.maxTarief);
  assert.equal(d.uurBasis2025, u.nominaal[u.jaren.indexOf(2025)]);
  assert.equal(d.knik.totaal, knik.totaal);
  /* De effectieve deler is de gepubliceerde normpraktijk ná schoning; de eigen
     keten (2.650 ÷ aandeel binnen de 100%) mag daar hooguit een afronding
     vanaf liggen. */
  assert.ok(Math.abs(d.perFte / d.aandeelBinnen100 / d.delerNieuw - 1) < 0.001);
});
