import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: false,
  entry: ['src/**/*.ts'],
  format: ['cjs'],
  minify: false,
  skipNodeModulesBundle: true,
  target: 'esnext',
  tsconfig: 'tsconfig.json',
  bundle: false,
  keepNames: true,
  splitting: false,
});
