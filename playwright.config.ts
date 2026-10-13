import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    launchOptions: process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {},
  },
  reporter: "list",
});
