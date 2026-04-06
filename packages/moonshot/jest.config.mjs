import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy/moonshot",
  aliases: {
    "@judgy/core": "../core/src/index.ts"
  }
});
