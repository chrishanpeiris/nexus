import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:  './e2e',
  timeout:  30_000,
  retries:  process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL:       'http://localhost:3000',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Start dev server automatically before E2E tests
  webServer: {
    command:           'npm run dev',
    url:               'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout:           60_000,
  },
});
