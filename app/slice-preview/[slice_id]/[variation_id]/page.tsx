import { notFound } from "next/navigation";

/**
 * DEV-ONLY slice preview route for scripts/preview-slices.mjs automation.
 * Playwright navigates here, screenshots the [data-testid="preview-target"]
 * element (tight crop — no viewport padding).
 *
 * Dynamic imports: slice_id (snake_case) is mapped to folder name (PascalCase).
 * Any slice that has `slices/<Name>/mock.ts` exporting `mock` (+ optionally
 * `context`) is auto-discoverable. Adding a new slice requires zero changes
 * to this file — just create the mock file.
 *
 * Guarded on NODE_ENV so route never exposed in production.
 *
 * Frame: light-themed padded container with inline-block width so screenshot
 * hugs the actual slice content. Design tokens (theme-light, bg-evi-light,
 * text-evi-text-on-light) — NOT slice styling. Documented exception to R3
 * for dev-tooling only; the route returns 404 outside `next dev`.
 */

function snake_to_pascal(snake: string): string {
  return snake
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export default async function SlicePreviewPage({
  params,
}: {
  params: Promise<{ slice_id: string; variation_id: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { slice_id, variation_id } = await params;
  const folder = snake_to_pascal(slice_id);

  let Component: React.ComponentType<{
    slice: unknown;
    context?: unknown;
    index: number;
    slices: unknown[];
  }>;
  let slice: unknown;
  let context: unknown;
  let wrapperClassName = "inline-block p-8"; // default: tight crop, padded

  try {
    const [sliceModule, mockModule] = await Promise.all([
      import(`@/slices/${folder}/index`),
      import(`@/slices/${folder}/mock`),
    ]);
    Component = sliceModule.default;
    slice = mockModule.mock?.[variation_id];
    context = mockModule.context ?? {};
    // Optional per-mock override: header-slices bruger `block w-full` fordi
    // deres interne max-w-evi mx-auto ellers ikke kan udvide sig.
    if (mockModule.previewWrapperClassName) {
      wrapperClassName = mockModule.previewWrapperClassName;
    }
  } catch {
    notFound();
  }

  if (!slice) notFound();

  return (
    <div
      data-testid="preview-target"
      className={`theme-light bg-evi-light text-evi-text-on-light ${wrapperClassName}`}
    >
      {/* index=0 + slices=[slice] matcher hvordan @prismicio/react's SliceZone
          kalder komponenten (nødvendigt for page-slices der bruger
          sliceContexts[index]). */}
      <Component slice={slice} context={context} index={0} slices={[slice]} />
    </div>
  );
}
