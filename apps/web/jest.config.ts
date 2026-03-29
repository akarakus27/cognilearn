import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/__tests__"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^\@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)(spec|test).[jt]s?(x)",
  ],
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
};

export default createJestConfig(config);
