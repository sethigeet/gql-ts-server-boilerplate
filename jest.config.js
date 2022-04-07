module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "./tests/setup/globalSetup.ts",
  globalTeardown: "./tests/setup/globalTeardown.ts",
  globals: {
    testHost: "",
  },
};
