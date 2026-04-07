import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy-ts/anthropic",
  aliases: {
    "@judgy-ts/core": "../core/src/index.ts"
  }
});
