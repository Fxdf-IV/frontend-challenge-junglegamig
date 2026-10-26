/** Configura os cenários E2E em Chromium para desktop e viewport mobile. */
import { defineConfig } from "@playwright/test";
import process from "node:process";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    channel: (process.env.PLAYWRIGHT_CHANNEL as "chrome" | undefined) ?? undefined,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile-chromium",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: process.env.PLAYWRIGHT_PREVIEW
      ? "bun run preview -- --host 127.0.0.1 --port 4174"
      : "bun run dev -- --host 127.0.0.1 --port 4174",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
    env: { VITE_ENABLE_MOCKS: "true", VITE_SHOW_MOCK_PANEL: "true" },
  },
});
