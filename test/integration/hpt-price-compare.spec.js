// spec-v1515 tool 6: one code across two hospital price files (a tall CSV and a JSON), streamed in a Worker.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const ATT = 'To the best of its knowledge and belief';
const csv = [
  `hospital_name,last_updated_on,version,location_name,hospital_address,license_number|AL,"${ATT}"`,
  'Alpha Hospital,2026-07-01,3.0.0,Alpha City,1 Way,123,true',
  'description,code|1,code|1|type,setting,standard_charge|gross,standard_charge|discounted_cash,standard_charge|min,standard_charge|max,payer_name,plan_name,standard_charge|negotiated_dollar,standard_charge|negotiated_percentage,standard_charge|negotiated_algorithm,median_amount,10th_percentile,90th_percentile,count,standard_charge|methodology',
  'MRI brain,70553,CPT,outpatient,3000,1800,900,2500,Plan A,Gold,1500,,,,,,,fee schedule',
].join('\n');
const json = JSON.stringify({ hospital_name: 'Gamma Hospital', last_updated_on: '2026-05-01', version: '3.0.0', location_name: ['Gamma'],
  standard_charge_information: [{ description: 'MRI brain', code_information: [{ code: '70553', type: 'CPT' }], standard_charges: [{ setting: 'outpatient', gross_charge: 2600, discounted_cash: 1200, payers_information: [{ payer_name: 'Plan C', plan_name: 'All', standard_charge_percentage: 55, methodology: 'percent of total billed charges' }] }] }] });

test('two price files compare side by side for one code, with a CSV and a receipt', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#hpt-price-compare');
  await page.fill('#hptc-code', '70553');
  await page.locator('#hptc-files').setInputFiles([
    { name: 'alpha.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) },
    { name: 'gamma.json', mimeType: 'application/json', buffer: Buffer.from(json) },
  ]);
  const out = page.locator('#q-results');
  await expect(out).toContainText('2 price rows for 70553 across 2 hospitals. The lowest discounted cash price is $1,200.00 at Gamma Hospital (outpatient).');
  await expect(out).toContainText('55%');
  await expect(out.getByRole('button', { name: 'Download the comparison CSV' })).toBeVisible();
  await expectNoHScroll(page, 'hpt-price-compare');
});
