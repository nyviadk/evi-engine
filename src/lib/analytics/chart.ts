// Server-renderet timeserie-graf (sidevisninger pr. dag). Én serie → ingen
// kategorisk palette nødvendig, kun brand-accenten mod fladen. Ingen data er
// bruger-styret (kun datoer + tal), så intet at escape. Marks følger dataviz-
// skillen: tynd 2px-linje, lav-opacitet areal, fremhævet endepunkt, recessivt
// grid, selektiv direkte-label. Tilgængelig: role=img + aria-label + tabel-view.

import type { DayCount } from "./types";

// ViewBox-geometri. Hover-scriptet læser plot-boksen fra .hit-rektanglen, så
// disse tal findes kun ét sted.
const W = 720;
const H = 220;
const M = { l: 6, r: 6, t: 12, b: 22 };
const PW = W - M.l - M.r;
const PH = H - M.t - M.b;

const MONTHS = [
  "jan", "feb", "mar", "apr", "maj", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function num(n: number): string {
  return n.toLocaleString("da-DK");
}

function day_label(iso: string): string {
  const parts = iso.split("-");
  const d = Number(parts[2]);
  const m = Number(parts[1]);
  return `${d}. ${MONTHS[m - 1] ?? ""}`;
}

export function render_chart(series: DayCount[], days: number): string {
  const total = series.reduce((s, p) => s + p.views, 0);
  if (series.length === 0 || total === 0) {
    return `<figure class="chart card"><figcaption class="chart-cap">Sidevisninger pr. dag</figcaption><p class="chart-empty">Ingen data i perioden endnu.</p></figure>`;
  }

  const n = series.length;
  const first = series[0];
  const last = series[n - 1];
  if (!first || !last) return "";
  const max = Math.max(...series.map((p) => p.views), 1);

  const x = (i: number): number =>
    n < 2 ? M.l + PW / 2 : M.l + (i / (n - 1)) * PW;
  const y = (v: number): number => M.t + PH - (v / max) * PH;
  const base_y = M.t + PH;

  const points = series.map((p, i) => `${x(i).toFixed(1)},${y(p.views).toFixed(1)}`);
  const line = `M${points.join("L")}`;
  const area = `M${x(0).toFixed(1)},${base_y}L${points.join("L")}L${x(n - 1).toFixed(1)},${base_y}Z`;

  const grid = [max, max / 2]
    .map((v) => {
      const gy = y(v);
      return `<line class="grid" x1="${M.l}" x2="${W - M.r}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}"/><text class="axis" x="${M.l}" y="${(gy - 3).toFixed(1)}">${num(Math.round(v))}</text>`;
    })
    .join("");

  const lx = x(n - 1);
  const ly = y(last.views);
  const endpoint = `<circle class="end-ring" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="5"/><circle class="end" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3.2"/>`;

  const mid_idx = Math.floor((n - 1) / 2);
  const mid = series[mid_idx] ?? first;
  const xparts = [
    `<text class="axis" x="${x(0).toFixed(1)}" y="${H - 6}" text-anchor="start">${day_label(first.day)}</text>`,
  ];
  if (n > 2) {
    xparts.push(
      `<text class="axis" x="${x(mid_idx).toFixed(1)}" y="${H - 6}" text-anchor="middle">${day_label(mid.day)}</text>`,
    );
  }
  xparts.push(
    `<text class="axis" x="${x(n - 1).toFixed(1)}" y="${H - 6}" text-anchor="end">${day_label(last.day)}</text>`,
  );
  const xlabels = xparts.join("");

  const peak = series.reduce((a, b) => (b.views > a.views ? b : a), first);
  const aria = `Sidevisninger pr. dag, seneste ${days} dage. I alt ${num(total)}. Højest ${num(peak.views)} den ${day_label(peak.day)}.`;

  const data_attr = JSON.stringify(series.map((p) => [p.day, p.views])).replace(
    /'/g,
    "&#39;",
  );

  const rows = series
    .map((p) => `<tr><td>${day_label(p.day)}</td><td>${num(p.views)}</td></tr>`)
    .join("");

  return `<figure class="chart card" data-series='${data_attr}'>
  <figcaption class="chart-cap">Sidevisninger pr. dag <span class="chart-total">${num(total)} i alt</span></figcaption>
  <div class="chart-wrap">
    <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}">
      ${grid}
      <path class="area" d="${area}"/>
      <path class="line" d="${line}"/>
      ${endpoint}
      ${xlabels}
      <line class="cross" x1="0" x2="0" y1="${M.t}" y2="${base_y}" style="display:none"/>
      <circle class="cursor" r="3.5" style="display:none"/>
      <rect class="hit" x="${M.l}" y="${M.t}" width="${PW}" height="${PH}"/>
    </svg>
    <div class="tip" hidden></div>
  </div>
  <details class="chart-table"><summary>Vis som tabel</summary><table><thead><tr><th>Dag</th><th>Sidevisninger</th></tr></thead><tbody>${rows}</tbody></table></details>
</figure>`;
}

export const CHART_CSS = `.chart{padding:1.1rem 1.2rem}
.chart-cap{display:flex;justify-content:space-between;align-items:baseline;gap:.5rem;font-size:.95rem;font-weight:600;margin:0 0 .7rem}
.chart-total{color:var(--mut);font-weight:400;font-size:.85rem;font-variant-numeric:tabular-nums}
.chart-wrap{position:relative}
.chart-svg{width:100%;height:auto;display:block;overflow:visible}
.chart-svg .area{fill:var(--acc);opacity:.13}
.chart-svg .line{fill:none;stroke:var(--acc);stroke-width:2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}
.chart-svg .grid{stroke:var(--line);stroke-width:1;vector-effect:non-scaling-stroke}
.chart-svg .axis{fill:var(--mut);font-size:11px}
.chart-svg .end{fill:var(--acc)}
.chart-svg .end-ring{fill:var(--sf)}
.chart-svg .cross{stroke:var(--acc);opacity:.45;stroke-width:1;vector-effect:non-scaling-stroke}
.chart-svg .cursor{fill:var(--acc);stroke:var(--sf);stroke-width:2}
.chart-svg .hit{fill:transparent}
.tip{position:absolute;top:-.3rem;transform:translateX(-50%);background:var(--ink);color:var(--bg);font-size:.78rem;padding:.2rem .45rem;border-radius:6px;white-space:nowrap;pointer-events:none;font-variant-numeric:tabular-nums;box-shadow:0 2px 8px -2px rgba(0,0,0,.3)}
.chart-empty{color:var(--mut);font-size:.9rem;margin:.4rem 0 0}
.chart-table{margin-top:.7rem;font-size:.85rem}
.chart-table summary{cursor:pointer;color:var(--mut)}
.chart-table table{width:100%;border-collapse:collapse;margin-top:.5rem}
.chart-table td,.chart-table th{text-align:left;padding:.2rem .4rem;border-top:1px solid var(--line);font-variant-numeric:tabular-nums}
.chart-table th{color:var(--mut);font-weight:600}`;

// Hover-crosshair + tooltip. Læser plot-geometrien fra .hit-rektanglen, så der
// ikke er duplikerede magiske tal. Defensiv (try/catch, null-tjek) — grafen
// virker uden JS (direkte-label + tabel), scriptet er en forbedring.
export const CHART_SCRIPT = `(function(){
document.querySelectorAll('.chart[data-series]').forEach(function(fig){
  var series;try{series=JSON.parse(fig.getAttribute('data-series'))}catch(e){return}
  if(!series||!series.length)return;
  var svg=fig.querySelector('.chart-svg'),hit=fig.querySelector('.hit'),cross=fig.querySelector('.cross'),cursor=fig.querySelector('.cursor'),tip=fig.querySelector('.tip'),wrap=fig.querySelector('.chart-wrap');
  if(!svg||!hit||!cross||!cursor||!tip||!wrap)return;
  var vbw=svg.viewBox.baseVal.width,px=hit.x.baseVal.value,pw=hit.width.baseVal.value,py=hit.y.baseVal.value,ph=hit.height.baseVal.value;
  var n=series.length,max=1;for(var i=0;i<n;i++){if(series[i][1]>max)max=series[i][1]}
  var M=['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
  function xAt(i){return n<2?px+pw/2:px+(i/(n-1))*pw}
  function yAt(v){return py+ph-(v/max)*ph}
  function lbl(iso){var p=iso.split('-');return(+p[2])+'. '+(M[(+p[1])-1]||'')}
  function move(clientX){
    var r=svg.getBoundingClientRect();if(!r.width)return;
    var vx=(clientX-r.left)/r.width*vbw;
    var frac=pw?(vx-px)/pw:0;
    var idx=Math.max(0,Math.min(n-1,Math.round(frac*(n-1))));
    var d=series[idx],cx=xAt(idx),cy=yAt(d[1]);
    cross.setAttribute('x1',cx);cross.setAttribute('x2',cx);cross.style.display='';
    cursor.setAttribute('cx',cx);cursor.setAttribute('cy',cy);cursor.style.display='';
    var wr=wrap.getBoundingClientRect();
    tip.style.left=(r.left+(cx/vbw)*r.width-wr.left)+'px';
    tip.textContent=lbl(d[0])+': '+d[1].toLocaleString('da-DK');
    tip.hidden=false;
  }
  function hide(){cross.style.display='none';cursor.style.display='none';tip.hidden=true}
  hit.addEventListener('pointermove',function(e){move(e.clientX)});
  hit.addEventListener('pointerleave',hide);
});
})();`;
