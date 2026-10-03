// spec-v1501 §3: the poverty-line calculator over a households file, in the browser worker.

import { test, expect } from '@playwright/test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE = join(fileURLToPath(new URL('../fixtures/file-kinds', import.meta.url)), 'households.csv');

test('a households file is screened row by row, with the form answering the columns it lacks', async ({ page }) => {
  await page.goto('/#fpl-percent');
  await page.locator('#fpl-region').selectOption('us');
  await page.locator('#fpl-program').selectOption('current');
  await page.locator('#fpl-year').fill('2026');
  await page.locator('#fpl-upload-file').setInputFiles(FIXTURE);
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  const results = page.locator('#q-results');
  await expect(results).toContainText('2 households of 3 computed. 1 row needs corrected inputs.');
  const table = page.locator('.upload-file-results');
  await expect(table).toContainText('146.4%');
  // Lee's income is blank: refused, not answered with the form's $40,000.
  await expect(table).toContainText('Needs corrected inputs');
  // Alaska's row uses Alaska's guideline: 52,000 / (19,950 + 4 x 7,100) = 107.5%.
  await expect(table).toContainText('107.5%');
});
