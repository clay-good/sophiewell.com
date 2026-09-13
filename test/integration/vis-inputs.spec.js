// spec-v1247: a negative infusion rate must not reduce the displayed
// vasoactive-support score.
import { test, expect } from '@playwright/test';

test('VIS refuses a negative infusion and keeps zero as no drip', async ({ page }) => {
  await page.goto('/#vis');

  const dopamine = page.locator('#vs-dop');
  const result = page.locator('#q-results');

  await dopamine.fill('-5');
  await expect(result).toContainText('Dopamine dose cannot be negative. Check the value entered.');

  for (const id of ['vs-dop', 'vs-dob', 'vs-epi', 'vs-ne', 'vs-mil', 'vs-vaso']) {
    await page.locator(`#${id}`).fill('0');
  }
  await expect(result).toContainText('VIS: 0.0');
  await expect(result).toContainText('low vasoactive load');
});
