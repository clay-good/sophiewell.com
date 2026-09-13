// spec-v1246: an entered negative measurement must not look like an omitted
// optional half of the fractional-excretion suite.
import { test, expect } from '@playwright/test';

test('FENa and FEUrea distinguish a negative measurement from a blank', async ({ page }) => {
  await page.goto('/#fena-feurea');

  const urineUrea = page.locator('#fu-uu');
  const result = page.locator('#q-results');

  await urineUrea.fill('-300');
  await expect(result).toContainText('Urine urea cannot be negative. Check the value entered.');

  await urineUrea.fill('');
  await expect(result).toContainText('FENa: 0.57%');
  await expect(result).toContainText('FEUrea: (incomplete inputs)');
});
