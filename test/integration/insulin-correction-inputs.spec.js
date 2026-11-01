// spec-v1245: optional meal inputs must remain distinguishable from invalid or
// sub-display-precision values at the browser boundary.
import { test, expect } from '@playwright/test';

test('insulin correction distinguishes blank, invalid, and tiny meal coverage', async ({ page }) => {
  await page.goto('/#insulin-correction');

  const carbs = page.locator('#ic-carbs');
  const icr = page.locator('#ic-icr');
  const result = page.locator('#q-results');

  await carbs.fill('-60');
  await expect(result).toContainText('carbs must be zero or more');

  await carbs.fill('60');
  await icr.fill('999999');
  await expect(result).toContainText('entered carbohydrate coverage is greater than 0 U but below the 0.1 U display precision');

  // The stat grid prints the value above its label, so read the cell, not an
  // inline "label: value" string.
  const mealCoverage = result.locator('.stat').filter({ hasText: 'Meal coverage' }).locator('.stat-value');
  await carbs.fill('');
  await expect(mealCoverage).toHaveText('0 U');
  await expect(result).not.toContainText('provide a positive insulin-to-carb ratio');
});
