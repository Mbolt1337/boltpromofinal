import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for BoltPromo E2E tests
 * Docs: https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  testDir: './tests/e2e',

  // Timeout для каждого теста
  timeout: 30 * 1000,

  // Expect timeout
  expect: {
    timeout: 5000
  },

  // Fail fast: остановить после первой ошибки (опционально)
  fullyParallel: true,

  // Retry on CI
  retries: process.env.CI ? 2 : 0,

  // Parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Общие настройки для всех проектов
  use: {
    // Base URL (можно переопределить через env)
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Trace on first retry
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Проекты для разных браузеров
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Dev server (опционально)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
