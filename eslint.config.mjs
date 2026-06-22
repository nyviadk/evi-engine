import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tailwind from "eslint-plugin-tailwindcss";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  basePath: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
      "worker-configuration.d.ts",
      "prismicio-types.d.ts",
      "slices/index.ts",
      "scripts/**",
    ],
  },

  // Next.js — Core Web Vitals + TypeScript. Brings in eslint-plugin-react,
  // react-hooks, jsx-a11y, import, @next/next, and the TS parser/plugin.
  ...compat.extends("next/core-web-vitals", "next/typescript"),

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
      "react/no-array-index-key": "warn",
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
];

export default eslintConfig;
