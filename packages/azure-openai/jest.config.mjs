import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy-ts/azure-openai",
  aliases: {
    "@judgy-ts/core": "../core/src/index.ts"
  }
});
