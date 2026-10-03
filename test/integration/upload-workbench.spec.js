// spec-v1501 §3: a real module Worker parses local fills and the reader confirms
// the proposed columns before the existing PDC compute runs.
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expectNoHScroll } from '../lib/no-hscroll.js';

test('PDC file intake maps synonyms and matches the existing compute path', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url());
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#pdc-star');
  await page.locator('#ps-year').fill('2026');
  await page.locator('#ps-upload-file').setInputFiles({
    name: 'fills.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'member name,star measure,dispense date,supply days,drug ingredient',
      '"Smith, Ann",D10,2026-01-05,30,atorvastatin',
      '"Smith, Ann",D10,2026-02-10,30,atorvastatin',
    ].join('\n')),
  });

  await expect(page.getByText('Review the proposed columns, then use the rows.')).toBeVisible();
  await expect(page.locator('#ps-upload-map-patient')).toHaveValue('0');
  await expect(page.locator('#ps-upload-map-ingredient')).toHaveValue('4');
  const confirm = page.getByRole('button', { name: 'Use 2 rows' });
  const confirmBox = await confirm.boundingBox();
  expect(confirmBox.height).toBeGreaterThanOrEqual(44);
  await expectNoHScroll(page, 'upload-workbench');
  await confirm.click();

  await expect(page.locator('#ps-upload-status')).toContainText('2 rows are in use');
  await expect(page.locator('#q-results')).toContainText('D10 (statins): 0 of 1 adherent');
  await expect(page.locator('#q-results')).toContainText('Smith, Ann');
  await expect(page.locator('.upload-file-results')).toContainText('Showing all 2 rows.');
  await expect(page.locator('.upload-file-results th')).toContainText(['member name', 'star measure', 'dispense date', 'supply days', 'drug ingredient', 'sophiewell_pdc_percent', 'sophiewell_in_denominator', 'sophiewell_reason']);
  await expectNoHScroll(page, 'upload-workbench');

  const fullDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download results CSV' }).click();
  const fullDownload = await fullDownloadPromise;
  expect(fullDownload.suggestedFilename()).toBe('fills-pdc-star-results.csv');
  const fullCsv = await readFile(await fullDownload.path(), 'utf8');
  expect(fullCsv).toContain('"Smith, Ann",D10,2026-01-05,30,atorvastatin');
  expect(fullCsv).toContain('sophiewell_pdc_percent');

  const redactedDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const redactedDownload = await redactedDownloadPromise;
  expect(redactedDownload.suggestedFilename()).toBe('fills-pdc-star-redacted-results.csv');
  const redactedCsv = await readFile(await redactedDownload.path(), 'utf8');
  expect(redactedCsv).not.toContain('Smith, Ann');
  expect(redactedCsv).toContain('[REDACTED]');
  expect(redactedCsv).toContain('atorvastatin');

  await page.locator('#ps-year').fill('2025');
  await expect(page.locator('#q-results')).toContainText('No fill falls in the measurement year.');
  await page.locator('#ps-year').fill('2026');
  await expect(page.locator('#q-results')).toContainText('D10 (statins): 0 of 1 adherent');

  await page.locator('#ps-fills').fill('Bo, D10, 2026-01-01, 30, rosuvastatin');
  await expect(page.locator('#ps-upload-status')).toHaveText('Using the fills entered above.');
  await expect(page.locator('#q-results')).toContainText('fewer than 2 fills');
  expect(offOrigin).toEqual([]);
});

test('required columns block a file until the reader maps them', async ({ page }) => {
  await page.goto('/#pdc-star');
  const originalResult = await page.locator('#q-results').textContent();
  await page.locator('#ps-upload-file').setInputFiles({
    name: 'incomplete.tsv',
    mimeType: 'text/tab-separated-values',
    buffer: Buffer.from('patient\tmeasure\tfill_date\tdays_supply\nAnn\tD10\t2026-01-05\t30'),
  });

  await expect(page.locator('#ps-upload-status')).toContainText('Choose file columns for: Ingredient');
  await page.getByRole('button', { name: 'Use 1 rows' }).click();
  await expect(page.locator('#ps-upload-status')).toHaveText('Choose a column for Ingredient.');
  await expect(page.locator('#q-results')).toHaveText(originalResult);
});

