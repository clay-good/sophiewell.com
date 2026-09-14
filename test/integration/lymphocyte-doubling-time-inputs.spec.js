// spec-v1248: an entered invalid ALC must not be described as missing.
import { test, expect } from '@playwright/test';

test('lymphocyte doubling time distinguishes an invalid ALC from a blank', async ({ page }) => {
  await page.goto('/#lymphocyte-doubling-time');

  const earlier = page.locator('#ldt-alc1');
  const result = page.locator('#q-results');

  await earlier.fill('-20');
  await expect(result).toContainText('Earlier absolute lymphocyte count (×10⁹/L) must be greater than 0 and at most 100000. Check the value entered.');

  await earlier.fill('');
  await expect(result).toContainText('Enter an earlier and a later absolute lymphocyte count');
});
