const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.js"],
      exclude: ["src/server.js"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 82,
        statements: 85,
      },
    },
  },
});
