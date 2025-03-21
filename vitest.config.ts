import path from "node:path";
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    alias: [
      {
        find: "src",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    globals: true,
    testTimeout: 60_000,
  },
});
