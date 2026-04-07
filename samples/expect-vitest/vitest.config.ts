import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@judgy/core": fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url)),
      "@judgy/expect": fileURLToPath(new URL("../../packages/expect/src/index.ts", import.meta.url)),
      "@judgy/ollama": fileURLToPath(new URL("../../packages/ollama/src/index.ts", import.meta.url))
    }
  },
  test: {
    environment: "node",
    testTimeout: 180000
  }
});
