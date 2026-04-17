import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { Command } from "commander";
import pLimit from "p-limit";
import chalk from "chalk";
import ora from "ora";
import type { TenantConfig, TenantMetadata } from "@/src/lib/kv/tenants";

// Tenants hentes live fra Cloudflare KV via wrangler CLI.
// Ingen lokal mock — kør 'wrangler login' hvis du ikke allerede er autentificeret.

const API_BASE = "https://customtypes.prismic.io";
const MAX_CONCURRENCY = 1;

interface LocalResource {
  id: string;
  data: unknown;
}

interface PrismicResource {
  id: string;
}

interface KVKeyEntry {
  name: string;
  metadata?: TenantMetadata;
  expiration?: number;
}

interface TenantRow extends TenantConfig {
  hostname: string;
}

/**
 * Tenants fra Cloudflare KV (remote) via wrangler CLI.
 * Filtrerer på metadata.repo inden vi fetcher values — så kun relevante
 * hostnames koster et 'get'-kald.
 */
function fetch_tenants_from_kv(target_repos: string[] | null): TenantRow[] {
  const list_spinner = ora("Henter tenants fra Cloudflare KV...").start();

  let raw_list: string;
  try {
    raw_list = execSync(
      "npx wrangler kv key list --binding TENANTS --remote",
      { encoding: "utf-8", cwd: process.cwd() },
    );
  } catch (error: any) {
    list_spinner.fail("Kunne ikke hente KV-liste.");
    throw new Error(
      `wrangler kv key list fejlede: ${error.message}\n` +
        `Er du logget ind? Prøv 'npx wrangler login'.`,
    );
  }

  const entries: KVKeyEntry[] = JSON.parse(raw_list.trim());

  const relevant_entries = target_repos
    ? entries.filter(
        (e) => e.metadata?.repo && target_repos.includes(e.metadata.repo),
      )
    : entries;

  list_spinner.succeed(
    `Fandt ${entries.length} tenants (${relevant_entries.length} matcher filter).`,
  );

  const tenants: TenantRow[] = [];
  for (const entry of relevant_entries) {
    const fetch_spinner = ora(`Henter config for ${entry.name}...`).start();
    try {
      const raw_value = execSync(
        `npx wrangler kv key get "${entry.name}" --binding TENANTS --remote`,
        { encoding: "utf-8", cwd: process.cwd() },
      );
      const config = JSON.parse(raw_value.trim()) as TenantConfig;

      if (!config.repo || !config.prismic_write_api_token) {
        fetch_spinner.warn(
          `${entry.name}: mangler bootstrap-felter (repo/write-token). Springer over.`,
        );
        continue;
      }

      tenants.push({ hostname: entry.name, ...config });
      fetch_spinner.succeed(`${entry.name}: OK (${config.repo})`);
    } catch (error: any) {
      fetch_spinner.fail(`${entry.name}: ${error.message}`);
    }
  }

  return tenants;
}

/**
 * Resource Manager: Læser lokale JSON-filer fra dit projekt
 */
class ResourceManager {
  static getSlices(): LocalResource[] {
    const dir = path.join(process.cwd(), "slices");
    if (!fs.existsSync(dir)) return [];

    return fs
      .readdirSync(dir)
      .map((folder) => {
        const modelPath = path.join(dir, folder, "model.json");
        if (fs.existsSync(modelPath)) {
          const data = JSON.parse(fs.readFileSync(modelPath, "utf-8"));
          return { id: data.id, data };
        }
        return null;
      })
      .filter((item): item is LocalResource => item !== null);
  }

  static getCustomTypes(): LocalResource[] {
    const dir = path.join(process.cwd(), "customtypes");
    if (!fs.existsSync(dir)) return [];

    return fs
      .readdirSync(dir)
      .map((folder) => {
        // Vi tjekker både om det er en fil (gamle versioner)
        // eller en mappe med index.json (Slice Machine standard)
        const filePath = path.join(dir, folder, "index.json");
        const directPath = path.join(dir, folder);

        let data;
        if (fs.existsSync(filePath)) {
          data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } else if (folder.endsWith(".json")) {
          data = JSON.parse(fs.readFileSync(directPath, "utf-8"));
        }

        if (data) return { id: data.id, data };
        return null;
      })
      .filter((item): item is LocalResource => item !== null);
  }
}

/**
 * Prismic Sync Engine (Bruger indbygget fetch - Ingen Axios!)
 */
class PrismicSyncClient {
  constructor(
    private repo: string,
    private token: string,
  ) {}

