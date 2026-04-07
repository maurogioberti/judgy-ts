import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy-ts/sample-semantic-evaluation",
  aliases: {
    "@judgy-ts/core": "../../packages/core/src/index.ts",
    "@judgy-ts/http": "../../packages/http/src/index.ts",
    "@judgy-ts/ollama": "../../packages/ollama/src/index.ts"
  },
  testTimeout: 180000
});
