import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('340B matcher maps four local files, explains decisions and redacts downloads', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url());
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#340b-rx-match');
  await page.locator('#rxm-entity').selectOption('cah');
  await page.locator('#rxm-lookback').fill('30');
  await page.locator('#rxm-referral').selectOption('no');

  const files = [
    ['prescriptions', 'rx.csv', [
      'patient id,rx prescriber npi,drug ndc,dispense date,pharmacy name,orphan designation',
      'A-001,1234567890,00011-2222-33,2026-09-28,Main,no',
      'B-002,1234567890,00011-4444-55,2026-09-28,West,yes',
    ]],
    ['encounters', 'visits.tsv', [
      'patient id\tvisit date\tclinic\tencounter provider npi',
      'A-001\t2026-09-01\tClinic A\t1234567890',
      'B-002\t2026-09-01\tClinic A\t1234567890',
    ]],
    ['prescribers', 'prescribers.csv', ['prescriber npi,arrangement', '1234567890,employed']],
    ['sites', 'sites.csv', ['site name', 'Clinic A']],
  ];
  for (const [dataset, name, lines] of files) {
    await page.locator(`#rxm-${dataset}-file`).setInputFiles({ name, mimeType: name.endsWith('.tsv') ? 'text/tab-separated-values' : 'text/csv', buffer: Buffer.from(lines.join('\n')) });
    await expect(page.locator(`#rxm-${dataset}-status`)).toContainText('Review the proposed columns');
    const useRows = page.getByRole('button', { name: new RegExp(`Use \\d+ ${dataset} rows`) });
    if (dataset === 'prescriptions') {
      await page.locator('#rxm-prescriptions-map-patient_reference').selectOption('');
      await useRows.click();
      await expect(page.locator('#rxm-status')).toContainText('Patient reference');
      await page.locator('#rxm-prescriptions-map-patient_reference').selectOption('0');
    }
    await useRows.click();
    await expect(page.locator(`#rxm-${dataset}-status`)).toContainText('rows are in use');
  }

  await expect(page.locator('#rxm-status')).toHaveText('All four files are ready.');
  await expect(page.locator('#rxm-results')).toContainText('1 of 2 prescriptions matched (50%).');
  await expect(page.locator('#rxm-results')).toContainText('Orphan-designated drug excluded for this covered entity type.');
  await expect(page.locator('#rxm-results')).toContainText('Match rate by pharmacy');
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('rx-340b-rx-match-redacted-results.csv');
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).not.toContain('A-001');
  expect(csv).not.toContain('B-002');
  expect(csv).toContain('[REDACTED]');
  expect(csv).toContain('Matched to an eligible encounter.');
  expect(offOrigin).toEqual([]);
});
