// spec-v1501 §3: form tools over a file, in the browser worker.

import { test, expect } from '@playwright/test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../fixtures/file-kinds', import.meta.url));
const FIXTURE = join(DIR, 'households.csv');

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

test('a people file is screened for Extra Help and the Savings Programs, a missing income refused, wages never borrowed from the form', async ({ page }) => {
  await page.goto('/#extra-help-msp-screen');
  await page.locator('#msp-region').selectOption('us');
  await page.locator('#msp-year').fill('2026');
  await page.locator('#msp-earned').fill('900');
  await page.locator('#msp-upload-file').setInputFiles(join(DIR, 'medicare-people.csv'));
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  await expect(page.locator('#q-results')).toContainText('2 people of 3 computed. 1 row needs corrected inputs.');
  const table = page.locator('.upload-file-results');
  // Adams has no wages in the file: counted income is $1,180.00 (the $20 general exclusion), not the form's $900 of wages.
  await expect(table).toContainText('counted income $1,180.00 a month');
  await expect(table).toContainText('Enter the monthly unearned income');
});
