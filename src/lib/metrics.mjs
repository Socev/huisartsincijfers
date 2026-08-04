/* ===========================================================================
   Centrale afleidingen. Elke grootheid die op meer dan één pagina voorkomt
   wordt hier één keer berekend. Pagina's rekenen niet zelf: zij vragen hier op.

   Dat is geen nette-code-wens. Zolang de homepage en de uurtariefpagina hun
   eigen keten bouwen, kunnen twee pagina's een ander getal tonen voor hetzelfde
   begrip zonder dat iemand het merkt.
   =========================================================================== */
import { data, w, p } from './data.mjs';

/* ===========================================================================
   De Cijfer-Meester

   De databank van de Cijfer-Meester is de bron van waarheid voor de reeksen
   hieronder. src/data/cijfermeester.json is een bevroren momentopname daarvan;
   verversen gaat met npm run data:sync. Dit is de enige plek waar de site die
   snapshot uitleest.
   =========================================================================== */

const CM = data.cijfermeester?.reeksen ?? {};

export const snapshotDatum = () => data.cijfermeester?._gegenereerd_op ?? null;

/** Eén reeks uit de snapshot. Faalt hard, zodat een hernoemde code opvalt
    tijdens de build en niet als leeg vlak op de site belandt. */
export function reeks(code) {
  const r = CM[code];
  if (!r) throw new Error(`Onbekende Cijfer-Meester-reeks: ${code}`);
  return r;
}

/** Eén waarde uit een reeks, met status en eventuele opmerking. */
export function cm(code, jaar) {
  const r = reeks(code);
  const i = r.jaren.indexOf(jaar);
  if (i < 0) throw new Error(`${code} heeft geen waarde voor ${jaar}`);
  return { waarde: r.waarden[i], status: r.status[i], jaar,
           opmerking: r.opmerkingen[jaar] ?? null, bron: r.bron, organisatie: r.organisatie };
}

export const cmw = (code, jaar) => cm(code, jaar).waarde;

/** Lineair tussen twee gemeten punten; buiten het bereik de dichtstbijzijnde
    meting vasthouden. De werkweek is maar op drie momenten gemeten, dus de
    tussenliggende jaren zijn onvermijdelijk interpolatie — en heten hier ook zo. */
export function interpoleer(code, jaar) {
  const r = reeks(code);
  const punten = r.jaren.map((j, i) => [j, r.waarden[i]]).filter(([, v]) => v != null);
  const i = r.jaren.indexOf(jaar);
  if (i >= 0 && r.waarden[i] != null) return { waarde: r.waarden[i], status: r.status[i] };
  if (jaar < punten[0][0])               return { waarde: punten[0][1], status: 'schatting' };
  if (jaar > punten[punten.length-1][0]) return { waarde: punten[punten.length-1][1], status: 'schatting' };
  const na   = punten.find(([j]) => j > jaar);
  const voor = [...punten].reverse().find(([j]) => j < jaar);
  const deel = (jaar - voor[0]) / (na[0] - voor[0]);
  return { waarde: +(voor[1] + deel * (na[1] - voor[1])).toFixed(10), status: 'schatting' };
}

/* ---------- status ----------
   Een afleiding is nooit steviger dan haar zwakste invoer. Een verhouding met
   een geschatte noemer heet daarom niet gewoon "afgeleid". */
const RANG = { definitief: 0, afgeleid: 1, schatting: 2 };

/* Een samengestelde status ("afgeleid, bevat schatting") kan zelf weer invoer
   zijn van een volgende afleiding. Die telt dan als schatting: anders zou een
   ketting van bewerkingen de zwakste schakel onderweg kwijtraken. */
const rang = s => RANG[s] ?? (String(s).includes('schatting') ? 2 : 1);

export function statusUit(...statussen) {
  const zwakste = statussen.reduce((a, b) => (rang(b) > rang(a) ? b : a), 'definitief');
  return rang(zwakste) === 2 ? 'afgeleid, bevat schatting' : 'afgeleid';
}

