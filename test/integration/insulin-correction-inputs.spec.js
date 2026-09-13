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

  await carbs.fill('');
  await expect(result).toContainText('Meal coverage: 0 U');
  await expect(result).not.toContainText('provide a positive insulin-to-carb ratio');
});
