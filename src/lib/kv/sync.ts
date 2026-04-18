import * as prismic from "@prismicio/client";
import { createTenantClient } from "@/prismicio";
import {
  find_hostnames_by_repo,
  get_tenant_config,
  put_tenant_config,
  type TenantConfig,
} from "@/src/lib/kv/tenants";

type SyncStatus = "updated" | "unchanged" | "failed";

type SyncedFields = Pick<
  TenantConfig,
  "locales" | "default_locale" | "force_lang_prefix" | "redirects"
>;

export interface SyncSummary {
  repo: string;
  hostnames_checked: number;
  updated: string[];
  unchanged: string[];
  failed: string[];
  duration_ms: number;
}

export async function sync_tenants_for_repo(
  repo: string,
): Promise<SyncSummary> {
  const started = Date.now();
  const hostnames = await find_hostnames_by_repo(repo);

  const updated: string[] = [];
  const unchanged: string[] = [];
  const failed: string[] = [];

  for (const host of hostnames) {
    const status = await sync_one_tenant(host);
    if (status === "updated") updated.push(host);
    else if (status === "unchanged") unchanged.push(host);
    else failed.push(host);
  }

  return {
    repo,
    hostnames_checked: hostnames.length,
    updated,
    unchanged,
    failed,
    duration_ms: Date.now() - started,
  };
}

export async function sync_one_tenant(hostname: string): Promise<SyncStatus> {
  const existing = await get_tenant_config(hostname);
  if (!existing || !existing.repo || !existing.prismic_token) {
    console.warn(
      `[sync] ${hostname}: missing bootstrap fields (repo/prismic_token), skipping`,
    );
    return "failed";
  }

  try {
    const next_synced = await fetch_synced_fields_from_prismic(existing);
    const next_hash = await compute_synced_hash(next_synced);

    if (next_hash === existing.synced_hash) {
      return "unchanged";
    }

    const next_config: TenantConfig = {
      ...existing,
      ...next_synced,
      synced_hash: next_hash,
    };
    await put_tenant_config(hostname, next_config);
    return "updated";
  } catch (err) {
    console.error(`[sync] ${hostname}: failed`, err);
    return "failed";
  }
}

async function fetch_synced_fields_from_prismic(
  tenant: TenantConfig,
): Promise<SyncedFields> {
  // Sync skal ALDRIG læse fra cache — ellers risikerer vi at sammenligne
  // hash mod stale settings og konkludere "unchanged" når brugeren lige
  // har publiceret nye redirects. revalidateTag kaldes først EFTER sync,
  // så force-cache fra default-klienten ville give os gammel data.
  const client = createTenantClient(tenant, {
    fetchOptions: { cache: "no-store" },
  });

  const repository = await client.getRepository();
  const languages = repository.languages ?? [];
  const locales = languages.map((l) => l.id.toLowerCase());
  const default_locale =
    locales[0] ?? tenant.default_locale ?? tenant.locales[0] ?? "da-dk";

  // settings-dokumentet lever i master-locale — det kan være ændret siden
  // sidste sync, så vi bruger det friske default_locale vi netop har hentet.
  const settings = await client
    .getSingle("settings", { lang: default_locale })
    .catch(() => null);

  const data = settings?.data as
    | {
        force_lang_prefix?: boolean;
        redirects?: Array<{
          from_url?: string | null;
          to_url?: string | null;
          redirect_type?: string | null;
        }>;
      }
    | undefined;

  const force_lang_prefix = data?.force_lang_prefix === true;
  const redirects = map_redirects(data?.redirects);

  return { locales, default_locale, force_lang_prefix, redirects };
}

function map_redirects(
  rows: Array<{
    from_url?: string | null;
    to_url?: string | null;
    redirect_type?: string | null;
  }> | undefined,
): TenantConfig["redirects"] {
  const out: TenantConfig["redirects"] = {};
  if (!rows) return out;
  for (const row of rows) {
    if (!prismic.isFilled.keyText(row.from_url)) continue;
    if (!prismic.isFilled.keyText(row.to_url)) continue;
    const type: 301 | 307 = row.redirect_type?.startsWith("301") ? 301 : 307;
    out[row.from_url] = { destination: row.to_url, type };
  }
  return out;
}

export async function compute_synced_hash(
  fields: SyncedFields,
): Promise<string> {
  const canonical = stable_stringify(fields);
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function stable_stringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stable_stringify).join(",")}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const parts = keys.map(
    (k) =>
      `${JSON.stringify(k)}:${stable_stringify(
        (value as Record<string, unknown>)[k],
      )}`,
  );
  return `{${parts.join(",")}}`;
}