/** Statuslabel van een reeks parameters, met de bronparameters erbij. */
const uitParams = (...refs) => statusUit(...refs.map(([b, s]) => p(b, s).status));

/* ===========================================================================
   De keten: personen → nac's vóór schoning → binnen 100% → maximumtarieven
   =========================================================================== */

const JAARSLEUTELS = {
  2025: { ing: 'ingeschrevenen_2025', ph: 'praktijkhouders_2025', nac: 'nac_2025_vc' },
  2026: { ing: 'ingeschrevenen_2026', ph: 'praktijkhouders_2026', nac: 'nac_2026' }
};

/**
 * De volledige keten voor één jaar. Retourneert per stap de waarde, de eenheid,
 * de status en de rekenregel die naar die stap leidt, zodat een component de
 * keten kan tonen zonder zelf te weten hoe hij is opgebouwd.
 */
export function nacKeten(jaar = 2025) {
  const k = JAARSLEUTELS[jaar];
  if (!k) throw new Error(`nacKeten: geen grondslagen voor ${jaar}`);

  const ingeschrevenen = w('nac', k.ing);
  const perFte         = w('nac', 'patienten_per_fte');
  const b100           = w('nac', 'binnen_100');
  const tg             = w('nac', 'tarief_gereguleerd');
  const buiten         = w('nac', 'schoning_buiten_100');
  const poh            = w('nac', 'correctie_poh_ggz');
  const personen       = w('nac', k.ph);

  const brutoNac  = ingeschrevenen / perFte;
  const binnen100 = brutoNac * b100;
  const maxTarief = binnen100 * tg;

  const sBruto  = uitParams(['nac', k.ing], ['nac', 'patienten_per_fte']);
  const sBinnen = statusUit(sBruto, p('nac', 'binnen_100').status);
  const sMax    = statusUit(sBinnen, p('nac', 'tarief_gereguleerd').status);
  const sRatio  = statusUit(sBinnen, p('nac', k.ph).status);

  return {
    jaar, ingeschrevenen, perFte, personen,
    brutoNac, binnen100, maxTarief,
    vrijOnderhandelbaar: binnen100 * (1 - tg),
    buiten100:  brutoNac * buiten,
    pohGgz:     brutoNac * poh,
    geschoond:  brutoNac - binnen100,
    nacPerPersoon: binnen100 / personen,
    aandeelGeschoond: buiten + poh,
    status: { personen: p('nac', k.ph).status, brutoNac: sBruto, binnen100: sBinnen, maxTarief: sMax, ratio: sRatio },

    /* De keten als stappenlijst, voor causalChain(). */
    stappen: [
      { sleutel:'personen', waarde: personen, eenheid:'personen',
        label:'praktijkhoudend huisartsen', eenheidKort:'personen',
        status: p('nac', k.ph).status, anchor:'/beroepsgroep/',
        toelichting:'Mensen, niet rekeneenheden.' },
      { sleutel:'bruto', waarde: brutoNac, eenheid:'nac',
        label:'nac\'s vóór schoning', eenheidKort:'rekeneenheden',
        status: sBruto, anchor:'/arbeidskosten/#personen-naar-fte',
        regel:`${fmtGetal(ingeschrevenen)} ingeschreven verzekerden ÷ ${fmtGetal(perFte)} per fte`,
        oorzaak:'De fte-telling volgt de patiëntengrondslag, niet het aantal personen. De werktijdfactor is bovendien afgetopt op 1,0.' },
      { sleutel:'binnen', waarde: binnen100, eenheid:'nac',
        label:'nac\'s binnen de 100%', eenheidKort:'na kostentoerekening',
        status: sBinnen, anchor:'/arbeidskosten/#schoning',
        regel:`× ${fmtPct(b100)} blijft binnen de 100%`,
        oorzaak:`${fmtPct(buiten)} wordt geschoond als omzet buiten de 100%, ${fmtPct(poh)} verschuift naar de poh-ggz-module.` },
      { sleutel:'gedekt', waarde: maxTarief, eenheid:'nac',
        label:'gedekt door NZa-maximumtarieven', eenheidKort:'wettelijk gereguleerd',
        status: sMax, anchor:'/arbeidskosten/#maximumtarieven',
        regel:`× ${fmtPct(tg)} tariefgereguleerd`,
        oorzaak:'De rest wordt verondersteld te worden verdiend uit vrij onderhandelbare zorg, zonder maximumtarief en zonder kostendekkingsgarantie.' }
    ]
  };
}

