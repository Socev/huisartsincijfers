/* Nederlandse notatie. Alle getallen op de site lopen hierlangs, zodat
   duizendtallen, decimalen en euro's overal identiek worden weergegeven. */
/* Het echte minteken (U+2212) in plaats van een koppelteken: even breed als een
   cijfer, zodat kolommen met negatieve waarden netjes uitlijnen. */
const nl = (n, o) => n.toLocaleString('nl-NL', o).replace(/^-/, '−');

export const num   = (n, d = 0) => nl(n, {minimumFractionDigits:d, maximumFractionDigits:d});
export const eur   = (n, d = 2) => '€ ' + nl(n, {minimumFractionDigits:d, maximumFractionDigits:d});
export const eur0  = n => eur(n, 0);
export const mln   = n => '€ ' + nl(n/1e6, {minimumFractionDigits:0, maximumFractionDigits:0}) + ' mln';
export const pct   = (n, d = 1) => nl(n*100, {minimumFractionDigits:d, maximumFractionDigits:d}) + '%';
export const uur   = (n, d = 1) => nl(n, {minimumFractionDigits:d, maximumFractionDigits:d}) + ' u';
export const datum = s => new Date(s + 'T00:00:00Z').toLocaleDateString('nl-NL',
  {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});

/** HTML-escape voor alles wat uit de datalaag in een pagina belandt. */
export const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
