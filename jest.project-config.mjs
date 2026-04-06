/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
}

/**
 * @param {{
 *   displayName: string;
 *   aliases?: Record<string, string>;
 *   testMatch?: string[];
 *   setupFilesAfterEnv?: string[];
 *   testTimeout?: number;
 * }} options
 * @returns {import("jest").Config}
 */
export function createProjectConfig(options) {
  const aliases = Object.fromEntries(
    Object.entries(options.aliases ?? {}).map(([packageName, relativePath]) => [
      `^${escapeRegex(packageName)}$`,
      `<rootDir>/${relativePath.replace(/\\/g, "/")}`
    ])
  );

  return {
    displayName: options.displayName,
    testEnvironment: "node",
    testMatch: options.testMatch ?? ["<rootDir>/test/**/*.test.ts"],
    testPathIgnorePatterns: [
      "/dist/",
      "/node_modules/"
    ],
    moduleFileExtensions: [
      "ts",
      "js",
      "json"
    ],
    extensionsToTreatAsEsm: [
      ".ts"
    ],
    moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.js$": "$1",
      ...aliases
    },
    transform: {
      "^.+\\.ts$": [
        "ts-jest",
        {
          useESM: true,
          tsconfig: "<rootDir>/tsconfig.json"
        }
      ]
    },
    setupFilesAfterEnv: options.setupFilesAfterEnv,
    testTimeout: options.testTimeout
  };
}
