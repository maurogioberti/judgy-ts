import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy/sample-expect-jest",
  aliases: {
    "@judgy/core": "../../packages/core/src/index.ts",
    "@judgy/expect": "../../packages/expect/src/index.ts",
    "@judgy/ollama": "../../packages/ollama/src/index.ts"
  },
  testTimeout: 180000
});
