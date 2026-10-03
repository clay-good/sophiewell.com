// spec-v1604 tool 3: a plan's claim lines as a percent of Medicare -- typed, and from a claims extract through
// the upload workbench. Medicare amounts come from the live fee schedule, which changes quarterly, so the
// test asserts what is priced, what is left out and why, not the dollar figures.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

test('typed lines: professional lines priced for the locality, a DRG line left out with its reason', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#claims-pct-medicare');
  await page.fill('#cpm-claims', '2026-03-02, Alpha Clinic, 99214, 11, 180, 1\n2026-03-05, City Hospital, DRG 470, 21, 25000, 1\n2026-03-06, Beta Group, 27447, 22, 2400, 1, 80');
  await page.fill('#cpm-locality', 'TX-18');
  await page.locator('#cpm-locality').dispatchEvent('change');
  const out = page.locator('#q-results');
  await expect(out).toContainText('% of Medicare, on 1 of 3 claim lines (2 left out).');
  await expect(out).toContainText('a facility claim: Medicare pays it under the OPPS or IPPS');
  await expect(out).toContainText('modifier 80 changes the Medicare amount');
  await expect(out).toContainText('physician fee schedule for HOUSTON (TX 18)');
  await expectNoHScroll(page, 'claims-pct-medicare');
});

test('a claims extract through the workbench gives the same answer, with result columns to download', async ({ page }) => {
  await page.goto('/#claims-pct-medicare');
  await page.fill('#cpm-locality', 'TX-18');
  const csv = 'Date of Service,Billing Provider,CPT Code,Place of Service,Allowed Amount,Units\n2026-03-02,Alpha Clinic,99214,11,180,1\n2026-03-05,City Hospital,DRG 470,21,25000,1\n';
  await page.locator('#cpm-upload-file').setInputFiles({ name: 'claims.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByRole('button', { name: 'Use 2 rows' }).click();
  const out = page.locator('#q-results');
  await expect(out).toContainText('% of Medicare, on 1 of 2 claim lines (1 left out).');
  await expect(page.locator('details.receipt')).toBeVisible();
});

test('without a locality it asks for one instead of answering', async ({ page }) => {
  await page.goto('/#claims-pct-medicare');
  await page.fill('#cpm-locality', '');
  await page.locator('#cpm-locality').dispatchEvent('change');
  await expect(page.locator('#q-results')).toContainText('Choose the Medicare locality the claims are priced against.');
});
