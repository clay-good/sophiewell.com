// spec-v1252: an entered invalid optional lipid must not disappear behind the
// other lipid's valid classification branch.
import { test, expect } from '@playwright/test';

test('Simon Broome names an invalid LDL-C while preserving an omitted LDL-C', async ({ page }) => {
  await page.goto('/#simon-broome-fh');

  await page.locator('#sb-tc').fill('8');
  await page.locator('#sb-xanthoma').check();
  const ldl = page.locator('#sb-ldl');
  const result = page.locator('#q-results');

  await ldl.fill('999999');
  await expect(result).toContainText('LDL-C (mmol/L) must be between 0 and 50. Check the value entered.');

  await ldl.fill('');
  await expect(result).toContainText('definite familial hypercholesterolemia');
});
