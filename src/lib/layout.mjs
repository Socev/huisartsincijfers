import { esc, datum } from './format.mjs';

export const SITE = {
  naam: 'huisartsincijfers.nl',
  titel: 'Huisarts in cijfers',
  omschrijving: 'De financiering van de Nederlandse huisartsenzorg, herleidbaar tot de bron.',
  url: 'https://huisartsincijfers.nl',
  bijgewerkt: '2026-08-02'
};

export const NAV = [
  { href: '/',                     label: 'Kerncijfers' },
  { href: '/arbeidskosten/',       label: 'Arbeidskosten' },
  { href: '/uren/',                label: 'Uren' },
  { href: '/beroepsgroep/',        label: 'Beroepsgroep' },
  { href: '/inkomen/',             label: 'Inkomen' },
  { href: '/praktijkkosten/',      label: 'Praktijkkosten' },
  { href: '/tarieven/',            label: 'Tarieven' },
  { href: '/omzet/',               label: 'Omzet en scope' },
  { href: '/bronnen/',             label: 'Bronnen' },
  { href: '/over/',                label: 'Over' }
];

const MARK = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
  <rect x="1" y="13" width="4" height="8" rx="1.4" fill="currentColor"/>
  <rect x="7" y="9" width="4" height="12" rx="1.4" fill="currentColor"/>
  <rect x="13" y="5" width="4" height="16" rx="1.4" fill="currentColor"/>
  <rect x="19" y="1" width="4" height="20" rx="1.4" fill="var(--accent)" opacity=".2"/>
  <rect x="19" y="14" width="4" height="7" rx="1.4" fill="var(--accent)"/>
</svg>`;

export function pagina({ pad, titel, omschrijving, eyebrow, h1, lede, body, proto = true }) {
  const nav = NAV.map(n =>
    `<a href="${n.href}"${n.href === pad ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('');

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
  <nav class="main" aria-label="Hoofdmenu">${nav}</nav>
  <button class="tt" id="tt" type="button" aria-live="polite">donker</button>
</div></header>

<main id="inhoud"><div class="wrap">
  <div class="page-head">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(h1)}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </div>
  ${body}
</div></main>

<footer class="site"><div class="wrap">
  <div class="cols">
    <div><h4>Onderwerpen</h4>
      <a href="/arbeidskosten/">Arbeidskosten praktijkhouder</a>
      <a href="/uren/">Gewerkte uren en de fte-definitie</a>
      <a href="/beroepsgroep/">De beroepsgroep in aantallen</a>
      <a href="/inkomen/">Inkomen tegenover de norm</a>
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
