/* ===========================================================================
   De bezoekersreis als data (reviewspecificatie §7.4): één centrale
   configuratie waar de rondleiding haar actuele waarden vandaan haalt.

   Alles hier is doorgegeven uit metrics.mjs of de datalaag; dit bestand rekent
   niet zelf en draagt geen eigen kopie van een kerngetal. De pagina bepaalt de
   vorm (welke component, welke tekst); hier staat alleen wat er waar is.
   Twee routes: rekensom() voor "De rekensom in zes stappen" (route B) en
   huisartsZijn() voor "Hoe is het om huisarts te zijn?" (route A).
   =========================================================================== */
import { data, w, p } from './data.mjs';
import { werkweek, nacKeten, nacHerkomst, uurbedragen, knikOntleding } from './metrics.mjs';

/** Alle grootheden voor de rondleiding "De rekensom in zes stappen". */
export function rekensom() {
  const ww = werkweek();
  const keten = nacKeten(2025);
  const herkomst = nacHerkomst();
  const u = uurbedragen();
  const i24 = u.jaren.indexOf(2024), i25 = u.jaren.indexOf(2025);

  return {
    jaar: 2025,

    /* Stap 1 — mensen en hun werkweek. */
    personen: keten.personen,
    personenStatus: keten.status.personen,
    werkweek: ww,                       // bruto, anw, netto, cap, uitgevraagd, bovenCapAandeel

    /* Stap 2 — de aftopping. */
    cap: ww.cap,
    bovenCapAandeel: ww.bovenCapAandeel,

    /* Stap 3 — de telling en de landelijke opschaling. */
    ingeschrevenen: keten.ingeschrevenen,
    perFte: keten.perFte,
    brutoNac: keten.brutoNac,
    brutoNacStatus: keten.status.brutoNac,

    /* Stap 4 — de drie niveaus. */
    binnen100: keten.binnen100,
    binnen100Status: keten.status.binnen100,
    maxTarief: keten.maxTarief,
    maxTariefStatus: keten.status.maxTarief,
    aandeelGeschoond: keten.aandeelGeschoond,
    aandeelBinnen100: herkomst.aandeelBinnen100,
    aandeelTariefGereguleerd: herkomst.aandeelTariefGereguleerd,

    /* Stap 5 — de delers van de modelwissel. */
    delerOud: herkomst.delerOud,
    delerNieuw: herkomst.delerNieuw,    // effectief, ná schoning

    /* Stap 6 — per gewerkt uur. */
    uurBasis2024: u.nominaal[i24],
    uurTerecht2025: u.perUurTerecht[i25],
    uurBasis2025: u.nominaal[i25],
    uurStatus: u.status,
    werkweken: u.werkweken,
    knik: knikOntleding()               // totaal, minderTerecht, verplaatst
  };
}

/** Alle grootheden voor de rondleiding "Hoe is het om huisarts te zijn?". */
export function huisartsZijn() {
  const ww = werkweek();
  const u = uurbedragen();
  const i23 = u.jaren.indexOf(2023);
  const R = data.beroepsgroep.reeksen;

  /* Groei en krimp uit de beroepsgroep-reeksen, zodat de teksten meelopen
     zodra de registratie wordt bijgewerkt. Zelfde selectiepatroon als op
     /beroepsgroep/. */
  const totaal = R.totaal.reeksen.find(r => /huisartsen/i.test(r.naam));
  const praktijken = R.totaal.reeksen.find(r => /praktijken/i.test(r.naam));
  const ph = R.functies.reeksen.find(r => /praktijkhouder/i.test(r.naam));
  const laatsteMet = reeks => [...R.totaal.jaren].reverse()
    .find(j => reeks.waarden[R.totaal.jaren.indexOf(j)] != null);

  return {
    werkweek: ww,

    /* Stap 1 — de weekbalk uit het tijdsbestedingsonderzoek. */
    taken: data.uren.tabellen.nivel_taken,

    /* Stap 3 — de drie rollen en het hidha/waarnemer-scenario. */
    rollen: {
      kostenWaarnemer: w('personeel', 'kosten_waarnemer_2025'),
      kostenHidha25:   w('personeel', 'kosten_hidha_2025'),
      kostenHidha26:   w('personeel', 'kosten_hidha_2026'),
      statusHidha26:   p('personeel', 'kosten_hidha_2026').status,
      tariefWaarnemer: w('personeel', 'tarief_waarnemer_uur'),
      bandLaag:        w('personeel', 'bandbreedte_laag'),   // bij € 85/uur
      bandHoog:        w('personeel', 'bandbreedte_hoog'),   // bij € 75/uur
      dagenWeek:       w('personeel', 'dagen_week'),
      urenDag:         w('personeel', 'uren_dag')
    },

    /* Stap 4 — drie financiële begrippen. */
    inkomen: {
      winstGem:    w('inkomen', 'winst_mp_2023'),
      winstMed:    w('inkomen', 'winst_mp_med_2023'),
      winstStatus: p('inkomen', 'winst_mp_2023').status,
      winstPerUur: u.winstGemPerUur[i23],
      winstJaar:   2023
    },

    /* Stap 5 — hoe het vak veranderde. */
    vak: {
      jaren: R.totaal.jaren,
      huisartsen: totaal, praktijken, praktijkhouders: ph,
      bron: R.totaal.bron, vindplaats: R.totaal.vindplaats, status: R.totaal.status,
      laatsteJaar: laatsteMet(totaal),
      werkweek2013: R.werkweek.reeksen.find(r => /praktijkhouder/i.test(r.naam)),
      werkweekJaren: R.werkweek.jaren,
      stop2018: w('werkdruk', 'stop_2018'),
      stop2024: w('werkdruk', 'stop_2024'),
      solo2024: w('beroepsgroep', 'solo_2024'),
      kosten2015: w('praktijkkosten', 'kosten_per_praktijk_2015'),
      kosten2022: w('praktijkkosten', 'kosten_per_praktijk_2022')
    }
  };
}
