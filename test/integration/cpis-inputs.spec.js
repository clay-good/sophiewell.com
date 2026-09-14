// spec-v1255: CPIS validates WBC in the per-mm3 unit displayed by the tile.
import { test, expect } from '@playwright/test';

test('CPIS names an impossible leukocyte count and preserves real leukocytosis', async ({ page }) => {
  await page.goto('/#cpis-vap');

  const wbc = page.locator('#cp-wbc');
  const result = page.locator('#q-results');

  await wbc.fill('999999');
  await expect(result).toContainText('Leukocyte count (per mm^3) must be between 0 and 200000');

  await wbc.fill('25000');
  await expect(result).toContainText('CPIS');
  await expect(result).not.toContainText('must be between');
});
