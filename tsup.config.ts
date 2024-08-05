import { defineConfig } from "tsup";

export default defineConfig({
  format: ["esm"],
  platform: 'node',
  dts: true,
  splitting: false,
  clean: true,
  entry: ["src/index.ts"],
  // avoid bundling entire libraries
  external: ['tsx'],
});
