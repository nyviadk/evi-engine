// Ren HTML-render af stats-dashboardet (serveret direkte af Workeren, ingen
// React/Next-side). ALLE dynamiske værdier (stier, referrers) stammer fra
// besøgendes input → escapes altid mod XSS.

import { RANGES, range_label, type NameCount, type StatsData } from "./types";
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

const REGIONS = new Intl.DisplayNames(["da"], { type: "region" });

// Cloudflare giver ISO-koder ("IN"); vis navnet ("Indien"). Ukendte koder
// (fx "T1" for Tor) står som de er.
function country_name(code: string): string {
  try {
    return REGIONS.of(code) ?? code;
  } catch {
    return code;
  }
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

// "/" og "/da-dk" er begge forsiden; navngiv dem, så de ikke ligner tomme stier.
// Kun sitets egne sprog (fra data) — ellers ligner fx "/om-os" en sprogkode.
function page_label(path: string, locales: Set<string>): string {
  if (!path || path === "/") return "Forsiden";
  if (locales.has(path.slice(1))) return `Forsiden (${path.slice(1)})`;
  return path;
}

// Escaped + brudpunkt efter hver "/", så lange stier brydes mellem led, ikke i "da-dk".
function flow_label(path: string, locales: Set<string>): string {
  return esc(page_label(path, locales)).replaceAll("/", "/<wbr>");
}

function flow_section(data: StatsData): string {
  const locales = new Set(data.languages.map((l) => l.name));
  // Grupperet pr. startside: "af alle klik videre fra X gik n til Y".
  const groups = new Map<string, { total: number; rows: StatsData["flow"] }>();
  for (const f of data.flow) {
    const g = groups.get(f.from) ?? { total: 0, rows: [] };
    g.total += f.count;
    g.rows.push(f);
    groups.set(f.from, g);
  }
  const body = groups.size
    ? [...groups.entries()]
        .sort((a, b) => b[1].total - a[1].total)
        .map(([from, g]) => {
          const rows = g.rows
            .sort((a, b) => b.count - a.count)
            .map((f) => {
              const pct = Math.round((f.count / g.total) * 100);
              return `<li><span class="k">→ ${flow_label(f.to, locales)}</span><span class="bar" style="--w:${pct}%"></span><span class="v">${fmt(f.count)} · ${pct}%</span></li>`;
            })
            .join("");
          return `<div class="fg"><h3><span class="k">Fra ${flow_label(from, locales)}</span><span class="v">${fmt(g.total)} klik videre</span></h3><ul>${rows}</ul></div>`;
        })
        .join("")
    : `<ul><li class="empty">Ingen intern navigation endnu.</li></ul>`;
  return `<section class="card full"><h2>Flow — hvor de klikker videre</h2>${body}</section>`;
}

// Groft skøn ud fra netværkets navn: hosting/servere er næsten altid robotter.
// Kendte datacentre er allerede filtreret fra i query.ts; dette fanger resten.
const HOSTING =
  /server|hosting|cloud|data ?(center|services|camp)|vps|infrastructure|m247|logicweb|netlabs|palo alto|digitalocean|amazon|google|microsoft|ovh|hetzner|linode|akamai|vultr|alibaba|oracle/i;

function network_list(title: string, rows: StatsData["networks"], empty: string): string {
  const items = rows.length
    ? rows
        .map(
          (n) =>
            `<li><span class="k">${esc(n.name)} <span class="asn">AS${esc(n.asn)}</span></span><span class="v">${fmt(n.count)} · ${fmt(n.visitors)} pers.</span></li>`,
        )
        .join("")
    : `<li class="empty">${esc(empty)}</li>`;
  return `<section class="card"><h2>${esc(title)}</h2><ul>${items}</ul></section>`;
}

const TIME = new Intl.DateTimeFormat("da-DK", {
  timeZone: "Europe/Copenhagen",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

// AE-tider er UTC uden zone ("2026-11-18 20:46:28").
function local_time(ts: string): string {
  const d = new Date(`${ts.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? ts : TIME.format(d);
}

function journeys_section(data: StatsData): string {
  const locales = new Set(data.languages.map((l) => l.name));
  const body = data.journeys.length
    ? data.journeys
        .map((j) => {
          const first = j.pages[0];
          const meta = [
            first ? local_time(first.time) : "",
            j.country ? country_name(j.country) : "",
            j.device,
            j.network,
            j.referrer ? `via ${j.referrer}` : "",
          ]
            .filter(Boolean)
            .map(esc)
            .join(" · ");
          const bot = HOSTING.test(j.network) ? ` <span class="tag">robot?</span>` : "";
          const route = j.pages.map((pg) => flow_label(pg.path, locales)).join(` <span class="arrow">→</span> `);
          const n = j.pages.length;
          return `<li class="jr"><div class="jh"><span>${meta}${bot}</span><span class="v">${n} ${n === 1 ? "side" : "sider"}</span></div><div class="route">${route}</div></li>`;
        })
        .join("")
    : `<li class="empty">Ingen besøg endnu.</li>`;
  const n = data.bot_visitors;
  const filtered = n
    ? `<p class="note">${fmt(n)} besøgende, der ligner robotter, er sorteret fra alle tal: flere sider uden et eneste klik (hver side hentet direkte), mindst 3 direkte enkeltsidebesøg fra hver sit netværk inden for et minut, eller mindst 5 “via Google/Bing” fra mindst 4 netværk.</p>`
    : "";
  return `<section class="card full"><h2>Besøg — de seneste ${data.journeys.length || ""} besøgende</h2>${filtered}<ul>${body}</ul></section>`;
}

const DAY = new Intl.DateTimeFormat("da-DK", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
const day_text = (iso: string): string => (iso ? DAY.format(new Date(`${iso}T00:00:00Z`)) : "—");
const days_text = (n: number): string => `${fmt(n)} døgn`;

// Data går gennem tre trin: live i Analytics Engine (ca. 90 dage), arkiveret
// med besøgskode (12 måneder) og anonymiseret (resten, for altid).
function storage_section(data: StatsData): string {
  const s = data.storage;
  if (!s) return "";
  const rows: [string, string][] = [
    ["1. Live statistik (Cloudflare, ca. 90 dage)", `fra ${day_text(s.live_from)}`],
    [
      "2. Arkiv med besøgskode (op til 12 måneder)",
      s.coded_days ? `${days_text(s.coded_days)} · anonymiseres fra ${day_text(s.anonymize_next)}` : "ingen døgn",
    ],
    ["3. Anonymiseret arkiv (besøgskoden slettet)", s.anonymized_days ? days_text(s.anonymized_days) : "ingen døgn endnu"],
    ["Gemt i arkivet", `${fmt(s.archive_views)} sidevisninger · ${day_text(s.archive_first)} – ${day_text(s.archive_last)}`],
    ["Arkivet kørte sidst", s.last_run ? TIME.format(new Date(s.last_run)) : "—"],
  ];
  const items = rows.map(([k, v]) => `<li><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></li>`).join("");
  return `<section class="card full storage"><h2>Datalagring</h2><p class="note">Arkivet henter hvert hele døgn fra den live statistik og gemmer det permanent. Sidevisningerne i arkivet er tal før robotfiltre.</p><ul>${items}</ul></section>`;
}

function range_picker(days: number): string {
  const links = RANGES.map((r) => {
    const active = r === days;
    return `<a class="range${active ? " active" : ""}" href="?d=${r}"${active ? ' aria-current="true"' : ""}>${range_label(r)}</a>`;
  }).join("");
  return `<nav class="ranges" aria-label="Tidsinterval">${links}</nav>`;
}

export function render_dashboard(repo: string, data: StatsData): string {
  const archive_note = data.archive
    ? `<p class="note">Fra det permanente arkiv, til og med i går. Rejser og antal personer pr. netværk findes kun for de seneste 12 måneder.</p>`
    : "";
  const body = data.ok
    ? `
      ${archive_note}
      <div class="stats">
        <div class="stat"><div class="num">${fmt(data.views)}</div><div class="lbl">Sidevisninger</div></div>
        <div class="stat"><div class="num">${data.visitors ? fmt(data.visitors) : "—"}</div><div class="lbl">Unikke besøgende</div></div>
      </div>
      ${render_chart(data.timeseries, data.days)}
      <div class="grid">
        ${list("Mest besøgte sider", data.top_pages, "Ingen data endnu.")}
        ${list("Landingssider", data.entry_pages, "Ingen data endnu.")}
        ${list("Kilder", data.referrers, "Ingen eksterne kilder endnu.")}
        ${list("Enheder", data.devices, "Ingen data endnu.")}
        ${flow_section(data)}
        ${list("Lande", data.countries.map((r) => ({ ...r, name: country_name(r.name) })), "Ingen data endnu.")}
        ${list("Sprog", data.languages, "Ingen data endnu.")}
        ${network_list("Internetudbydere — sandsynligvis mennesker", data.networks.filter((n) => !HOSTING.test(n.name)), "Ingen data endnu.")}
        ${network_list("Servere og hosting — sandsynligvis robotter", data.networks.filter((n) => HOSTING.test(n.name)), "Ingen fundet.")}
        ${journeys_section(data)}
        ${storage_section(data)}
      </div>`
    : `<p class="notice">Kunne ikke hente tallene lige nu. Prøv igen om lidt.</p>`;

  return shell(
    esc(repo),
    `<header class="head"><div class="head-l"><span class="brand">Evi Stats</span><span class="meta">${esc(repo)}</span></div>${range_picker(data.days)}</header>
     ${body}
     <footer class="foot">Cookieless statistik · pseudonyme besøgskoder, der skifter dagligt og slettes efter 12 måneder · IP-adresser gemmes aldrig.</footer>`,
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
.ranges{display:flex;flex-wrap:wrap;gap:.3rem}
.ranges .range{padding:.32rem .7rem;font-size:.85rem;color:var(--mut);text-decoration:none;border:1px solid var(--line);border-radius:8px;white-space:nowrap}
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
.storage li{flex-wrap:wrap;column-gap:1rem;row-gap:.15rem}
.storage .k{white-space:normal}
.storage .v{flex-shrink:1}
.asn{color:var(--mut);font-size:.8rem}
.note{color:var(--mut);font-size:.85rem;margin:0 0 .75rem}
.card li.jr{display:block;padding:.6rem 0}
.jh{display:flex;justify-content:space-between;gap:1rem;color:var(--mut);font-size:.85rem}
.route{margin-top:.2rem;overflow-wrap:anywhere}
.arrow{color:var(--mut)}
.tag{font-size:.75rem;border:1px solid var(--line);border-radius:999px;padding:0 .45rem;margin-left:.3rem}
.card.full{grid-column:1/-1}
.fg+.fg{margin-top:1rem}
.fg h3{display:flex;justify-content:space-between;gap:1rem;margin:0 0 .2rem;font-size:.92rem;font-weight:600}
.fg li{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(3rem,1fr) 5.5rem;align-items:center}
.fg li .k{color:var(--mut)}
.fg li .v{text-align:right}
@media(max-width:640px){.fg li{grid-template-columns:1fr 5.5rem;row-gap:.3rem}.fg li .k{grid-column:1/-1}.fg .k{white-space:normal;overflow-wrap:anywhere}}
.bar{height:6px;border-radius:3px;background:linear-gradient(var(--acc),var(--acc)) 0/var(--w) 100% no-repeat var(--line)}
.notice{background:var(--sf);border:1px solid var(--line);border-radius:12px;padding:1.5rem;color:var(--mut)}
.foot{margin-top:2rem;color:var(--mut);font-size:.82rem;text-align:center}`;
