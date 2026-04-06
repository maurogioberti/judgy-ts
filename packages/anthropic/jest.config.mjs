import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy/anthropic",
  aliases: {
    "@judgy/core": "../core/src/index.ts"
  }
});
