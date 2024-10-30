import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import sapphireEslintConfig from "@sapphire/eslint-config";

const compat = new FlatCompat()

export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.node }},
  ...compat.config(sapphireEslintConfig),
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];