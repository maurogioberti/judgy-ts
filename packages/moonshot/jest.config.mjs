import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy-ts/moonshot",
  aliases: {
    "@judgy-ts/core": "../core/src/index.ts"
  }
});
