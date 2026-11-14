import test from "node:test";
import assert from "node:assert/strict";
import {
  models_for_repo,
  owner_prefix,
  type ModelResource,
} from "./slice-routing";

const routing = { prefixes: { planio_: "myplanio" }, dev_repo: "evi-engine" };

const page_type = (): ModelResource => ({
  id: "page",
  data: {
    id: "page",
    json: {
      Main: {
        uid: { type: "UID" },
        slices: {
          type: "Slices",
          config: {
            choices: {
              hero: { type: "SharedSlice" },
              planio_day: { type: "SharedSlice" },
            },
          },
        },
      },
    },
  },
});

const local_models = () => ({
  slices: [
    { id: "hero", data: {} },
    { id: "planio_day", data: {} },
  ],
  custom_types: [page_type()],
});

const ids = (resources: ModelResource[]) => resources.map((r) => r.id);

const choice_ids = (custom_type: ModelResource | undefined) =>
  Object.keys(
    (
      custom_type?.data as {
        json: { Main: { slices: { config: { choices: object } } } };
      }
    ).json.Main.slices.config.choices,
  );

test("andre kunder får kun fælles slices, og page-typen mister præfiks-slices", () => {
  const result = models_for_repo("kunde", local_models(), routing);
  assert.deepEqual(ids(result.slices), ["hero"]);
  assert.deepEqual(choice_ids(result.custom_types[0]), ["hero"]);
});

test("præfiksets repo får fælles og egne slices", () => {
  const result = models_for_repo("myplanio", local_models(), routing);
  assert.deepEqual(ids(result.slices), ["hero", "planio_day"]);
  assert.deepEqual(choice_ids(result.custom_types[0]), ["hero", "planio_day"]);
});

test("dev-repoet får alt", () => {
  const result = models_for_repo("evi-engine", local_models(), routing);
  assert.deepEqual(ids(result.slices), ["hero", "planio_day"]);
  assert.deepEqual(choice_ids(result.custom_types[0]), ["hero", "planio_day"]);
});

test("de lokale modeller ændres ikke, så næste kunde får dem hele", () => {
  const models = local_models();
  models_for_repo("kunde", models, routing);
  assert.deepEqual(choice_ids(models.custom_types[0]), ["hero", "planio_day"]);
});

test("custom types med præfiks går kun til præfiksets repo", () => {
  const models = {
    slices: [],
    custom_types: [page_type(), { id: "planio_log", data: {} }],
  };
  assert.deepEqual(ids(models_for_repo("kunde", models, routing).custom_types), [
    "page",
  ]);
  assert.deepEqual(
    ids(models_for_repo("myplanio", models, routing).custom_types),
    ["page", "planio_log"],
  );
});

test("præfikset matcher fra starten af id'et", () => {
  assert.equal(owner_prefix("planio_day", routing.prefixes), "planio_");
  assert.equal(owner_prefix("hero", routing.prefixes), undefined);
});
