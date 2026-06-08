// Playwright configuration. CI-only dev dependency; not used in production.

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'test/integration',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  // Retry in CI only: the Firefox / WebKit engines intermittently exceed the
  // 30s page-load budget under the loaded GitHub-runner (a transient that
  // always clears on rerun — e.g. smoke.spec.js state-persists-across-reload,
  // no-network.spec.js). Two retries absorb that infra flake without masking a
  // real regression, which fails all three attempts. Local runs keep retries
  // at 0 so a genuine flake is visible during development.
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  // Two servers: the SPA at the repo root (4173, the default baseURL every
  // spec uses) and the pre-rendered static build under dist/ (4174), which
  // static-pages-mobile.spec.js sweeps for horizontal scroll. `npm run test:e2e`
  // builds dist/ before Playwright launches, so the dist server has content to
  // serve. The 4174 readiness probe hits /commitments/, which also confirms the
  // directory→index.html resolution the static pages rely on in production.
  webServer: [
    {
      command: 'node scripts/serve.mjs',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'SERVE_ROOT=dist PORT=4174 node scripts/serve.mjs',
      url: 'http://localhost:4174/commitments/',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
