import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// Carga .env.local igual que Next.js (necesario para las claves de Clerk)
loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      // Sin sesión: incluye la comprobación de redirección a /sign-in
      name: "public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /public\.spec\.ts/,
    },
    {
      // Con la sesión guardada por el proyecto "setup"
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /create-companion\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
