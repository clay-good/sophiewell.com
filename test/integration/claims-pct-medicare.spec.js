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
  await expect(out).toContainText('an inpatient or revenue-code-only facility line: Medicare pays inpatient stays under the IPPS');
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

// spec-v1614 §6: the reader's own Addendum B prices a hospital outpatient line at its national OPPS rate.
test('with the reader\'s Addendum B, an outpatient S line is priced and a J2 line says why it is not', async ({ page }) => {
  await page.goto('/#claims-pct-medicare');
  await page.fill('#cpm-locality', 'TX-18');
  const addb = 'Addendum B.-Final OPPS Payment by HCPCS Code for CY 2026,,,,,\r\n,,,,,\r\nHCPCS Code,Short Descriptor,SI,APC,Relative Weight,Payment Rate\r\nG0463,,J2,5012,1.4879,$136.02 \r\n71046,,S,5521,0.9726,$88.91 \r\n';
  await page.locator('#cpm-addb').setInputFiles({ name: 'addendum-b.csv', mimeType: 'text/csv', buffer: Buffer.from(addb, 'latin1') });
  await expect(page.locator('#cpm-ref-status')).toContainText('Final OPPS Payment by HCPCS Code for CY 2026: 2 codes read.');
  const csv = 'Date of Service,Billing Provider,HCPCS Code,Place of Service,Allowed Amount,Units,Claim Type\n2026-03-02,City Hospital,71046,22,177.82,1,institutional\n2026-03-02,City Hospital,G0463,22,300,1,institutional\n';
  await page.locator('#cpm-upload-file').setInputFiles({ name: 'claims.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByRole('button', { name: 'Use 2 rows' }).click();
  const out = page.locator('#q-results');
  await expect(out).toContainText('The plan allowed $177.82 where Medicare would pay $88.91: 200% of Medicare, on 1 of 2 claim lines (1 left out).');
  await expect(out).toContainText('status indicator J2: a comprehensive APC pays for the whole claim');
  await expect(out).toContainText('priced from your Addendum B (Final OPPS Payment by HCPCS Code for CY 2026)');
});

// spec-v1614 §6 (the spec's own test): a dropped relative value file of a newer edition is used for the run and
// named. A bare PPRRVU CSV has no GPCIs, so the bundled localities are used and the edition says so.
test('the reader\'s relative value file prices the line at its own conversion factor and is named', async ({ page }) => {
  await page.goto('/#claims-pct-medicare');
  const cells = Array(32).fill('');
  Object.assign(cells, { 0: '99214', 3: 'A', 5: '2.00', 6: '1.00', 8: '0.50', 10: '0.00', 25: '40.0000' });
  const csv = `,,2027 National Physician Fee Schedule Relative Value File January Release\r\nHCPCS,MOD,DESCRIPTION,${Array(29).fill('X').join(',')}\r\n${cells.join(',')}\r\n`;
  await page.locator('#cpm-rvu').setInputFiles({ name: 'PPRRVU2027_Jan_nonQPP.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'latin1') });
  await expect(page.locator('#cpm-rvu-status')).toContainText('PPRRVU2027_Jan_nonQPP: 1 row, conversion factor 40; GPCIs from the bundled file.');
  await page.fill('#cpm-claims', '2027-01-15, Alpha Clinic, 99214, 11, 180, 1');
  await page.fill('#cpm-locality', 'TX-18');
  await page.locator('#cpm-locality').dispatchEvent('change');
  const out = page.locator('#q-results');
  await expect(out).toContainText('on 1 of 1 claim line (0 left out).');
  await expect(out).toContainText('PPRRVU2027_Jan_nonQPP, your copy, with the GPCIs of the bundled');
});
