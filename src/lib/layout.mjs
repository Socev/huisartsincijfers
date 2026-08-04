import { esc, datum } from './format.mjs';

export const SITE = {
  naam: 'huisartsincijfers.nl',
  titel: 'Huisarts in cijfers',
  omschrijving: 'De financiering van de Nederlandse huisartsenzorg, herleidbaar tot de bron.',
  url: 'https://huisartsincijfers.nl',
  bijgewerkt: '2026-08-02'
};

/* De hoofdnavigatie telde veertien links die op elk scherm over meerdere regels
   braken, waardoor alle onderwerpen even belangrijk leken. Nu zes ingangen,
   gegroepeerd naar de vraag die de lezer stelt — niet naar het onderwerp. */
export const NAV = [
  { href: '/', label: 'Kerncijfers' },
  { label: 'Nac en arbeid', kinderen: [
    { href: '/nac/',           label: 'Wat is de nac?' },
    { href: '/arbeidskosten/', label: 'Van praktijkhouders naar nac\'s' },
    { href: '/uren/',          label: 'Uren en fte' },
    { href: '/uurtarief/',     label: 'Arbeidsvergoeding per uur' },
    { href: '/modelwissel/',   label: 'De modelwissel van 2025' }
  ]},
  { label: 'Praktijk en tarieven', kinderen: [
    { href: '/praktijkkosten/', label: 'Praktijkkosten' },
    { href: '/tarieven/',       label: 'Basistarieven' },
    { href: '/omzet/',          label: 'Omzet, scope en schoning' },
    { href: '/inkomen/',        label: 'Inkomen en de norm' }
  ]},
  { label: 'Beroepsgroep', kinderen: [
    { href: '/beroepsgroep/',        label: 'Wie levert de zorg?' },
    { href: '/praktijkhouderschap/', label: 'Wie draagt de praktijk?' },
    { href: '/werkdruk/',            label: 'Werkdruk en patiëntenstops' }
  ]},
  { href: '/bronnen/', label: 'Bronnen' },
  { href: '/over/',    label: 'Over' }
];

/** Alle pagina's plat, voor de sitemap en voor het markeren van de actieve groep. */
export const ALLE_PADEN = NAV.flatMap(n => n.kinderen ? n.kinderen.map(k => k.href) : [n.href]);

const MARK = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
  <rect x="1" y="13" width="4" height="8" rx="1.4" fill="currentColor"/>
  <rect x="7" y="9" width="4" height="12" rx="1.4" fill="currentColor"/>
  <rect x="13" y="5" width="4" height="16" rx="1.4" fill="currentColor"/>
  <rect x="19" y="1" width="4" height="20" rx="1.4" fill="var(--accent)" opacity=".2"/>
  <rect x="19" y="14" width="4" height="7" rx="1.4" fill="var(--accent)"/>
</svg>`;

export function pagina({ pad, titel, omschrijving, eyebrow, h1, lede, body,
                         status, acties, proto = true }) {
  /* Groepen zijn <details>: ze werken zonder JavaScript en zijn met het
     toetsenbord te bedienen. site.js sluit alleen de andere groepen en vangt
     Escape af — een verbetering, geen voorwaarde. */
  const link = (n, actief) =>
    `<a href="${n.href}"${actief ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`;

  const nav = NAV.map(n => {
    if (!n.kinderen) return link(n, n.href === pad);
    const actiefIn = n.kinderen.some(k => k.href === pad);
    return `<details class="grp"${actiefIn ? ' data-actief="ja"' : ''}>
      <summary${actiefIn ? ' aria-current="true"' : ''}>${esc(n.label)}<i aria-hidden="true">▾</i></summary>
      <div class="uitklap">${n.kinderen.map(k => link(k, k.href === pad)).join('')}</div>
    </details>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titel)} — ${esc(SITE.naam)}</title>