/* Lokale formatteerhulpjes: metrics mag niet van format.mjs afhangen, anders
   ontstaat er een kringverwijzing zodra format ooit data nodig heeft. */
const fmtGetal = n => n.toLocaleString('nl-NL', { maximumFractionDigits: 0 });
const fmtPct   = n => (n * 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

/* ===========================================================================
   De werkweek: vier grenzen die stelselmatig door elkaar worden gehaald
   =========================================================================== */

export function werkweek() {
  const bruto  = w('uren', 'nivel_werkweek');
  const anw    = w('uren', 'anw_dienst');
  const uitgev = w('uren', 'nza_uren_per_fte');
  const cap    = w('uren', 'fte_uren_norm');
  const netto  = +(bruto - anw).toFixed(10);
  return {
    bruto, anw, netto, uitgevraagd: uitgev, cap,
    nietUitgevraagd: +(netto - uitgev).toFixed(10),
    bovenCapAandeel: w('uren', 'boven_cap'),
    bovenCapUren:    w('uren', 'boven_cap_uren'),
    werkweken:       w('uren', 'werkweken'),
    status: { netto: uitParams(['uren','nivel_werkweek'], ['uren','anw_dienst']),
              nietUitgevraagd: uitParams(['uren','nivel_werkweek'], ['uren','anw_dienst'], ['uren','nza_uren_per_fte']) }
  };
}

/* ===========================================================================
   De uurbedragreeks 2018-2026

   Alle grondslagen komen uit de Cijfer-Meester; het uurbedrag zelf staat
   nergens opgeslagen. Een correctie in de databank werkt daardoor na één
   npm run data:sync door in de reeks, de tabel, de tegels en de lopende tekst.

   De noemer is de werkweek EXCLUSIEF de dienst op de huisartsenpost. Die zorg
   kent een aparte bekostiging en valt buiten de overdagtarieven; haar uren
   toerekenen aan een tarief dat ze niet vergoedt, vertekent de uitkomst.
   =========================================================================== */

export const JAREN_REEKS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

/** Het aantal praktijkhouders per jaar. De Nivel-registratie loopt tot en met
    2023; 2025 en 2026 zijn de extrapolaties uit de datalaag en 2024 ligt daar
    lineair tussenin. Elke bron draagt hier zijn eigen status. */
export function praktijkhoudersReeks(jaren = JAREN_REEKS) {
  const nivel = reeks('ha_zelfstandig');
  const laatstNivel = nivel.jaren[nivel.jaren.length - 1];
  const uitDatalaag = { 2025: ['nac', 'praktijkhouders_2025'], 2026: ['nac', 'praktijkhouders_2026'] };

  return jaren.map(j => {
    const i = nivel.jaren.indexOf(j);
    if (i >= 0) return { jaar: j, waarde: nivel.waarden[i], status: nivel.status[i], herkomst: 'Nivel-beroepenregistratie' };
    if (uitDatalaag[j]) {
      const [b, s] = uitDatalaag[j];
      return { jaar: j, waarde: w(b, s), status: p(b, s).status, herkomst: 'extrapolatie' };
    }
    if (j > laatstNivel) {
      const voor = nivel.waarden[nivel.jaren.length - 1];
      const na   = w('nac', 'praktijkhouders_2025');
      const deel = (j - laatstNivel) / (2025 - laatstNivel);
      return { jaar: j, waarde: Math.round(voor + deel * (na - voor)), status: 'schatting',
               herkomst: `lineair tussen ${laatstNivel} en 2025` };
    }
    throw new Error(`praktijkhoudersReeks: geen grondslag voor ${j}`);
  });
}

export function uurbedragen() {
  const jaren = JAREN_REEKS;
  const wkn   = w('modelwissel', 'werkweken');
  const anw   = w('uren', 'anw_dienst');
  const capUren = w('uren', 'fte_uren_norm');

  const phRij = praktijkhoudersReeks(jaren);
  const ph    = phRij.map(r => r.waarde);

  /* De werkweek is op drie momenten gemeten; de rest is interpolatie. */
  const brutoRij = jaren.map(j => interpoleer('ha_uren_week_praktijkhouder', j));
  const bruto    = brutoRij.map(r => +r.waarde.toFixed(2));

  const normRij = jaren.map(j => cm('nac', j));
  const norm    = normRij.map(r => r.waarde);

  /* Tot en met 2024 komt het aantal nac's uit de reeks van de Cijfer-Meester;
     vanaf 2025 uit dezelfde keten die de rest van de site gebruikt, zodat de
     rekenregel zichtbaar blijft. Een test bewaakt dat die twee niet uit elkaar
     lopen ten opzichte van de gepubliceerde reeks. */
  const nacsRij = jaren.map(j => j >= 2025
    ? { waarde: nacKeten(j).binnen100, status: nacKeten(j).status.binnen100 }
    : cm('nacs_in_tarieven_nl', j));
  const nacs = nacsRij.map(r => r.waarde);

  /* Deflator uit de consumentenprijsindex; 2026 heeft nog geen jaarcijfer. */
  const cpi  = reeks('cpi_2015');
  const defl = jaren.map(j => {
    const i = cpi.jaren.indexOf(j);
    return i < 0 ? null : cpi.waarden[cpi.jaren.indexOf(2015)] / cpi.waarden[i];
  });

  const netto    = bruto.map(u => +(u - anw).toFixed(10));
  const uren     = jaren.map((_, i) => ph[i] * netto[i] * wkn);
  const bedrag   = jaren.map((_, i) => nacs[i] * norm[i]);
  const nominaal = jaren.map((_, i) => bedrag[i] / uren[i]);
  const reeel    = jaren.map((_, i) => defl[i] === null ? null : nominaal[i] * defl[i]);
  const fte36    = jaren.map((_, i) => ph[i] * netto[i] / capUren);

  const status = statusUit(...phRij.map(r => r.status), ...brutoRij.map(r => r.status),
                           ...normRij.map(r => r.status), ...nacsRij.map(r => r.status));

  return { jaren, praktijkhouders: ph, praktijkhoudersHerkomst: phRij,
           werkweekBruto: bruto, werkweekNetto: netto,
           nacs, normbedrag: norm, bedrag, nominaal, reeel, ureninzetFte36: fte36,
           deflator: defl, werkweken: wkn, status };
}

/** Eén jaar uit de reeks, plus de mutatie ten opzichte van het jaar ervoor. */
export function uurbedrag(jaar) {
  const r = uurbedragen();
  const i = r.jaren.indexOf(jaar);
  if (i < 0) throw new Error(`uurbedrag: jaar ${jaar} zit niet in de reeks`);
  return {
    jaar,
    nominaal: r.nominaal[i], reeel: r.reeel[i],
    nacs: r.nacs[i], normbedrag: r.normbedrag[i], bedrag: r.bedrag[i],
    praktijkhouders: r.praktijkhouders[i], werkweekNetto: r.werkweekNetto[i],
    mutatie:    i ? r.nominaal[i] - r.nominaal[i-1] : null,
    mutatiePct: i ? r.nominaal[i] / r.nominaal[i-1] - 1 : null,
    status: r.status
  };
}

/** Verschil tussen twee jaren, als absoluut bedrag en als aandeel. */
export function uurbedragVerschil(van, naar) {
  const a = uurbedrag(van), b = uurbedrag(naar);
  return { van: a, naar: b, verschil: b.nominaal - a.nominaal, aandeel: b.nominaal / a.nominaal - 1 };
}

/** Reële ontwikkeling tussen twee jaren, op prijspeil 2015. */
export function reeleMutatie(van, naar) {
  const r = uurbedragen();
  const i = r.jaren.indexOf(van), j = r.jaren.indexOf(naar);
  if (r.reeel[i] == null || r.reeel[j] == null) return null;
  return r.reeel[j] / r.reeel[i] - 1;
}

/* ===========================================================================
   Afgeleide tabellen en reeksen, in de vorm die components.mjs verwacht
   =========================================================================== */

export function uurreeksTabel() {
  const r = uurbedragen();
  return {
    label: 'Arbeidsvergoeding in de tarieven per gewerkt uur praktijkhouder, 2018-2026',
    bron: 'eigen-berekening',
    vindplaats: 'berekend uit modelwissel.basisreeks; noemer is de werkweek exclusief de dienst op de huisartsenpost',
    status: r.status, eenheid: 'euro',
    kolommen: ['Jaar', 'Praktijkhouders', 'Werkweek excl. dienst', 'Nac\'s in de tarieven',
               'Bedrag in miljoenen', 'Per gewerkt uur', 'Op prijspeil 2015'],
    rijen: r.jaren.map((j, i) => [
      j, r.praktijkhouders[i], r.werkweekNetto[i], Math.round(r.nacs[i]),
      r.bedrag[i] / 1e6, r.nominaal[i], r.reeel[i]
    ]),
    toelichting: 'De werkweek is op drie momenten gemeten (2013, 2018 en 2024); de tussenliggende jaren zijn ' +
      'lineair geïnterpoleerd en 2025 en 2026 zijn constant gehouden. Van elke gemeten werkweek is de dienst ' +
      'op de huisartsenpost afgetrokken: die zorg wordt apart bekostigd en valt buiten deze tarieven. Het ' +
      'aantal praktijkhouders volgt de herziene Nivel-beroepenregistratie; 2024 is geïnterpoleerd en 2025 en ' +
      '2026 zijn geëxtrapoleerd.'
  };
}

export function normbedragTabel() {
  const r = uurbedragen();
  return {
    label: 'Het normbedrag per fte tegenover het aantal nac\'s dat wordt ingerekend',
    bron: 'eigen-berekening', vindplaats: 'normbedragreeks uit de NZa-verantwoordingen',
    status: r.status, eenheid: '',
    kolommen: ['Jaar', 'Normbedrag per fte', 'Nac\'s in de tarieven', 'Totaal in miljoenen'],
    rijen: r.jaren.map((j, i) => [j, r.normbedrag[i], Math.round(r.nacs[i]), r.bedrag[i] / 1e6]),
    toelichting: 'Tot en met 2024 is het normbedrag het normatieve inkomen uit het kostprijsmodel 2015; vanaf ' +
      '2025 is het de nac uit het onderzoek van Berenschot. Dat zijn twee verschillende grootheden met dezelfde ' +
      'functie in de tariefberekening.'
  };
}

export function uurbedragSerie() {
  const r = uurbedragen();
  return {
    label: 'Arbeidsvergoeding in de tarieven per gewerkt uur praktijkhouder',
    bron: 'eigen-berekening',
    vindplaats: 'berekend uit modelwissel.basisreeks, exclusief de apart bekostigde dienst',
    status: r.status, jaren: r.jaren,
    breuk: { na: 2024, tekst: 'Vanaf 2025 geldt het herziene kostprijsmodel 2022. Het aantal nac\'s in de ' +
      'tarieven daalt daardoor met bijna dertig procent; het normbedrag per fte stijgt tegelijk.' },
    reeksen: [
      { naam: 'Nominaal',           waarden: r.nominaal },
      { naam: 'Op prijspeil 2015',  waarden: r.reeel }
    ]
  };
}

export function nacsSerie() {
  const r = uurbedragen();
  return {
    label: 'Aantal nac\'s in de tarieven tegenover de ureninzet van de beroepsgroep',
    bron: 'eigen-berekening',
    vindplaats: 'nac\'s afgeleid uit de NZa-verantwoordingen; ureninzet uit de praktijkhouders- en werkweekreeks',
    status: r.status, jaren: r.jaren,
    breuk: { na: 2024, tekst: 'De daling is de overgang van een normpraktijk van 2.095 ingeschrevenen naar het ' +
      'herziene model, niet een daling van de bekostiging als geheel.' },
    reeksen: [
      { naam: 'Nac\'s in de tarieven', waarden: r.nacs.map(v => Math.round(v)) },
      { naam: 'Ureninzet praktijkhouders, omgerekend naar fte van 36 uur', waarden: r.ureninzetFte36.map(v => Math.round(v)) }
    ]
  };
}

/* ===========================================================================
   Voor de bronnenpagina: de afgeleide kerngrootheden die niet als parameter in
   de datalaag staan omdat ze hier worden berekend. Zonder dit blok zouden ze
   buiten de auditlaag vallen, en dat is precies wat deze site niet wil.
   =========================================================================== */

export function afgeleideKerngetallen() {
  const k25 = nakenVeilig(2025), k26 = nakenVeilig(2026);
  const u = uurbedragen(), ww = werkweek();
  const bij = (label, waarde, eenheid, status, rekenstap) => ({ label, waarde, eenheid, status, rekenstap });
  const jaarBedrag = j => { const i = u.jaren.indexOf(j); return i < 0 ? null : u.nominaal[i]; };

  return [
    bij('Nac\'s vóór schoning, 2025', k25.brutoNac, 'nac', k25.status.brutoNac,
        'ingeschreven verzekerden gedeeld door ingeschrevenen per fte'),
    bij('Nac\'s binnen de 100%, 2025', k25.binnen100, 'nac', k25.status.binnen100,
        'nac\'s vóór schoning maal het aandeel dat binnen de 100% blijft'),
    bij('Nac\'s gedekt door NZa-maximumtarieven, 2025', k25.maxTarief, 'nac', k25.status.maxTarief,
        'nac\'s binnen de 100% maal het tariefgereguleerde aandeel'),
    bij('Nac\'s binnen de 100% per praktijkhouder, 2025', k25.nacPerPersoon, 'nac', k25.status.ratio,
        'nac\'s binnen de 100% gedeeld door het aantal praktijkhouders'),
    bij('Nac\'s binnen de 100%, 2026', k26.binnen100, 'nac', k26.status.binnen100,
        'zelfde keten, op de grondslagen van 2026'),
    bij('Werkweek exclusief de dienst op de huisartsenpost', ww.netto, 'uur/week', ww.status.netto,
        'gemeten werkweek minus de dienst op de huisartsenpost'),
    bij('Uren per week die nergens in beeld komen', ww.nietUitgevraagd, 'uur/week', ww.status.nietUitgevraagd,
        'werkweek exclusief dienst minus de door de NZa uitgevraagde uren'),
    bij('Arbeidsvergoeding per gewerkt uur, 2024', jaarBedrag(2024), 'euro', u.status,
        'landelijk nac-bedrag gedeeld door de gewerkte uren van alle praktijkhouders, exclusief dienst'),
    bij('Arbeidsvergoeding per gewerkt uur, 2025', jaarBedrag(2025), 'euro', u.status, 'idem, op de grondslagen van 2025'),
    bij('Arbeidsvergoeding per gewerkt uur, 2026', jaarBedrag(2026), 'euro', u.status, 'idem, op de grondslagen van 2026')
  ];
}

const nakenVeilig = j => nacKeten(j);
