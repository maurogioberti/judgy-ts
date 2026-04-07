import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy-ts/deepseek",
  aliases: {
    "@judgy-ts/core": "../core/src/index.ts"
  }
});
