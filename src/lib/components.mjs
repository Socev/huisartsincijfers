/* ===========================================================================
   Bouwstenen. Elke functie geeft HTML terug. Pagina's stellen alleen samen;
   vormgeving zit hier, ontwerpwaarden in tokens.css. Zie HUISSTIJL.md.
   =========================================================================== */
import { esc, num, eur, pct } from './format.mjs';
import { bronnen } from './data.mjs';

const SERIES = n => `var(--series-${n})`;

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

/* ---------- let op ---------- */
export const callout = html => `<div class="callout"><p>${html}</p></div>`;

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
    const tip = `<b>${esc(it.naam)}</b><br>${fmt(it.waarde)}${unit} · ${pct(aandeel)}` +
                (it.toelichting ? `<br><span style="color:var(--text-secondary)">${esc(it.toelichting)}</span>` : '');
    return `<div class="seg" style="width:${(aandeel*100).toFixed(3)}%;background:${SERIES(i+1)}" data-tip="${esc(tip)}">${label}</div>`;
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

  const grid = [0, .25, .5, .75, 1].map(f => {
    const v = max * f;
    return `<line class="grid-l" x1="${mL}" x2="${W-mR}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`;
  }).join('');

  const bars = items.map((it, i) => {
    const cx = mL + band * i + band / 2;
    const yy = y(it.waarde), h = H - mB - yy;
    return `<g>
      <rect x="${(cx-bw/2).toFixed(1)}" y="${yy.toFixed(1)}" width="${bw}" height="${Math.max(h,0).toFixed(1)}"
            rx="4" fill="${SERIES(it.serie ?? serie)}"/>
      <rect class="hit" x="${(cx-band/2).toFixed(1)}" y="${mT}" width="${band.toFixed(1)}" height="${H-mB-mT}"
            data-tip="<b>${esc(it.label)}</b><br>${fmt(it.waarde)}${it.toelichting?`<br><span style='color:var(--text-secondary)'>${esc(it.toelichting)}</span>`:''}"/>
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

  const ticks = [0, .25, .5, .75, 1].map(f => lo + (hi - lo) * f);
  const grid = ticks.map(v => `<line class="grid-l" x1="${mL}" x2="${W-mR}" y1="${py(v).toFixed(1)}" y2="${py(v).toFixed(1)}"/>
    <text class="ax" x="${mL-8}" y="${(py(v)+4).toFixed(1)}" text-anchor="end">${fmt(v)}</text>`).join('');
  const xlab = x.map((l, i) => `<text class="ax" x="${px(i).toFixed(1)}" y="${H-mB+18}" text-anchor="middle">${esc(l)}</text>`).join('');

  const lijnen = reeksen.map((r, si) => {
    const kleur = SERIES(r.serie ?? si + 1);
    const pts = r.waarden.map((v, i) => v == null ? null : [px(i), py(v)]).filter(Boolean);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const laatste = pts[pts.length - 1];
    const eind = r.waarden.filter(v => v != null).slice(-1)[0];
    return `<path d="${d}" fill="none" stroke="${kleur}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${laatste[0].toFixed(1)}" cy="${laatste[1].toFixed(1)}" r="4.5" fill="${kleur}" stroke="var(--surface-1)" stroke-width="2"/>
      <text class="dl" x="${(laatste[0]+10).toFixed(1)}" y="${(laatste[1]+4).toFixed(1)}">${fmt(eind)}</text>`;
  }).join('');

  const hits = x.map((l, i) => {
    const bw = (W - mL - mR) / Math.max(x.length - 1, 1);
    const rij = reeksen.map(r => r.waarden[i] == null ? null :
      `<span style="color:var(--text-secondary)">${esc(r.naam)}</span> <b>${fmt(r.waarden[i])}</b>`).filter(Boolean).join('<br>');
    return `<rect class="hit" x="${(px(i)-bw/2).toFixed(1)}" y="${mT}" width="${bw.toFixed(1)}" height="${H-mT-mB}"
             data-tip="<b>${esc(l)}</b><br>${rij}"/>`;
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
  const cols = tabel.kolommen.map((k, i) => ({ label: k, r: i > 0 }));
  const rows = tabel.rijen.map(r => r.map((v, i) =>
    v === null || v === undefined ? '—'
      : typeof v === 'number' ? (fmts?.[i] ? fmts[i](v) : num(v))
      : esc(String(v))));
  const t = table({ cols, rows });
  const b = toonBron ? `<p class="bron" style="margin:10px 0 0">${bronLabel(tabel)}</p>` : '';
  return `<figure><figcaption>${esc(tabel.label)}</figcaption>${t}${b}
    ${tabel.toelichting ? `<p class="bron" style="margin-top:8px">${esc(tabel.toelichting)}</p>` : ''}</figure>`;
}
