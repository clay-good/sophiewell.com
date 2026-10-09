// spec-v1602 tool 2: an itemized bill beside the hospital's own price file, read in a Worker.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const ATT = 'To the best of its knowledge and belief';
const price = [
  `hospital_name,last_updated_on,version,location_name,hospital_address,license_number|AL,"${ATT}"`,
  'Alpha Hospital,2026-07-01,3.0.0,Alpha City,1 Way,123,true',
  'description,code|1,code|1|type,setting,standard_charge|gross,standard_charge|discounted_cash,standard_charge|min,standard_charge|max,payer_name,plan_name,standard_charge|negotiated_dollar,standard_charge|negotiated_percentage,standard_charge|negotiated_algorithm,median_amount,10th_percentile,90th_percentile,count,standard_charge|methodology',
  'ED visit level 4,99284,CPT,outpatient,2000,900,500,1500,Acme Health,Gold PPO,1100,,,,,,,fee schedule',
].join('\n');

test('a bill line above the posted gross charge, and a code the file does not post', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#itemized-bill-check');
  await page.fill('#ibc-bill', '2026-03-02, 99284, 1, 2400, ED visit\n2026-03-02, 36415, 1, 45, Venipuncture');
  await page.selectOption('#ibc-setting', 'outpatient');
  await page.selectOption('#ibc-payment', 'insured');
  await page.fill('#ibc-plan', 'Gold PPO');
  await page.locator('#ibc-price-file').setInputFiles({ name: 'alpha.csv', mimeType: 'text/csv', buffer: Buffer.from(price) });
  const out = page.locator('#q-results');
  await expect(out).toContainText('2 lines totaling $2,445.00; 2 lines worth asking about, $400.00 above the gross charges the hospital posted.');
  await expect(out).toContainText('above the $2,000.00 gross charge the hospital posted');
  await expect(out).toContainText('not posted');
  await expect(out).toContainText('$1,100.00');
  await expect(out.locator('details.receipt')).toBeVisible();
  await expectNoHScroll(page, 'itemized-bill-check');
});

test('a bill CSV works like typed lines; nothing runs until the setting is chosen', async ({ page }) => {
  await page.goto('/#itemized-bill-check');
  await page.locator('#ibc-price-file').setInputFiles({ name: 'alpha.csv', mimeType: 'text/csv', buffer: Buffer.from(price) });
  await page.locator('#ibc-bill-file').setInputFiles({ name: 'bill.csv', mimeType: 'text/csv', buffer: Buffer.from('Service Date,CPT Code,Description,Qty,Charges\n2026-03-02,99284,ED visit,1,1900\n') });
  await expect(page.locator('#ibc-status')).toContainText('Choose whether the care was inpatient or outpatient');
  await page.selectOption('#ibc-setting', 'outpatient');
  await page.selectOption('#ibc-payment', 'self-pay');
  await expect(page.locator('#q-results')).toContainText('above the $900.00 discounted cash price the hospital posted');
});

// spec-v1614 §6: the reader's own NCCI PTP edits check code pairs; the venipuncture billed with the ED visit
// is the column 2 line.
test('with the reader\'s PTP edits, a column 2 code billed the same day is flagged and named in the letter', async ({ page }) => {
  await page.goto('/#itemized-bill-check');
  await page.fill('#ibc-bill', '2026-03-02, 99284, 1, 1900, ED visit\n2026-03-02, 36415, 1, 45, Venipuncture');
  await page.selectOption('#ibc-setting', 'outpatient');
  await page.selectOption('#ibc-payment', 'insured');
  const ptp = 'CPT only copyright American Medical Association.\r\n\r\n\r\n\r\n\r\n\r\nColumn 1\tColumn 2\t*=in existence prior to 1996\tEffective Date\tDeletion Date *=no data\tModifier 0=not allowed 1=allowed 9=not applicable\tPTP Edit Rationale\r\n99284\t36415\t\t20260101\t*\t1\tStandards of medical / surgical practice\r\n';
  await page.locator('#ibc-ptp-files').setInputFiles({ name: 'ccioph-v322r0-f1.txt', mimeType: 'text/plain', buffer: Buffer.from(ptp, 'latin1') });
  await page.locator('#ibc-price-file').setInputFiles({ name: 'alpha.csv', mimeType: 'text/csv', buffer: Buffer.from(price) });
  const out = page.locator('#q-results');
  await expect(out).toContainText('billed with 99284 on 2026-03-02: an NCCI pair edit, so 36415 is not paid separately unless a modifier');
  await expect(out).toContainText('checked against your NCCI procedure-to-procedure edits (version 32.2, revision 0)');
});
