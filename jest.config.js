const dotenv = require("dotenv");
dotenv.config({ path: ".env.development" });

const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "." });

const jestConfig = createJestConfig({
  preset: "ts-jest/presets/default-esm",
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  extensionsToTreatAsEsm: [".ts"],
  testTimeout: 600000,
});

module.exports = jestConfig;
