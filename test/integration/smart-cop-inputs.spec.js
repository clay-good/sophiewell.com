// spec-v1253: an invalid optional oxygenation measurement must not disappear
// behind another valid member of the PaO2 / SpO2 / P:F trio.
import { test, expect } from '@playwright/test';

test('SMART-COP shows invalid oxygenation values and keeps valid alternatives optional', async ({ page }) => {
  await page.goto('/#smart-cop');

  const pao2 = page.locator('#sc-pao2');
  const result = page.locator('#q-results');

  await pao2.fill('999999');
  await expect(result).toContainText('PaO2 (mmHg) must be between 10 and 700. Check the value entered.');

  await pao2.fill('');
  await expect(result).toContainText('SMART-COP 0: low risk');
});
