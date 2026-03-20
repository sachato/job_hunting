const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
    "<rootDir>/__tests__/utils/",
  ],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "components/**/*.tsx",
    "!components/ui/**",
    "!**/*.d.ts",
  ],
  coverageReporters: ["text", "lcov"],
};

module.exports = createJestConfig(config);
