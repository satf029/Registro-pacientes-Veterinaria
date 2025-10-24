const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
 preset: "ts-jest",
 testEnvironment: "node",
 testMatch: ["**/tests/**/*.test.ts"], // busca tests en carpeta tests
 moduleFileExtensions: ["ts", "js"],
 setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], 
 testPathIgnorePatterns: [
    "/node_modules/",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "json", "html"],
};
