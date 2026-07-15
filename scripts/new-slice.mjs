#!/usr/bin/env node
// Scaffold et nyt slice: skriver slices/<Name>/index.tsx + mock.ts fra
// skabelon, så React-boilerplaten er ensartet (jf. HeroSimple-mønstret).
//
// Brug:   npm run evi:new-slice SectionFeatures
//
// Modellen laves separat (Type Builder eller `npx prismic slice create`) —
// dette script rører KUN de to React-filer. Skabelonen antager rich-text
// felterne `heading` + `body`; ret efter din models felter. Kør bagefter
// `npm run evi:model` (push → pull → gen types), så typerne matcher.
//
// Overskriver eksisterende filer (så du kan erstatte Prismics default-index) —
// kør ikke oveni et færdigt slice uden at vide det.

import fs from "node:fs";
import path from "node:path";

const raw = process.argv[2];
if (!raw || !/^[A-Z][A-Za-z0-9]+$/.test(raw)) {
  console.error(
    "✗ Angiv et PascalCase-navn, fx:\n    npm run evi:new-slice SectionFeatures",
  );
  process.exit(1);
}

const Name = raw; // PascalCase, fx SectionFeatures
const sliceType = Name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase(); // section_features
const kebab = sliceType.replace(/_/g, "-"); // section-features

const dir = path.join(process.cwd(), "slices", Name);
fs.mkdirSync(dir, { recursive: true });

const indexTsx = `import { type Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

import { EviSection } from "@/src/components/layout/EviSection";
import { EviRow } from "@/src/components/layout/EviRow";
import { EviHeadingGroup } from "@/src/components/typography/EviHeadingGroup";
import {
  resolve_slice_context,
  type EviPageSliceContext,
} from "@/src/lib/prismic/slices";

/**
 * ${Name} — TODO beskriv slicen. Ren Evi-composition (ingen rå Tailwind/JSX).
 * Skabelon antager rich-text felterne \`heading\` + \`body\`; tilføj/ret i Type
 * Builder. resolve_slice_context giver theme/isHero/collapsePadding automatisk
 * (og eagerImages hvis slicen har billeder).
 */
export default function ${Name}({
  slice,
  index,
  context,
}: SliceComponentProps<
  Content.${Name}Slice,
  EviPageSliceContext
>): React.ReactElement | null {
  const { linkResolver } = context;
  const { theme, isHero, collapsePadding } = resolve_slice_context(
    context,
    index,
  );

  return (
    <EviSection
      theme={theme}
      hero={isHero}
      collapsePadding={collapsePadding}
      data-slot="${kebab}"
    >
      <EviRow>
        <EviHeadingGroup
          title={slice.primary.heading}
          description={slice.primary.body}
          linkResolver={linkResolver}
          isHero={isHero}
        />
      </EviRow>
    </EviSection>
  );
}
`;

const mockTs = `// SYNTETISK MOCK-DATA — bruges kun til slice-preview-generering.
// Se R4.7 i regelbogen (memory: project_rulebook.md).

import type { Content } from "@prismicio/client";
import { PERSONA } from "@/src/lib/preview/persona";
import type { EviPageSliceContext } from "@/src/lib/prismic/slices";

// Mock ejer sin egen preview-context.
export const context: EviPageSliceContext = {
  linkResolver: () => "/",
  sliceContexts: [{ theme: "light", isHero: false, collapsePadding: false }],
};

export const mock: Record<string, Content.${Name}Slice> = {
  default: {
    id: "mock-${sliceType}-default",
    slice_type: "${sliceType}",
    slice_label: null,
    variation: "default",
    version: "scaffold",
    items: [],
    primary: {
      heading: [
        { type: "heading2", text: PERSONA.brand, spans: [], direction: "ltr" },
      ],
      body: [
        {
          type: "paragraph",
          text: PERSONA.tagline,
          spans: [],
          direction: "ltr",
        },
      ],
    },
  },
};
`;

for (const [file, content] of [
  ["index.tsx", indexTsx],
  ["mock.ts", mockTs],
]) {
  const target = path.join(dir, file);
  const existed = fs.existsSync(target);
  fs.writeFileSync(target, content);
  console.log(`${existed ? "↻ overskrev" : "✓ oprettede"}  slices/${Name}/${file}`);
}

console.log(`
Næste skridt:
  1. Lav modellen (Type Builder på prismic.io, eller \`npx prismic slice create ${Name}\`)
     med mindst rich-text felterne 'heading' + 'body' — ellers ret skabelonen.
  2. Forbind slicen til en type: \`npx prismic slice connect ${sliceType} --to page\`
  3. \`npm run evi:model\`   (push → pull → gen types)
  4. Preview: \`npm run evi:preview-slices\`
`);
