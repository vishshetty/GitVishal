import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'results/playwright-report', open: 'never' }],
    ['json', { outputFile: 'results/test-results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://app.vwo.com',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    navigationTimeout: 60000,
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
