import { test, expect } from '@playwright/test';
test('trace', async ({ page }) => {
  await page.addInitScript(() => { globalThis.__TRACE = []; });
  for (const id of ['sartorius-hs', 'katagiri']) {
    await page.goto(`/#${id}`);
    await page.waitForSelector('#tool-body [aria-live]');
    await page.waitForTimeout(500);
    console.log(id, JSON.stringify(await page.evaluate(() => globalThis.__TRACE), null, 1));
    await page.evaluate(() => { globalThis.__TRACE = []; });
  }
  expect(true).toBe(true);
});
