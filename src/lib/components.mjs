/* ===========================================================================
   Bouwstenen. Elke functie geeft HTML terug. Pagina's stellen alleen samen;
   vormgeving zit hier, ontwerpwaarden in tokens.css. Zie HUISSTIJL.md.
   =========================================================================== */
import { esc, num, eur, pct } from './format.mjs';
import { bronnen } from './data.mjs';

const SERIES = n => `var(--series-${n})`;

/* Tooltip-inhoud is HTML die via innerHTML wordt gezet. Voor het attribuut moet
   hij volledig geescapet worden, anders breekt een aanhalingsteken in een
   style-attribuut het data-tip-attribuut open. */
const tip = html => esc(html);

/* Ronde asverdeling: kiest een stapgrootte uit 1/2/2,5/5 maal een macht van tien,
   zodat er 0, 2.000, 4.000 op de as staat en niet 2.099, 4.198. */
function ticks(lo, hi, n = 4) {
  const ruw = (hi - lo) / n, macht = Math.pow(10, Math.floor(Math.log10(ruw)));
  const stap = [1, 2, 2.5, 5, 10].map(m => m * macht).find(v => v >= ruw) ?? 10 * macht;
  const start = Math.ceil(lo / stap) * stap, out = [];
  for (let v = start; v <= hi + 1e-9; v += stap) out.push(+v.toFixed(10));
  return out;
}

/* ---------- bronvermelding ---------- */
export function bronLabel(param, { badge = true } = {}) {
  const b = bronnen[param.bron];
  const naam = b ? `${b.uitgever}, ${b.titel}` : param.bron;
  const vind = param.vindplaats ? ` — ${param.vindplaats}` : '';
  const link = b?.url ? `<a href="${esc(b.url)}" rel="noopener">${esc(naam)}</a>` : esc(naam);
  const bg = badge && param.status !== 'definitief'
    ? ` <span class="badge ${esc(param.status)}">${esc(param.status)}</span>` : '';
  return `<span class="bron">${link}${esc(vind)}${bg}</span>`;
}

/* ---------- tegel ---------- */
export function tile({ waarde, label, bron, href }) {
  const inner = `<div class="v num">${waarde}</div><div class="k">${label}</div>` +
                (bron ? `<div class="src">${bron}</div>` : '');
  return href ? `<a class="tile" href="${esc(href)}">${inner}</a>` : `<div class="tile">${inner}</div>`;
}

/* ---------- kerngetal ---------- */
export const heroNumber = (n, uitleg) =>
  `<div class="hero-n"><div class="n">${n}</div><div class="u">${uitleg}</div></div>`;

/* ---------- call-out in drie rollen ----------
   inzicht = de hoofdconclusie · letop = risico op verkeerde lezing ·
   methode = technische noot. Kleur is nooit de enige drager: elke rol draagt
   ook een woordlabel, zodat de betekenis overkomt zonder kleurwaarneming. */
const ROLLEN = { inzicht: 'Inzicht', letop: 'Let op', methode: 'Methode' };

export const callout = (html, rol) => {
  const label = ROLLEN[rol];
  return `<div class="callout${rol ? ' ' + rol : ''}">` +
    (label ? `<span class="rol">${label}</span>` : '') +
    `<p>${html}</p></div>`;
};

/* ---------- paneel ---------- */
export const panel = html => `<div class="panel">${html}</div>`;

