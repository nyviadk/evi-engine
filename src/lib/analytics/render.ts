// Ren HTML-render af stats-dashboardet (serveret direkte af Workeren, ingen
// React/Next-side). ALLE dynamiske værdier (stier, referrers) stammer fra
// besøgendes input → escapes altid mod XSS.

import { RANGES, type NameCount, type StatsData } from "./types";
import { render_chart, CHART_CSS, CHART_SCRIPT } from "./chart";

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c] ?? c);
}

function fmt(n: number): string {
  return n.toLocaleString("da-DK");
}

function list(title: string, rows: NameCount[], empty: string): string {
  const items = rows.length
    ? rows
        .map(
          (r) =>
            `<li><span class="k">${esc(r.name || "/")}</span><span class="v">${fmt(r.count)}</span></li>`,
        )
        .join("")
    : `<li class="empty">${esc(empty)}</li>`;
  return `<section class="card"><h2>${esc(title)}</h2><ul>${items}</ul></section>`;
}

function flow_section(data: StatsData): string {
  // Andel pr. from-sti: "af alle der forlod X, gik n% videre til Y".
  const totals = new Map<string, number>();
  for (const f of data.flow)
    totals.set(f.from, (totals.get(f.from) ?? 0) + f.count);
  const items = data.flow.length
    ? data.flow
        .map((f) => {
          const total = totals.get(f.from) ?? f.count;
          const pct = total ? Math.round((f.count / total) * 100) : 0;
          return `<li><span class="k">${esc(f.from || "/")} → ${esc(f.to || "/")}</span><span class="v">${pct}%</span></li>`;
        })
        .join("")
    : `<li class="empty">Ingen intern navigation endnu.</li>`;
  return `<section class="card"><h2>Flow — hvor de klikker videre</h2><ul>${items}</ul></section>`;
}

function range_picker(days: number): string {
  const links = RANGES.map((r) => {
    const active = r === days;
    return `<a class="range${active ? " active" : ""}" href="?d=${r}"${active ? ' aria-current="true"' : ""}>${r} dage</a>`;
  }).join("");
  return `<nav class="ranges" aria-label="Tidsinterval">${links}</nav>`;
}

export function render_dashboard(repo: string, data: StatsData): string {
  const body = data.ok
    ? `
      <div class="stats">
        <div class="stat"><div class="num">${fmt(data.views)}</div><div class="lbl">Sidevisninger</div></div>
        <div class="stat"><div class="num">${data.visitors ? fmt(data.visitors) : "—"}</div><div class="lbl">Unikke besøgende</div></div>
      </div>
      ${render_chart(data.timeseries, data.days)}
      <div class="grid">
        ${list("Mest besøgte sider", data.top_pages, "Ingen data endnu.")}
        ${list("Landingssider", data.entry_pages, "Ingen data endnu.")}
        ${list("Kilder", data.referrers, "Ingen eksterne kilder endnu.")}
        ${flow_section(data)}
        ${list("Lande", data.countries, "Ingen data endnu.")}
        ${list("Sprog", data.languages, "Ingen data endnu.")}
        ${list("Enheder", data.devices, "Ingen data endnu.")}
      </div>`
    : `<p class="notice">Kunne ikke hente tallene lige nu. Prøv igen om lidt.</p>`;

  return shell(
    esc(repo),
    `<header class="head"><div class="head-l"><span class="brand">Evi Stats</span><span class="meta">${esc(repo)}</span></div>${range_picker(data.days)}</header>
     ${body}
     <footer class="foot">Cookieless statistik · ingen personoplysninger gemmes.</footer>`,
  );
}

export function render_message(text: string): string {
  return shell(
    "Evi Stats",
    `<header class="head"><div class="brand">Evi Stats</div></header><p class="notice">${esc(text)}</p>`,
  );
}

function shell(title: string, inner: string): string {
  return `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} · Evi Stats</title><style>${CSS}${CHART_CSS}</style></head><body><main class="wrap">${inner}</main><script>${CHART_SCRIPT}</script></body></html>`;
}

const CSS = `*{box-sizing:border-box}
:root{--bg:#f2f5f3;--sf:#fff;--ink:#17201d;--mut:#5a6660;--line:#dbe2de;--acc:#1f6f5c}
@media(prefers-color-scheme:dark){:root{--bg:#0f1210;--sf:#181c19;--ink:#e7ece8;--mut:#9aa49e;--line:#262d29;--acc:#6fbfa6}}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:920px;margin:0 auto;padding:2rem 1.25rem 3rem}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.75rem;border-bottom:1px solid var(--line);padding-bottom:1rem;margin-bottom:1.5rem}
.head-l{display:flex;flex-direction:column;gap:.1rem}
.ranges{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;flex-shrink:0}
.ranges .range{padding:.32rem .7rem;font-size:.85rem;color:var(--mut);text-decoration:none;border-left:1px solid var(--line);white-space:nowrap}
.ranges .range:first-child{border-left:none}
.ranges .range:hover{background:var(--line)}
.ranges .range.active,.ranges .range.active:hover{background:var(--acc);color:var(--sf)}
.brand{font-weight:700;font-size:1.15rem;color:var(--acc)}
.meta{color:var(--mut);font-size:.9rem}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
.stat{background:var(--sf);border:1px solid var(--line);border-radius:12px;padding:1.25rem}
.num{font-size:2.2rem;font-weight:700;font-variant-numeric:tabular-nums}
.lbl{color:var(--mut);font-size:.9rem;margin-top:.25rem}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
@media(max-width:640px){.stats,.grid{grid-template-columns:1fr}}
.card{background:var(--sf);border:1px solid var(--line);border-radius:12px;padding:1.1rem 1.2rem;min-width:0}
.card h2{margin:0 0 .6rem;font-size:.95rem;font-weight:600}
.card ul{list-style:none;margin:0;padding:0}
.card li{display:flex;justify-content:space-between;gap:1rem;padding:.35rem 0;border-top:1px solid var(--line);font-size:.92rem}
.card li:first-child{border-top:none}
.card .k{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.card .v{color:var(--mut);font-variant-numeric:tabular-nums;flex-shrink:0}
.card .empty{color:var(--mut);justify-content:flex-start}
.notice{background:var(--sf);border:1px solid var(--line);border-radius:12px;padding:1.5rem;color:var(--mut)}
.foot{margin-top:2rem;color:var(--mut);font-size:.82rem;text-align:center}`;
