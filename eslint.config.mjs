import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";

// ─── Local rule: layout-primitiver skal være Evi-komponenter ────────────────
// Et rå <div className="flex/grid/grid-cols/space-y"> i en slice/domain-part er
// "at bygge et layout i hånden" — det HAR en Evi-komponent (EviStack/AutoGrid/
// Split/Row). Se feedback_no_raw_layout_divs. Bevidst undtagelse suppresses med
// standard `// eslint-disable-next-line evi/no-raw-layout-classes -- <hvorfor>`.

// Base-utility = tokenet efter sidste `:` på bracket-dybde 0 (dropper variant-
// præfikser som md: / @[300px]/imgs: / hover: uden at knække arbitrære []/()-værdier).
function baseUtil(token) {
  let depth = 0;
  let lastColon = -1;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth = Math.max(0, depth - 1);
    else if (c === ":" && depth === 0) lastColon = i;
  }
  let base = token.slice(lastColon + 1);
  if (base.startsWith("!")) base = base.slice(1); // !important-præfiks
  return base;
}

// Kun hand-rolled container-signaler. IKKE inline-flex (ikon-knapper) og IKKE
// col-span-* (den normale måde at placere en Evi-komponent i sektionens 12-col-grid).
function offendingClass(str) {
  for (const token of str.split(/\s+/)) {
    if (!token) continue;
    const base = baseUtil(token);
    if (
      base === "flex" ||
      base === "grid" ||
      base.startsWith("grid-cols-") ||
      base.startsWith("space-y-") ||
      base.startsWith("space-x-")
    ) {
      return token;
    }
  }
  return null;
}

// Saml alle statiske klasse-strenge ud af en className-værdi: literal, template-
// quasis, cn()/clsx()-argumenter, arrays, clsx-objekt-nøgler, ?:/&&-grene.
function collectStrings(node, out) {
  if (!node) return;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") out.push(node.value);
      break;
    case "TemplateLiteral":
      for (const q of node.quasis) out.push(q.value.cooked ?? q.value.raw ?? "");
      for (const e of node.expressions) collectStrings(e, out);
      break;
    case "CallExpression":
      for (const a of node.arguments) collectStrings(a, out);
      break;
    case "ArrayExpression":
      for (const el of node.elements) collectStrings(el, out);
      break;
    case "ObjectExpression":
      for (const pr of node.properties) {
        if (
          pr.type === "Property" &&
          !pr.computed &&
          pr.key.type === "Literal" &&
          typeof pr.key.value === "string"
        ) {
          out.push(pr.key.value);
        }
      }
      break;
    case "ConditionalExpression":
      collectStrings(node.consequent, out);
      collectStrings(node.alternate, out);
      break;
    case "LogicalExpression":
      collectStrings(node.left, out);
      collectStrings(node.right, out);
      break;
    default:
      break;
  }
}