/* ---------- tabel ---------- */
export function table({ cols, rows, klasse = '' }) {
  const th = cols.map(c => `<th${c.r ? ' class="r"' : ''}>${esc(c.label)}</th>`).join('');
  const tr = rows.map(r => '<tr>' + r.map((v, i) =>
    `<td${cols[i].r ? ' class="r"' : ''}>${v}</td>`).join('') + '</tr>').join('');
  return `<div class="tablescroll"><table class="${klasse}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}
export const tableDetails = (samenvatting, tbl) =>
  `<details class="tbl"><summary>${esc(samenvatting)}</summary>${tbl}</details>`;

/* ---------- gestapelde balk ----------
   Eén balk, meerdere segmenten. Waardelabel alleen binnen een segment als het
   comfortabel past; anders draagt de legenda het. Altijd een tabelweergave. */
export function stackedBar({ id, items, caption, fmt = eur, unit = '' }) {
  const totaal = items.reduce((s, i) => s + i.waarde, 0);
  const segs = items.map((it, i) => {
    const aandeel = it.waarde / totaal;
    const label = aandeel > 0.16 ? `<span class="inl">${fmt(it.waarde)}</span>` : '';
    const tipHtml = `<b>${esc(it.naam)}</b><br>${fmt(it.waarde)}${unit} · ${pct(aandeel)}` +
                (it.toelichting ? `<br><span style="color:var(--text-secondary)">${esc(it.toelichting)}</span>` : '');
    return `<div class="seg" style="width:${(aandeel*100).toFixed(3)}%;background:${SERIES(i+1)}" data-tip="${tip(tipHtml)}">${label}</div>`;
  }).join('');
  const leg = items.map((it, i) =>
    `<div class="lg"><span class="sw" style="background:${SERIES(i+1)}"></span>${esc(it.kort ?? it.naam)} <b>${fmt(it.waarde)}</b></div>`).join('');
  const tbl = table({
    cols: [{label:'Onderdeel'}, {label:`Waarde`, r:true}, {label:'Aandeel', r:true}],
    rows: items.map(it => [esc(it.naam), fmt(it.waarde), pct(it.waarde/totaal)])
        .concat([[`<b>Totaal</b>`, `<b>${fmt(totaal)}</b>`, `<b>100,0%</b>`]])
  });
  return `<figure${id ? ` id="${esc(id)}"` : ''}>
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    <div class="barwrap"><div class="sbar">${segs}</div></div>
    <div class="axis"><span>0</span><span>${fmt(totaal)}</span></div>
    <div class="legend">${leg}</div>
    ${tableDetails('Toon als tabel', tbl)}
  </figure>`;
}

/* ---------- staafgrafiek (kolommen) ---------- */
export function barChart({ items, caption, fmt = num, hoogte = 260, serie = 1, benchmark }) {
  const W = 720, H = hoogte, mT = 26, mB = 40, mL = 8, mR = 8;
  const max = Math.max(...items.map(i => i.waarde), benchmark?.waarde ?? 0) * 1.12;
  const band = (W - mL - mR) / items.length;
  const bw = Math.min(24, band * 0.55);
  const y = v => mT + (H - mT - mB) * (1 - v / max);

  const grid = ticks(0, max).map(v =>
    `<line class="grid-l" x1="${mL}" x2="${W-mR}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`).join('');

  const bars = items.map((it, i) => {
    const cx = mL + band * i + band / 2;
    const yy = y(it.waarde), h = H - mB - yy;
    return `<g>
      <rect x="${(cx-bw/2).toFixed(1)}" y="${yy.toFixed(1)}" width="${bw}" height="${Math.max(h,0).toFixed(1)}"
            rx="4" fill="${SERIES(it.serie ?? serie)}"/>
      <rect class="hit" x="${(cx-band/2).toFixed(1)}" y="${mT}" width="${band.toFixed(1)}" height="${H-mB-mT}"
            data-tip="${tip(`<b>${esc(it.label)}</b><br>${fmt(it.waarde)}` + (it.toelichting ? `<br><span style="color:var(--text-secondary)">${esc(it.toelichting)}</span>` : ''))}"/>
      <text class="dl" x="${cx.toFixed(1)}" y="${(yy-8).toFixed(1)}" text-anchor="middle">${fmt(it.waarde)}</text>
      <text class="ax" x="${cx.toFixed(1)}" y="${H-mB+18}" text-anchor="middle">${esc(it.label)}</text>
    </g>`;
  }).join('');

  const bm = benchmark ? `
    <line x1="${mL}" x2="${W-mR}" y1="${y(benchmark.waarde).toFixed(1)}" y2="${y(benchmark.waarde).toFixed(1)}"
          stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="0"/>
    <text class="ax" x="${W-mR}" y="${(y(benchmark.waarde)-7).toFixed(1)}" text-anchor="end">${esc(benchmark.label)}</text>` : '';

  return `<figure>
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">
      ${grid}${bm}${bars}
    </svg>
    ${tableDetails('Toon als tabel', table({
      cols:[{label:'Categorie'},{label:'Waarde',r:true}],
      rows: items.map(i => [esc(i.label), fmt(i.waarde)])
    }))}
  </figure>`;
}

