import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy/sample-semantic-evaluation",
  aliases: {
    "@judgy/core": "../../packages/core/src/index.ts",
    "@judgy/http": "../../packages/http/src/index.ts",
    "@judgy/ollama": "../../packages/ollama/src/index.ts"
  },
  testTimeout: 180000
});