const eviLayoutPlugin = {
  rules: {
    "no-raw-layout-classes": {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Layout-primitiver (flex/grid/grid-cols/space-y) skal være Evi-komponenter, ikke rå divs.",
        },
        schema: [],
        messages: {
          rawLayout:
            'Rå layout-klasse "{{token}}" → brug en Evi-komponent (flex/flex-col→EviStack, grid/grid-cols→EviAutoGrid/EviSplit, space-y→EviStack). Genbrug frem for hand-roll — se feedback_no_raw_layout_divs. Bevidst undtagelse: `// eslint-disable-next-line evi/no-raw-layout-classes -- <hvorfor>`.',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            const name = node.name && node.name.name;
            if (name !== "className" && name !== "class") return;
            const strings = [];
            if (node.value?.type === "Literal") {
              collectStrings(node.value, strings);
            } else if (node.value?.type === "JSXExpressionContainer") {
              collectStrings(node.value.expression, strings);
            }
            for (const s of strings) {
              const token = offendingClass(s);
              if (token) {
                context.report({ node, messageId: "rawLayout", data: { token } });
                return; // én rapport pr. attribut
              }
            }
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Tailwind CSS (v4-compatible). Adds the plugin + recommended rules
  // scoped to JS/TS/JSX/TSX via the plugin's own `files` glob.
  tailwind.configs.recommended,

  // Project-wide rule tuning and plugin settings.
  {
    plugins: { tailwindcss: tailwind },
    settings: {
      react: { version: "detect" },
      tailwindcss: {
        // Tailwind v4 reads tokens from the CSS entry point, not a JS config.
        cssConfigPath: "app/globals.css",
        callees: ["clsx", "cn", "twMerge", "classnames", "cva"],
      },
    },
    rules: {
      // ─── Strict TypeScript ────────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-extraneous-class": "error",
      "@typescript-eslint/no-invalid-void-type": "warn",
      "@typescript-eslint/no-dynamic-delete": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as", objectLiteralTypeAssertions: "allow-as-parameter" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 5,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": [
        "warn",
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],

      // ─── React / Hooks ────────────────────────────────────────────────
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      // Off: vores slice-lister rendres statisk server-side fra Prismic-repeatables
      // og reorderes ALDRIG i runtime (advarslen handler om reordering af stateful
      // lister). Index er derfor et stabilt, korrekt key — og indhold (fx titler)
      // er ikke garanteret unikt. jsx-key (error) fanger stadig MANGLENDE keys.
      "react/no-array-index-key": "off",
      "react/self-closing-comp": "warn",
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      "react/jsx-curly-brace-presence": [
        "warn",
        { props: "never", children: "never" },
      ],
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // ─── Accessibility (jsx-a11y) — practical mix ─────────────────────
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-autofocus": "warn",

      // ─── Tailwind CSS ─────────────────────────────────────────────────
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/enforces-shorthand": "warn",
      "tailwindcss/enforces-negative-arbitrary-values": "warn",
      "tailwindcss/no-unnecessary-arbitrary-value": "warn",
      "tailwindcss/no-contradicting-classname": "error",
      // Off: we use a CSS-first design system (.btn, .evi-prose, .theme-*,
      // .evi-nav-panel, …) declared in app/globals.css.
      "tailwindcss/no-custom-classname": "off",

      // ─── General bug-catching ─────────────────────────────────────────
      "no-debugger": "error",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-alert": "warn",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "warn",
      eqeqeq: ["error", "smart"],
      "no-unused-private-class-members": "error",
      "no-implicit-coercion": "warn",
      "object-shorthand": ["warn", "always"],

      // Konsistens på tværs af layout-parts: læs slice-felter via `const p =
      // slice.primary`, destrukturér ikke `slice.primary` direkte (sibling-
      // parts skal se ens ud).
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "VariableDeclarator[id.type='ObjectPattern'][init.object.name='slice'][init.property.name='primary']",
          message:
            "Destrukturér ikke slice.primary — brug `const p = slice.primary` for konsistens på tværs af layout-parts.",
        },
      ],
    },
  },

  // Config and script files: relax some rules.
  {
    files: ["*.config.{js,mjs,cjs,ts}", "*.config.*.{js,mjs,cjs,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-console": "off",
    },
  },

  // Slice-dispatchere + domain layout-parts: rå layout-`<div>` skal være en Evi-
  // komponent (EviStack/AutoGrid/Split/Row). Primitiverne selv (layout/ui/
  // typography) er UDEN for scope — de ER definitionen af flex/grid. Bevidste
  // undtagelser: `// eslint-disable-next-line evi/no-raw-layout-classes -- <hvorfor>`.
  {
    files: ["slices/**/*.tsx", "src/components/**/parts/**/*.tsx"],
    plugins: { evi: eviLayoutPlugin },
    rules: {
      "evi/no-raw-layout-classes": "error",
    },
  },

  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "cloudflare-env.d.ts",
    "worker-configuration.d.ts",
    "prismicio-types.d.ts",
    "slices/index.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
