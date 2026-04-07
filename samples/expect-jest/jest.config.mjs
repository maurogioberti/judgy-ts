import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy-ts/sample-expect-jest",
  aliases: {
    "@judgy-ts/core": "../../packages/core/src/index.ts",
    "@judgy-ts/expect": "../../packages/expect/src/index.ts",
    "@judgy-ts/ollama": "../../packages/ollama/src/index.ts"
  },
  testTimeout: 180000
});