/* ---------- lijngrafiek ---------- */
export function lineChart({ reeksen, x, caption, fmt = num, hoogte = 300, yNul = false }) {
  const W = 720, H = hoogte, mT = 24, mB = 38, mL = 46, mR = 66;
  const alle = reeksen.flatMap(r => r.waarden.filter(v => v != null));
  const lo = yNul ? 0 : Math.min(...alle) * 0.94, hi = Math.max(...alle) * 1.06;
  const px = i => mL + (W - mL - mR) * (x.length === 1 ? .5 : i / (x.length - 1));
  const py = v => mT + (H - mT - mB) * (1 - (v - lo) / (hi - lo));

  const grid = ticks(lo, hi).map(v => `<line class="grid-l" x1="${mL}" x2="${W-mR}" y1="${py(v).toFixed(1)}" y2="${py(v).toFixed(1)}"/>
    <text class="ax" x="${mL-8}" y="${(py(v)+4).toFixed(1)}" text-anchor="end">${fmt(v)}</text>`).join('');
  const xlab = x.map((l, i) => `<text class="ax" x="${px(i).toFixed(1)}" y="${H-mB+18}" text-anchor="middle">${esc(l)}</text>`).join('');

  /* Eindlabels mogen elkaar niet overlappen. Reeksen die dicht bij elkaar
     eindigen worden verticaal uit elkaar geduwd, zodat geen enkel getal
     onleesbaar wordt. De markering blijft op de werkelijke waarde staan. */
  const einden = reeksen.map((r, si) => {
    const pts = r.waarden.map((v, i) => v == null ? null : [px(i), py(v)]).filter(Boolean);
    return { si, r, pts, laatste: pts[pts.length - 1],
             eind: r.waarden.filter(v => v != null).slice(-1)[0] };
  });
  const MIN = 14;
  const gesorteerd = [...einden].sort((a, b) => a.laatste[1] - b.laatste[1]);
  gesorteerd.forEach((e, i) => {
    e.ly = e.laatste[1] + 4;
    if (i && e.ly - gesorteerd[i-1].ly < MIN) e.ly = gesorteerd[i-1].ly + MIN;
  });

  const lijnen = einden.map(({ si, r, pts, laatste, eind, ly }) => {
    const kleur = SERIES(r.serie ?? si + 1);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const verschoven = Math.abs(ly - laatste[1]) > 1;
    return `<path d="${d}" fill="none" stroke="${kleur}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${laatste[0].toFixed(1)}" cy="${laatste[1].toFixed(1)}" r="4.5" fill="${kleur}" stroke="var(--surface-1)" stroke-width="2"/>
      ${verschoven ? `<line x1="${(laatste[0]+5).toFixed(1)}" y1="${laatste[1].toFixed(1)}" x2="${(laatste[0]+9).toFixed(1)}" y2="${(ly-4).toFixed(1)}" stroke="${kleur}" stroke-width="1"/>` : ''}
      <text class="dl" x="${(laatste[0]+11).toFixed(1)}" y="${(ly).toFixed(1)}">${fmt(eind)}</text>`;
  }).join('');

  const hits = x.map((l, i) => {
    const bw = (W - mL - mR) / Math.max(x.length - 1, 1);
    const rij = reeksen.map(r => r.waarden[i] == null ? null :
      `<span style="color:var(--text-secondary)">${esc(r.naam)}</span> <b>${fmt(r.waarden[i])}</b>`).filter(Boolean).join('<br>');
    return `<rect class="hit" x="${(px(i)-bw/2).toFixed(1)}" y="${mT}" width="${bw.toFixed(1)}" height="${H-mT-mB}"
             data-tip="${tip(`<b>${esc(l)}</b><br>${rij}`)}"/>`;
  }).join('');

  const leg = reeksen.length > 1 ? `<div class="legend">` + reeksen.map((r, si) =>
    `<div class="lg"><span class="sw" style="background:${SERIES(r.serie ?? si+1)}"></span>${esc(r.naam)}</div>`).join('') + `</div>` : '';

  return `<figure>
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">
      ${grid}${xlab}${lijnen}${hits}
    </svg>${leg}
    ${tableDetails('Toon als tabel', table({
      cols: [{label:''}, ...x.map(l => ({label:String(l), r:true}))],
      rows: reeksen.map(r => [esc(r.naam), ...r.waarden.map(v => v == null ? '—' : fmt(v))])
    }))}
  </figure>`;
}

