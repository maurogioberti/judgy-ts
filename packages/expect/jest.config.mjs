import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy/expect",
  aliases: {
    "@judgy/core": "../core/src/index.ts"
  }
});
