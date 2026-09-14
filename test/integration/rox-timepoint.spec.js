// spec-v1256: the page offers exactly the timepoints Roca 2019 published.
import { test, expect } from '@playwright/test';

test('ROX exposes only 2, 6, and 12 hours while preserving omission', async ({ page }) => {
  await page.goto('/#rox');

  const timepoint = page.locator('#rx-hr');
  await expect(timepoint.locator('option')).toHaveText(['Not stated', '2 hours', '6 hours', '12 hours']);
  await timepoint.selectOption('');

  await page.locator('#rx-spo2').fill('90');
  await page.locator('#rx-fio2').fill('0.6');
  await page.locator('#rx-rr').fill('50');
  await expect(page.locator('#q-results')).toContainText('enter the hours since high-flow was started');

  await timepoint.selectOption('2');
  await expect(page.locator('#q-results')).toContainText('indeterminate at 2h');
});