test('MPR computes a mapped fill file in the Worker', async ({ page }) => {
  await page.goto('/#mpr-gap-days');
  await page.locator('#mpr-end').fill('2026-04-30');
  await page.locator('#mpr-upload-file').setInputFiles({
    name: 'fills.csv', mimeType: 'text/csv',
    buffer: Buffer.from('dispense date,supply days\n2026-01-01,30\n2026-03-01,30'),
  });
  await page.getByRole('button', { name: 'Use 2 rows' }).click();
  await expect(page.locator('#mpr-upload-status')).toContainText('2 rows are in use');
  await expect(page.locator('#q-results')).toContainText('PDC 50%');
  await expect(page.locator('.upload-file-results')).toContainText('sophiewell_mpr_percent');
});

test('medication synchronization computes mapped medication rows in the Worker', async ({ page }) => {
  await page.goto('/#med-sync-plan');
  await page.locator('#sync-upload-file').setInputFiles({
    name: 'medications.tsv', mimeType: 'text/tab-separated-values',
    buffer: Buffer.from([
      'drug name\tlast dispense date\tsupply days\tdaily units',
      'lisinopril 10 mg\t2026-09-20\t30\t1',
      'atorvastatin 40 mg\t2026-09-28\t30\t1',
    ].join('\n')),
  });
  await page.getByRole('button', { name: 'Use 2 rows' }).click();
  await expect(page.locator('#sync-upload-status')).toContainText('2 rows are in use');
  await expect(page.locator('#q-results')).toContainText('Sync date October 28, 2026');
  await expect(page.locator('.upload-file-results')).toContainText('sophiewell_short_fill_units');
});

test('adherence outreach appends reachability results to mapped fill rows', async ({ page }) => {
  await page.goto('/#adherence-outreach-list');
  await page.locator('#ao-year').fill('2026');
  await page.locator('#ao-asof').fill('2026-02-15');
  await page.locator('#ao-upload-file').setInputFiles({
    name: 'outreach.csv', mimeType: 'text/csv',
    buffer: Buffer.from([
      'patient,measure,fill date,days supply,ingredient',
      'Ann,D10,2026-01-01,30,atorvastatin',
      'Ann,D10,2026-02-01,30,atorvastatin',
    ].join('\n')),
  });
  await page.getByRole('button', { name: 'Use 2 rows' }).click();
  await expect(page.locator('#ao-upload-status')).toContainText('2 rows are in use');
  await expect(page.locator('.upload-file-results')).toContainText('sophiewell_can_reach_80_percent');
  await expect(page.locator('.upload-file-results tbody tr').first()).toContainText('true');
});

test('340B patient check runs every mapped row through the form calculation', async ({ page }) => {
  await page.goto('/#340b-patient-check');
  await page.locator('#pc3-upload-file').setInputFiles({
    name: 'patients.csv', mimeType: 'text/csv',
    buffer: Buffer.from([
      'patient id,entity type,keeps records,eligible prescriber,grant scope,dispensing only',
      'A,hospital,yes,yes,,no',
      'B,grantee,yes,no,yes,no',
      'C,grantee,yes,yes,,no',
    ].join('\n')),
  });
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  await expect(page.locator('#pc3-upload-status')).toContainText('3 rows are in use');
  await expect(page.locator('#q-results')).toContainText('1 of 3 rows meets the 340B patient definition. 1 row needs corrected inputs.');
  await expect(page.locator('.upload-file-results tbody tr')).toHaveCount(3);
  await expect(page.locator('.upload-file-results tbody tr').nth(0)).toContainText('true');
  await expect(page.locator('.upload-file-results tbody tr').nth(1)).toContainText('false');
  await expect(page.locator('.upload-file-results tbody tr').nth(2)).toContainText('Choose whether the care is within the scope of the grant.');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const download = await downloadPromise;
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).not.toContain('\r\nA,hospital');
  expect(csv).toContain('[REDACTED],hospital');

  await page.locator('#pc3-entity').selectOption('hospital');
  await expect(page.locator('#pc3-upload-status')).toHaveText('Using the answers entered above.');
});
