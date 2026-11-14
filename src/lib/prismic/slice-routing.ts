export type SlicePrefixes = Readonly<Record<string, string>>;

export interface ModelResource {
  id: string;
  data: unknown;
}

export interface RepoModels {
  slices: ModelResource[];
  custom_types: ModelResource[];
}

type JsonObject = Record<string, unknown>;

function is_object(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

export function owner_prefix(
  id: string,
  prefixes: SlicePrefixes,
): string | undefined {
  return Object.keys(prefixes).find((prefix) => id.startsWith(prefix));
}

function belongs_to_repo(
  id: string,
  repo: string,
  prefixes: SlicePrefixes,
  dev_repo: string,
): boolean {
  if (repo === dev_repo) return true;
  const prefix = owner_prefix(id, prefixes);
  return prefix === undefined || prefixes[prefix] === repo;
}

// Uden oprydning peger fx page-typens slice-zone på slices, repoet ikke har.
// Kopierer, fordi de samme modeller genbruges for hver tenant.
function strip_slice_choices(
  custom_type: unknown,
  keep: (id: string) => boolean,
): unknown {
  const copy = structuredClone(custom_type);
  if (!is_object(copy) || !is_object(copy.json)) return copy;
  for (const tab of Object.values(copy.json)) {
    if (!is_object(tab)) continue;
    for (const field of Object.values(tab)) {
      if (!is_object(field) || field.type !== "Slices") continue;
      if (!is_object(field.config) || !is_object(field.config.choices)) continue;
      field.config.choices = Object.fromEntries(
        Object.entries(field.config.choices).filter(([id]) => keep(id)),
      );
    }
  }
  return copy;
}

export function models_for_repo(
  repo: string,
  models: RepoModels,
  routing: { prefixes: SlicePrefixes; dev_repo: string },
): RepoModels {
  const keep = (id: string) =>
    belongs_to_repo(id, repo, routing.prefixes, routing.dev_repo);
  return {
    slices: models.slices.filter((slice) => keep(slice.id)),
    custom_types: models.custom_types
      .filter((custom_type) => keep(custom_type.id))
      .map((custom_type) => ({
        ...custom_type,
        data: strip_slice_choices(custom_type.data, keep),
      })),
  };
}
