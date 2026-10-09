// spec-v1604 tool 2: rates for named codes out of a CMS sample in-network file, with the Medicare
// amount for a chosen locality. Amounts come from the live fee schedule, which changes quarterly, so the
// test asserts what is priced and how it is labeled, not the dollar figures.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const buffer = readFileSync(join(process.cwd(), 'test', 'fixtures', 'tic-v2.2.1', 'in-network-rates-all-negotiated-types-sample.json'));

test('named codes come back with each professional dollar rate beside Medicare for the locality', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#tic-rate-lookup');
  await page.fill('#trl-codes', '99214, 99285, 12345');
  await expect(page.locator('#trl-locality option')).not.toHaveCount(1);
  await page.locator('#trl-locality').selectOption({ label: 'TX 18: HOUSTON' });
  await page.locator('#trl-files').setInputFiles({ name: 'rates.json', mimeType: 'application/json', buffer });
  const out = page.locator('#q-results');
  await expect(out).toContainText('3 rates for 2 codes across 2 provider groups. The one rate priced against Medicare is ');
  await expect(out).toContainText('physician fee schedule, nonfacility rate, HOUSTON, RVU');
  await expect(out).toContainText('the rate is a percentage, not a dollar amount');
  await expect(out).toContainText('No rates for 12345 in the file.');
  await expect(out.getByRole('button', { name: 'Download the rates CSV' })).toBeVisible();
  await expect(out.locator('details.receipt')).toBeVisible();
  await expectNoHScroll(page, 'tic-rate-lookup');
});

test('without a locality every line says what it needs', async ({ page }) => {
  await page.goto('/#tic-rate-lookup');
  await page.fill('#trl-codes', '99214');
  await page.locator('#trl-files').setInputFiles({ name: 'rates.json', mimeType: 'application/json', buffer });
  await expect(page.locator('#q-results')).toContainText('choose a Medicare locality to compare');
});

test('a fee schedule past its review date prices nothing and says so', async ({ page }) => {
  await page.route('**/data/mpfs/manifest.json', async (route) => {
    const res = await route.fetch(); const m = await res.json();
    await route.fulfill({ response: res, json: { ...m, expiresOn: '2020-01-01' } });
  });
  await page.goto('/#tic-rate-lookup');
  await expect(page.locator('#trl-locality')).toContainText('The fee schedule has passed its review date');
  await page.fill('#trl-codes', '99214');
  await page.locator('#trl-files').setInputFiles({ name: 'rates.json', mimeType: 'application/json', buffer });
  await expect(page.locator('#q-results')).toContainText('choose a Medicare locality to compare');
});

// spec-v1614 §6: with the reader's own Addendum B, the sample's institutional outpatient 99285 rate is priced.
test('with the reader\'s Addendum B, an outpatient facility rate is priced against the OPPS rate', async ({ page }) => {
  await page.goto('/#tic-rate-lookup');
  await page.fill('#trl-codes', '99285');
  const addb = 'Addendum B.-Final OPPS Payment by HCPCS Code for CY 2026,,,,,\r\nHCPCS Code,Short Descriptor,SI,APC,Relative Weight,Payment Rate\r\n99285,,V,5025,5.0,$500.00\r\n';
  await page.locator('#trl-addb').setInputFiles({ name: 'addendum-b.csv', mimeType: 'text/csv', buffer: Buffer.from(addb, 'latin1') });
  await expect(page.locator('#trl-ref-status')).toContainText('Final OPPS Payment by HCPCS Code for CY 2026: 1 code read.');
  await page.locator('#trl-files').setInputFiles({ name: 'rates.json', mimeType: 'application/json', buffer });
  const out = page.locator('#q-results');
  await expect(out).toContainText('OPPS national rate, APC 5025, status indicator V, Final OPPS Payment by HCPCS Code for CY 2026');
  await expect(out).toContainText('500%');
});
