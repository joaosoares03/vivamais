import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    pool: "threads",
    include: ["tests/mobile/**/*.test.ts", "tests/mobile/**/*.test.tsx"],
  },
});
