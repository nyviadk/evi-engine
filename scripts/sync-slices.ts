import fs from "fs";
import path from "path";
import { Command } from "commander";
import pLimit from "p-limit";
import chalk from "chalk";
import ora from "ora";
import { mock_kv_data, TenantConfig } from "@/src/lib/kv/tenants";

// Vi importerer din mock data direkte til scriptet
// (I produktion ville dette være et kald til Cloudflare KV)

const API_BASE = "https://customtypes.prismic.io";
const MAX_CONCURRENCY = 1;

interface LocalResource {
  id: string;
  data: any;
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

  private async apiCall(
    path: string,
    method: "GET" | "POST" = "GET",
    body?: any,
  ) {
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
      const remoteSlices = await this.apiCall("/slices");
      const remoteTypes = await this.apiCall("/customtypes");

      const existingSliceIds = remoteSlices.map((s: any) => s.id);
      const existingTypeIds = remoteTypes.map((t: any) => t.id);

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
    .option("--all", "Sync alle kunder fra KV data")
    .option("--target <repo>", "Sync en specifik kunde-repo")
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

  // RETTELSE HER: Vi trækker BÅDE domænet (nøglen) og indstillingerne (værdien) ud!
  const tenants = Object.entries(mock_kv_data).map(([hostname, config]) => ({
    hostname,
    ...config,
  }));

  const targetRepos = options.target
    ? tenants.filter((t) => t.repo === options.target)
    : tenants;

  if (targetRepos.length === 0) {
    console.log(
      chalk.yellow(
        "⚠️ Ingen kunder fundet i databasen der matcher din søgning.",
      ),
    );
    return;
  }

  const localSlices = ResourceManager.getSlices();
  const localTypes = ResourceManager.getCustomTypes();

  console.log(chalk.blue.bold(`\nEvi Sync Engine 🚀`));
  console.log(chalk.gray(`Database kilde: src/lib/kv/tenants.ts`));
  console.log(
    chalk.gray(
      `Fundet lokalt: ${localSlices.length} slices og ${localTypes.length} custom types.\n`,
    ),
  );

  const limit = pLimit(MAX_CONCURRENCY);

  const tasks = targetRepos.map((tenant) => {
    return limit(async () => {
      const client = new PrismicSyncClient(
        tenant.repo,
        tenant.prismic_write_api_token,
      );
      try {
        await client.sync(localSlices, localTypes, !!options.dryRun);
        // Vi gemmer hostname til vores succes-rapport
        return { hostname: tenant.hostname, repo: tenant.repo, success: true };
      } catch (error: any) {
        // Vi gemmer hostname til vores fejl-rapport
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
  console.log(`Forsøgt: ${targetRepos.length} kunder`);

  if (successful.length > 0) {
    console.log(chalk.green(`✅ Succes: ${successful.length}`));
  }

  if (failed.length > 0) {
    console.log(chalk.red(`❌ Fejlede: ${failed.length}\n`));
    console.log(chalk.red.bold("Detaljer om fejl:"));
    failed.forEach((f) => {
      // RETTELSE HER: Udskriver domænet i klammerne og repo-navnet i parentes
      console.log(
        chalk.red(` - [${f.hostname}] (Repo: ${f.repo}): ${f.error}`),
      );
    });
  } else {
    console.log(chalk.green.bold("\n🚀 Alt gik perfekt! Ingen fejl."));
  }

  console.log("\n");
}

main();
