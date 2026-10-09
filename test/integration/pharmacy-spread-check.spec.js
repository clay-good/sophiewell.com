// spec-v1604 tool 4: pharmacy-spread-check prices typed claims and a claims CSV against the NADAC week the
// page loads. The week is served from fixed fixtures, because the real one is refreshed weekly.

import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const A = { ndc: '00002143380', description: 'TRULICITY 0.75 MG/0.5 ML PEN', perUnit: 487.57264, effectiveDate: '2026-09-23', pricingUnit: 'ML' };
const B = { ndc: '00093505698', description: 'ATORVASTATIN 40 MG TABLET', perUnit: 0.03411, effectiveDate: '2026-08-20', pricingUnit: 'EA' };
const MANIFEST = { dataset: 'nadac', shardLayout: 'shards', coverage: 'full', sourceEdition: 'fixture week', fetchedAt: '2026-09-29', expiresOn: '2099-01-01', shards: [{ name: '00002.json' }, { name: '00093.json' }] };

async function fixedWeek(page) {
  const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/data/nadac/manifest.json', (r) => r.fulfill(json(MANIFEST)));
  await page.route('**/data/nadac/week.json', (r) => r.fulfill(json({ asOfDate: '2026-09-30' })));
  await page.route('**/data/nadac/shards/00002.json', (r) => r.fulfill(json([A])));
  await page.route('**/data/nadac/shards/00093.json', (r) => r.fulfill(json([B])));
}

test('typed claims: totals, the largest gap first, and a claim with no benchmark left out', async ({ page }) => {
  await fixedWeek(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#pharmacy-spread-check');
  const out = page.locator('#q-results');
  await page.fill('#psc-claims', [
    '00002-1433-80, 2, 2026-09-24, 1000, 25, 950',
    '00093-5056-98, 90, 2026-09-28, 20.01, 0',
    '00002-1433-80, 2, 2026-09-10, 1000, 25',
  ].join('\n'));
  await expect(out).toContainText('2 of 3 claims priced against NADAC: $1,045.01 paid by the plan and members where NADAC totals $978.22');
  await expect(out).toContainText('1 claim had no NADAC for the fill date');
  await expect(out.locator('caption', { hasText: 'Largest gaps by drug' })).toBeVisible();
  await expect(out.locator('table').first().locator('tbody tr').first()).toContainText('00002-1433-80');
  await expect(out).toContainText('took effect Sep 23, 2026, after the fill date');
  await expectNoHScroll(page, 'pharmacy-spread-check');
});

test('a claims CSV runs in the workbench with NADAC the page loaded', async ({ page }) => {
  await fixedWeek(page);
  await page.goto('/#pharmacy-spread-check');
  const csv = 'NDC,Quantity,Fill date,Plan paid,Member paid,Pharmacy paid\n00002-1433-80,2,2026-09-24,1000,25,950\n00093-5056-98,90,2026-09-28,20.01,0,\n';
  await page.locator('#psc-upload-file').setInputFiles({ name: 'claims.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByRole('button', { name: 'Use 2 rows' }).click();
  const out = page.locator('#q-results');
  await expect(out).toContainText('2 of 2 claims priced against NADAC');
  await expect(out).toContainText('the plan and members paid $75.00 more than the pharmacies received');
  await expect(page.locator('.upload-file-results')).toContainText('sophiewell_paid_above_nadac');
  // The receipt names the NADAC edition the page loaded; the NADAC rows themselves are not copied into it.
  await expect(page.locator('.upload-file-results')).toContainText('Data: nadac fixture week.');
  await expect(page.locator('.upload-file-results')).not.toContainText('TRULICITY');
});

// spec-v1614 §6: the reader's own NADAC file gives a 2020 fill a benchmark the current week cannot.
test('with the reader\'s NADAC year file, a 2020 fill is priced at the step in effect that day', async ({ page }) => {
  await page.goto('/#pharmacy-spread-check');
  const csv = 'NDC_Description,NDC,NADAC_Per_Unit,Effective_Date,Pricing_Unit,As_of_Date\r\n"METFORMIN HCL 500 MG TABLET",00093104801,0.02000,01/15/2020,EA,01/22/2020\r\n"METFORMIN HCL 500 MG TABLET",00093104801,0.01800,02/12/2020,EA,02/19/2020\r\n';
  await page.locator('#psc-nadac-file').setInputFiles({ name: 'nadac-2020.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.fill('#psc-claims', '00093-1048-01, 100, 2020-02-15, 10, 0');
  await expect(page.locator('#psc-nadac-status')).toContainText('nadac-2020.csv: 2 rows for these drugs, weeks 2020-01-22 to 2020-02-19.');
  await expect(page.locator('#q-results')).toContainText('1 of 1 claim priced against NADAC: $10.00 paid by the plan and members where NADAC totals $1.80');
});
