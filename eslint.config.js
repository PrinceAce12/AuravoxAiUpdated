import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: ["dist/**", "api/**", "node_modules/**", "build/**"]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      ...js.configs.recommended.rules
    }
  },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.{ts,tsx}"]
  })),
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
