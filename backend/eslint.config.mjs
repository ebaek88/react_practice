import globals from "globals";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: "latest",
    },
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/linebreak-style": ["error", "unix"],
      eqeqeq: "error",
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "arrow-spacing": ["error", { before: true, after: true }],
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/**"],
  },
]);
