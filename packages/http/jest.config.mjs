import { createProjectConfig } from "../../jest.project-config.mjs";

export default createProjectConfig({
  displayName: "@judgy/http",
  aliases: {
    "@judgy/core": "../core/src/index.ts"
  }
});