/* ---------- vergelijkingsbalken (twee waarden naast elkaar) ---------- */
export function compareBars({ items, caption, fmt = num, eenheid = '' }) {
  const max = Math.max(...items.map(i => i.waarde));
  const rijen = items.map((it, i) => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:5px">
        <span style="color:var(--text-secondary)">${esc(it.label)}</span>
        <b class="num">${fmt(it.waarde)}${eenheid}</b>
      </div>
      <div style="height:14px;background:var(--surface-2);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${(it.waarde/max*100).toFixed(2)}%;background:${SERIES(it.serie ?? 1)};border-radius:4px"></div>
      </div>
      ${it.toelichting ? `<div class="bron" style="margin-top:5px">${esc(it.toelichting)}</div>` : ''}
    </div>`).join('');
  return `<figure>${caption ? `<figcaption>${caption}</figcaption>` : ''}${rijen}</figure>`;
}

/* ---------- tabel rechtstreeks uit de datalaag ----------
   fmts is een rij formatteerfuncties, één per kolom. null-waarden worden
   weergegeven als liggend streepje, zodat "niet gemeten" niet leest als nul. */
export function dataTable(tabel, fmts, { toonBron = true } = {}) {
  /* Een kolom staat alleen rechts als er ook echt getallen in staan. Tekstkolommen
     rechts uitlijnen leest als een fout, ook als de tabel verder klopt. */
  const getallig = i => tabel.rijen.some(r => typeof r[i] === 'number');
  const cols = tabel.kolommen.map((k, i) => ({ label: k, r: i > 0 && getallig(i) }));
  const rows = tabel.rijen.map(r => r.map((v, i) =>
    v === null || v === undefined ? '—'
      : typeof v === 'number' ? (fmts?.[i] ? fmts[i](v) : num(v))
      : esc(String(v))));
  const t = table({ cols, rows });
  const b = toonBron ? `<p class="bron" style="margin:10px 0 0">${bronLabel(tabel)}</p>` : '';
  return `<figure><figcaption>${esc(tabel.label)}</figcaption>${t}${b}
    ${tabel.toelichting ? `<p class="bron" style="margin-top:8px">${esc(tabel.toelichting)}</p>` : ''}</figure>`;
}

/* ---------- reeks uit de datalaag ----------
   Rendert een reeksdefinitie als lijngrafiek, met de bronvermelding en een
   eventuele definitiebreuk expliciet eronder. Een breuk wordt nooit
   weggepoetst: de lezer moet zien waar de reeks niet vergelijkbaar is. */
export function serieChart(r, { fmt = num, caption, hoogte = 300, yNul = false } = {}) {
  const chart = lineChart({
    reeksen: r.reeksen, x: r.jaren.map(String),
    caption: caption ?? esc(r.label), fmt, hoogte, yNul
  });
  const breuk = r.breuk
    ? `<p class="bron" style="margin-top:10px;color:var(--signal)"><b>Let op — breuk in de reeks na ${r.breuk.na}.</b>
       <span style="color:var(--text-muted)">${esc(r.breuk.tekst)}</span></p>` : '';
  return `${chart}<p class="bron" style="margin-top:10px">${bronLabel(r)}</p>${breuk}`;
}

/* ---------- vaste toelichting bij de gemeten werkweek ----------
   De werkweek van Nivel is inclusief de dienst op de huisartsenpost. Die zorg
   kent een aparte bekostiging en valt buiten de overdagtarieven, dus overal waar
   de gemeten werkweek wordt getoond hoort deze aftrek erbij. Eén plek, zodat de
   tekst op elke pagina identiek is. */
export function anwNoot(bruto, dienst, { kort = false } = {}) {
  const netto = bruto - dienst;
  if (kort) return `<p class="small"><b>Let op:</b> de gemeten werkweek van ${num(bruto,1)} uur is inclusief
    ${num(dienst,1)} uur dienst op de huisartsenpost. Die zorg kent een aparte bekostiging en zit niet in de
    overdagtarieven. Wie met de tarieven rekent, houdt ${num(netto,1)} uur over.
    <a href="/uren/#anw">Waarom die aftrek nodig is</a>.</p>`;
  return `<div class="callout" id="anw"><p><strong>De dienst moet eraf.</strong>
    Het tijdsbestedingsonderzoek meet ${num(bruto,1)} uur per week voor de praktijkhoudend huisarts,
    <em>inclusief</em> de dienst op de huisartsenpost. De NZa houdt die zorg bewust buiten de overdagtarieven:
    zij kent een aparte bekostiging en de opbrengsten vallen buiten scope. Wie de werkweek naast de tarieven
    legt, moet de ${num(dienst,1)} uur dienst er dus afhalen en met <b>${num(netto,1)} uur</b> rekenen.
    Doe je dat niet, dan reken je uren toe aan een tarief dat ze niet vergoedt.</p></div>`;
}

/* ---------- trechter ----------
   Horizontale balken die allemaal links beginnen en steeds korter worden, met
   het verlies per stap ernaast. Voor ketens waarin een grootheid onderweg
   kleiner wordt en de lezer moet zien waar dat gebeurt. */
export function trechter({ stappen, caption, fmt = num, eenheid = '' }) {
  const max = stappen[0].waarde;
  const rijen = stappen.map((s, i) => {
    const vorige = i ? stappen[i-1].waarde : null;
    const verlies = vorige !== null ? s.waarde - vorige : null;
    return `<div style="margin-bottom:${i === stappen.length-1 ? 4 : 18}px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:6px">
        <span style="font-size:14px;color:var(--text-primary)${s.nadruk ? ';font-weight:600' : ''}">${esc(s.label)}</span>
        <b class="num" style="font-size:15px;white-space:nowrap">${fmt(s.waarde)}${eenheid}</b>
      </div>
      <div style="height:${s.nadruk ? 22 : 18}px;background:var(--surface-2);border-radius:4px;overflow:hidden"
           data-tip="${tip(`<b>${esc(s.label)}</b><br>${fmt(s.waarde)}${eenheid}` + (s.toelichting ? `<br><span style="color:var(--text-secondary)">${esc(s.toelichting)}</span>` : ''))}">
        <div style="height:100%;width:${(s.waarde/max*100).toFixed(2)}%;background:${SERIES(s.serie ?? 1)};border-radius:4px"></div>
      </div>
      ${s.toelichting ? `<div class="bron" style="margin-top:5px">${esc(s.toelichting)}</div>` : ''}
      ${verlies !== null ? `<div style="font-size:12.5px;color:var(--text-secondary);margin-top:7px;padding-left:2px">
          ${verlies < 0 ? '↓' : '↑'} ${fmt(Math.abs(verlies))}${eenheid}${s.reden ? ' — ' + esc(s.reden) : ''}</div>` : ''}
    </div>`;
  }).join('');
  const tbl = table({
    cols:[{label:'Stap'},{label:'Waarde',r:true},{label:'Verschil met de vorige stap',r:true}],
    rows: stappen.map((s,i) => [esc(s.label), fmt(s.waarde)+eenheid,
      i ? (s.waarde - stappen[i-1].waarde > 0 ? '+' : '−') + fmt(Math.abs(s.waarde - stappen[i-1].waarde)) + eenheid : '—'])
  });
  return `<figure>${caption ? `<figcaption>${caption}</figcaption>` : ''}${rijen}${tableDetails('Toon als tabel', tbl)}</figure>`;
}

/* ===========================================================================
   Claim-first bouwstenen

   De site toonde eerst definities en voorbehouden, en pas daarna waarom een
   cijfer ertoe doet. Deze componenten draaien dat om: conclusie, bewijs,
   rekenregel, methode. Zie hoofdstuk 20 van de audit.
   =========================================================================== */

/* ---------- status ----------
   Elk prominent kerngetal draagt zijn jaar en zijn status. Een schatting in
   een hero zonder zichtbaar label is een fout, geen stijlkwestie. */
export const statusBadge = status =>
  `<span class="badge ${String(status).includes('schatting') ? 'schatting' : status === 'definitief' ? '' : 'afgeleid'}">${esc(status)}</span>`;

export function statusregel(delen) {
  return `<p class="statusregel">` +
    delen.filter(Boolean).map(esc).join('<span class="sep">·</span>') + `</p>`;
}

/* ---------- twee grootheden tegenover elkaar ----------
   Voor personen tegenover rekeneenheden. Beide zijden dragen hun eigen
   eenheid en status, zodat de vergelijking niet leest als hetzelfde soort ding. */
export function statContrast({ links, rechts, ratio, pijl = '→' }) {
  const zij = z => `<div class="zij">
    <div class="v num">${z.waarde}</div>
    <div class="k">${esc(z.label)}</div>
    ${z.eenheid ? `<div class="e">${esc(z.eenheid)}</div>` : ''}
    ${z.status ? `<div class="s">${statusBadge(z.status)}</div>` : ''}
  </div>`;
  return `<div class="contrast">
    ${zij(links)}
    <div class="pijl" aria-hidden="true">${pijl}</div>
    ${zij(rechts)}
    ${ratio ? `<p class="ratio">${ratio}</p>` : ''}
  </div>`;
}

/* ---------- causale keten ----------
   Personen → rekeneenheden → na schoning → gedekt. Elke stap toont waarde,
   eenheid en status; elke pijl toont de rekenregel én de oorzaak, niet alleen
   het verlies. Klikken springt naar de uitleg. */
export function causalChain({ stappen, fmt = num }) {
  const rijen = stappen.map((s, i) => `
    <div class="stap">
      <div class="rail"><div class="dot"></div><div class="lijn"></div></div>
      <div class="inh">
        <div class="v num">${fmt(s.waarde)}</div>
        <div class="k">${esc(s.label)}</div>
        ${s.eenheidKort ? `<div class="e">${esc(s.eenheidKort)}</div>` : ''}
        ${s.status ? `<div class="st">${statusBadge(s.status)}</div>` : ''}
        ${s.toelichting ? `<p class="bron" style="margin:8px 0 0">${esc(s.toelichting)}</p>` : ''}
        ${stappen[i+1] ? `<div class="regel">
          <span class="rr">${esc(stappen[i+1].regel ?? '')}</span>
          ${esc(stappen[i+1].oorzaak ?? '')}
          ${stappen[i+1].anchor ? `<a class="meer" href="${esc(stappen[i+1].anchor)}">Hoe deze stap werkt →</a>` : ''}
        </div>` : ''}
      </div>
    </div>`).join('');
  return `<div class="keten">${rijen}</div>`;
}

/* ---------- bewijskaart ----------
   Eén claim, één kerngetal, één zin bewijs, de status, en een weg naar de
   berekening. Meer hoort er niet in. */
export function evidenceCard({ claim, kern, bewijs, status, href, hrefLabel = 'Bekijk de berekening' }) {
  return `<div class="ev">
    <p class="claim">${claim}</p>
    ${kern ? `<div class="kern num">${kern}</div>` : ''}
    <p class="bewijs">${bewijs}</p>
    <div class="voet">
      ${status ? statusBadge(status) : ''}
      ${href ? `<a href="${esc(href)}" style="font-size:12.5px">${esc(hrefLabel)} →</a>` : ''}
    </div>
  </div>`;
}

/* ---------- methodeblok ----------
   Methode, citaten, detailtabellen en gevoeligheden horen beschikbaar te zijn
   maar niet vóór de kernthese. Werkt zonder JavaScript. */
export const methodDisclosure = (titel, html) =>
  `<details class="methode"><summary>${esc(titel)}</summary><div class="inh">${html}</div></details>`;

/* ---------- begrippenlegenda ----------
   Personen, rekeneenheden en gedekte eenheden zijn verschillende dingen.
   Waar ze in één beeld staan, gaat deze balk erboven. */
export const begrippenBalk = (items) =>
  `<div class="begrippen">` + items.map(i =>
    `<div><b>${esc(i.term)}</b><span>${esc(i.uitleg)}</span></div>`).join('') + `</div>`;

/* ---------- meetlat ----------
   Eén horizontale schaal met gemarkeerde grenzen. Voor grootheden die in
   dezelfde eenheid worden uitgedrukt maar uit verschillende bronnen komen:
   dan is zichtbaar hoe ver ze uit elkaar liggen zonder dat een gestapelde
   balk suggereert dat ze bij elkaar optellen. */
export function meetlat({ max, punten, caption, fmt = num, eenheid = '' }) {
  const merken = punten.map((p, i) => {
    const x = (p.waarde / max) * 100;
    const boven = i % 2 === 0;
    /* Een markering aan de rand zou half buiten het vlak vallen. Die wordt
       daarom naar binnen uitgelijnd in plaats van gecentreerd. */
    const rand = x > 88 ? ' rechts' : x < 12 ? ' links' : '';
    return `<div class="merk${boven ? '' : ' onder'}${rand}" style="left:${x.toFixed(2)}%"
      data-tip="${tip(`<b>${esc(p.label)}</b><br>${fmt(p.waarde)}${eenheid}` +
        (p.toelichting ? `<br><span style="color:var(--text-secondary)">${esc(p.toelichting)}</span>` : ''))}">
      <span class="l">${esc(p.label)}</span>
      <span class="w num">${fmt(p.waarde)}</span>
      <span class="s" style="background:${SERIES(p.serie ?? 1)}"></span>
    </div>`;
  }).join('');
  const tbl = table({
    cols: [{label:'Grens'}, {label:`Waarde`, r:true}, {label:'Wat het is'}],
    rows: punten.map(p => [esc(p.label), fmt(p.waarde) + eenheid, esc(p.toelichting ?? '')])
  });
  return `<figure>
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    <div class="meetlat"><div class="baan"></div>${merken}</div>
    ${tableDetails('Toon als tabel', tbl)}
  </figure>`;
}