  private async apiCall<T = unknown>(
    path: string,
    method: "GET" | "POST" = "GET",
    body?: unknown,
  ): Promise<T | null> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        repository: this.repo,
        Authorization: `Bearer ${this.token.trim()}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Prismic API Error (${res.status}): ${errorText}`);
    }

    if (res.status === 204) return null; // No Content
    return res.json();
  }

  async sync(
    slices: LocalResource[],
    customTypes: LocalResource[],
    dryRun: boolean,
  ) {
    const spinner = ora(`Synkroniserer ${chalk.bold(this.repo)}`).start();

    try {
      // 1. Hent nuværende state for at lave "Upsert" (Insert vs Update)
      const remoteSlices =
        (await this.apiCall<PrismicResource[]>("/slices")) ?? [];
      const remoteTypes =
        (await this.apiCall<PrismicResource[]>("/customtypes")) ?? [];

      const existingSliceIds = remoteSlices.map((s) => s.id);
      const existingTypeIds = remoteTypes.map((t) => t.id);

      // 2. Sync Slices først (vigtigt for afhængigheder)
      for (const slice of slices) {
        const isUpdate = existingSliceIds.includes(slice.id);
        const endpoint = isUpdate ? "/slices/update" : "/slices/insert";
        if (!dryRun) await this.apiCall(endpoint, "POST", slice.data);
      }

      // 3. Sync Custom Types bagefter
      for (const ct of customTypes) {
        const isUpdate = existingTypeIds.includes(ct.id);
        const endpoint = isUpdate
          ? "/customtypes/update"
          : "/customtypes/insert";
        if (!dryRun) await this.apiCall(endpoint, "POST", ct.data);
      }

      spinner.succeed(
        `Færdig med ${this.repo}: ${slices.length} slices, ${customTypes.length} typer.`,
      );
    } catch (error: any) {
      spinner.fail(`Fejl i ${this.repo}: ${chalk.red(error.message)}`);
      throw error;
    }
  }
}

/**
 * Main Runner
 */
async function main() {
  const program = new Command();
  program
    .version("1.0.0")
    .option("--all", "Sync alle kunder fra Cloudflare KV")
    .option(
      "--target <repo>",
      "Sync specifikke kunde-repos (adskilt med komma)",
    )
    .option("--dry-run", "Simulering - sender intet")
    .parse(process.argv);

  const options = program.opts();

  if (!options.all && !options.target) {
    console.log(
      chalk.red(
        "❌ Fejl: Du skal vælge enten --all eller --target <repo-navn>",
      ),
    );
    process.exit(1);
  }

  const target_repos: string[] | null = options.target
    ? options.target.split(",").map((s: string) => s.trim())
    : null;

  const tenants = fetch_tenants_from_kv(target_repos);

  if (tenants.length === 0) {
    console.log(
      chalk.yellow(
        "⚠️ Ingen kunder fundet i Cloudflare KV der matcher din søgning.",
      ),
    );
    return;
  }

  const localSlices = ResourceManager.getSlices();
  const localTypes = ResourceManager.getCustomTypes();

  console.log(chalk.blue.bold(`\nEvi Sync Engine 🚀`));
  console.log(chalk.gray(`Database kilde: Cloudflare KV (TENANTS, remote)`));
  console.log(
    chalk.gray(
      `Fundet lokalt: ${localSlices.length} slices og ${localTypes.length} custom types.\n`,
    ),
  );

  const limit = pLimit(MAX_CONCURRENCY);

  const tasks = tenants.map((tenant) => {
    return limit(async () => {
      const client = new PrismicSyncClient(
        tenant.repo,
        tenant.prismic_write_api_token,
      );
      try {
        await client.sync(localSlices, localTypes, !!options.dryRun);
        return { hostname: tenant.hostname, repo: tenant.repo, success: true };
      } catch (error: any) {
        return {
          hostname: tenant.hostname,
          repo: tenant.repo,
          success: false,
          error: error.message,
        };
      }
    });
  });

  const results = await Promise.all(tasks);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(chalk.bold("\n=== Synkronisering Opsummering ==="));
  console.log(`Forsøgt: ${tenants.length} kunder`);

  if (successful.length > 0) {
    console.log(chalk.green(`✅ Succes: ${successful.length}`));
  }

  if (failed.length > 0) {
    console.log(chalk.red(`❌ Fejlede: ${failed.length}\n`));
    console.log(chalk.red.bold("Detaljer om fejl:"));

    const failedRepos = new Set<string>();

    failed.forEach((f) => {
      console.log(
        chalk.red(` - [${f.hostname}] (Repo: ${f.repo}): ${f.error}`),
      );
      failedRepos.add(f.repo);
    });

    console.log(
      chalk.yellow.bold("\n🔄 Kør fejlede repos igen med denne kommando:"),
    );
    const retryTargets = Array.from(failedRepos).join(",");
    const dryRunFlag = options.dryRun ? " --dry-run" : "";
    console.log(
      chalk.cyan(
        `npm run evi:sync-slices -- --target=${retryTargets}${dryRunFlag}\n`,
      ),
    );
  } else {
    console.log(chalk.green.bold("\n🚀 Alt gik perfekt! Ingen fejl.\n"));
  }
}

main();
