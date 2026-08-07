/* ===========================================================================
   De bezoekersreis als data (reviewspecificatie §7.4): één centrale
   configuratie waar de rondleiding haar actuele waarden vandaan haalt.

   Alles hier is doorgegeven uit metrics.mjs of de datalaag; dit bestand rekent
   niet zelf en draagt geen eigen kopie van een kerngetal. De pagina bepaalt de
   vorm (welke component, welke tekst); hier staat alleen wat er waar is.
   Route A ("Hoe is het om huisarts te zijn?") krijgt later zijn eigen functie
   in ditzelfde bestand.
   =========================================================================== */
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
