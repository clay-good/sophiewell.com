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

test('a patients file is discounted under the hospital policy on the form, each row\'s charges its own', async ({ page }) => {
  await page.goto('/#fap-discount');
  await page.locator('#fd-region').selectOption('us');
  await page.locator('#fd-year').fill('2026');
  await page.locator('#fd-t1l').fill('200');
  await page.locator('#fd-t1d').fill('100');
  await page.locator('#fd-t2l').fill('400');
  await page.locator('#fd-t2d').fill('50');
  await page.locator('#fd-upload-file').setInputFiles(join(DIR, 'fap-patients.csv'));
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  await expect(page.locator('#q-results')).toContainText('2 patients of 3 computed. 1 row needs corrected inputs.');
  const table = page.locator('.upload-file-results');
  await expect(table).toContainText('so the patient owes $0.00 of $20,000.00');
  await expect(table).toContainText('Enter the gross charges in dollars.');
});

test('a scheduled-services file is checked against the Original Medicare lists, a bad state cell refused by name', async ({ page }) => {
  await page.goto('/#medicare-ffs-pa-required');
  await page.locator('#mfpa-setting').selectOption('opd');
  await page.locator('#mfpa-state').selectOption('KS');
  await page.locator('#mfpa-upload-file').setInputFiles(join(DIR, 'scheduled-services.csv'));
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  await expect(page.locator('#q-results')).toContainText('2 services of 3 computed. 1 row needs corrected inputs.');
  const table = page.locator('.upload-file-results');
  await expect(table).toContainText('in TX.');
  await expect(table).toContainText('"Tx." is not one of the choices');
});

test('a households file is run through the premium tax credit estimate, each row its own benchmark', async ({ page }) => {
  await page.goto('/#premium-tax-credit');
  await page.locator('#ptc-region').selectOption('us');
  await page.locator('#ptc-year').fill('2026');
  await page.locator('#ptc-upload-file').setInputFiles(join(DIR, 'ptc-households.csv'));
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  await expect(page.locator('#q-results')).toContainText('2 households of 3 computed. 1 row needs corrected inputs.');
  const table = page.locator('.upload-file-results');
  await expect(table).toContainText('$1,060.33 a month');
  await expect(table).toContainText('$815.21 a month');
  await expect(table).toContainText('Enter the household size in people.');
});

test('a people file is checked for IRMAA, a bare MFS refused with what to write instead', async ({ page }) => {
  await page.goto('/#irmaa');
  await page.locator('#irm-year').fill('2026');
  await page.locator('#irm-upload-file').setInputFiles(join(DIR, 'irmaa-people.csv'));
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  await expect(page.locator('#q-results')).toContainText('2 people of 3 computed. 1 row needs corrected inputs.');
  const table = page.locator('.upload-file-results');
  await expect(table).toContainText('+$81.20 B, +$14.50 D');
  await expect(table).toContainText('write "MFS lived with spouse"');
});