<meta name="description" content="${esc(omschrijving ?? SITE.omschrijving)}">
<meta property="og:title" content="${esc(titel)}">
<meta property="og:description" content="${esc(omschrijving ?? SITE.omschrijving)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:url" content="${SITE.url}${pad}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles/tokens.css">
<link rel="stylesheet" href="/styles/site.css">
<script>
  // Thema vóór het schilderen zetten, zodat er geen lichte flits is.
  try{var t=localStorage.getItem('thema');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}
</script>
</head>
<body>
<a class="skip" href="#inhoud">Naar de inhoud</a>
${proto ? `<div class="proto">Deze site is in opbouw. De cijfers zijn gecontroleerd; de opzet is nog niet af. <a href="/over/">Wat dit wel en niet is</a></div>` : ''}

<header class="site"><div class="wrap">
  <a class="logo" href="/">${MARK}<span class="wm">huisartsincijfers<i>.nl</i></span></a>
  <details class="drawer" id="drawer">
    <summary aria-label="Menu openen"><span></span><span></span><span></span></summary>
    <nav class="main paneel" aria-label="Hoofdmenu">${nav}</nav>
  </details>
  <button class="tt" id="tt" type="button" aria-live="polite">donker</button>
</div></header>

<main id="inhoud"><div class="wrap">
  <div class="page-head">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(h1)}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${status ? `<p class="statusregel">${status.filter(Boolean).map(esc).join('<span class="sep">·</span>')}</p>` : ''}
    ${acties ? `<div class="acties">
      ${acties.primair  ? `<a class="knop" href="${esc(acties.primair.href)}">${esc(acties.primair.label)}</a>` : ''}
      ${acties.secundair ? `<a class="knop-sec" href="${esc(acties.secundair.href)}">${esc(acties.secundair.label)}</a>` : ''}
    </div>` : ''}
  </div>
  ${body}
</div></main>

<footer class="site"><div class="wrap">
  <div class="cols">
    <div><h4>Onderwerpen</h4>
      <a href="/nac/">Opbouw van de normatieve arbeidskostencomponent</a>
      <a href="/arbeidskosten/">Arbeidskosten praktijkhouder</a>
      <a href="/uren/">Gewerkte uren en de fte-definitie</a>
      <a href="/uurtarief/">Arbeidsvergoeding per gewerkt uur</a>
      <a href="/modelwissel/">De modelwissel van 2025</a>
      <a href="/beroepsgroep/">De beroepsgroep in aantallen</a>
      <a href="/inkomen/">Inkomen tegenover de norm</a>
      <a href="/werkdruk/">Werkdruk en capaciteit</a>
      <a href="/praktijkkosten/">Praktijkkosten</a>
      <a href="/omzet/">Omzet, scope en schoning</a></div>
    <div><h4>Verantwoording</h4>
      <a href="/bronnen/">Alle bronnen en parameters</a>
      <a href="/over/">Over deze site</a>
      <a href="/over/#methode">Methode</a>
      <a href="/over/#voorbehoud">Voorbehoud</a></div>
    <div><h4>Data</h4>
      <a href="/bronnen/#datalaag">Datalaag downloaden</a>
      <a href="https://github.com/Socev/huisartsincijfers" rel="noopener">Broncode en wijzigingshistorie</a></div>
  </div>
  <p class="fine">Laatst bijgewerkt op ${datum(SITE.bijgewerkt)}. Deze site brengt openbare bronnen bij elkaar
  en rekent ermee. Het is geen medisch, juridisch of financieel advies. Cijfers die wij zelf hebben afgeleid
  staan als zodanig gemarkeerd, met de berekening erbij. Correcties zijn welkom en worden zichtbaar doorgevoerd —
  de volledige wijzigingshistorie staat openbaar op GitHub. Deze site laadt geen externe scripts,
  lettertypen of trackers en plaatst geen cookies.</p>
</div></footer>

<div class="tip" id="tip" role="status"></div>
<script src="/site.js" defer></script>
</body>
</html>`;
}
