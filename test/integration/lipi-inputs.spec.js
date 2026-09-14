// spec-v1250: LIPI is a ratio, so equivalent shared count units must agree.
import { test, expect } from '@playwright/test';

test('LIPI accepts counts per microliter when both fields use that unit', async ({ page }) => {
  await page.goto('/#lipi');

  await page.locator('#lipi-anc').fill('7000');
  await page.locator('#lipi-wbc').fill('9000');
  await page.locator('#lipi-ldh').check();

  const result = page.locator('#q-results');
  await expect(result).toContainText('Lung Immune Prognostic Index 2');
  await expect(result).toContainText('dNLR 3.5');
});
