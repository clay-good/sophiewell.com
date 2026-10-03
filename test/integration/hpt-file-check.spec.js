import { test, expect } from '@playwright/test';
import { HPT_ATTESTATION } from '../../lib/hpt-v1515.js';
import { expectNoHScroll } from '../lib/no-hscroll.js';

function csv(rows) {
  return rows.map((row) => row.map((value) => {
    const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }).join(',')).join('\r\n');
}

function hospitalFile({ placeholder = false } = {}) {
  const general = ['hospital_name', 'last_updated_on', 'version', 'location_name', 'hospital_address', 'license_number|TX', 'type_2_npi', HPT_ATTESTATION, 'attester_name'];
  const values = ['Example Hospital', '2026-09-28', '3.0.0', 'Main campus', '1 Main St', '123', '1234567893', 'true', 'Alex Example'];
  const number = placeholder ? '[i]' : '1';
  const headers = ['description', `code|${number}`, `code|${number}|type`, 'modifiers', 'setting', 'drug_unit_of_measurement', 'drug_type_of_measurement', 'standard_charge|gross', 'standard_charge|discounted_cash', 'payer_name', 'plan_name', 'standard_charge|negotiated_dollar', 'standard_charge|negotiated_percentage', 'standard_charge|negotiated_algorithm', 'median_amount', '10th_percentile', '90th_percentile', 'count', 'standard_charge|methodology', 'standard_charge|min', 'standard_charge|max', 'additional_generic_notes'];
  const row = ['Clinic\nvisit', '99213', 'CPT', '', 'outpatient', '', '', '150', '', 'Payer', 'Plan', '100', '', '', '', '', '', '', 'fee schedule', '80', '120', ''];
  return csv([general, values, headers, row]);
}

test('HPT checker streams a local v3 CSV and reports precise deficiencies', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#hpt-file-check');
  const input = page.locator('#hpt-file');
  await input.setInputFiles({ name: 'prices.csv', mimeType: 'text/csv', buffer: Buffer.from(hospitalFile()) });
  await expect(page.locator('#hpt-status')).toHaveText('prices.csv checked.');
  await expect(page.locator('#q-results')).toContainText('No v3.0.0 structural deficiencies found.');
  await expect(page.locator('#q-results')).toContainText('CSV tall');
  await expect(page.locator('#q-results')).toContainText('1');
  await expectNoHScroll(page, 'hpt-file-check');

  await input.setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from(hospitalFile({ placeholder: true })) });
  await expect(page.locator('#hpt-status')).toHaveText('bad.csv checked.');
  await expect(page.locator('#q-results')).toContainText('structural deficiencies found');
  await expect(page.locator('#q-results')).toContainText('placeholder');
  await expect(page.locator('#q-results')).toContainText('Replace every bracketed CMS template placeholder');
  await expectNoHScroll(page, 'hpt-file-check');
  expect(offOrigin).toEqual([]);
});
