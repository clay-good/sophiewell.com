// spec-v1602 tool 1: a CARIN Blue Button claims file read in a Worker: claims, totals by year, and the
// claims worth asking about, each with the fact it rests on.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const DIR = join(process.cwd(), 'test', 'fixtures', 'carin-bb-2.2.0');
const bundle = JSON.stringify({ resourceType: 'Bundle', type: 'searchset', entry: readdirSync(DIR).map((f) => ({ resource: JSON.parse(readFileSync(join(DIR, f))) })) });
const ADJ = 'http://terminology.hl7.org/CodeSystem/adjudication';
const C4 = 'http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBAdjudication';
const preventive = JSON.stringify({ resourceType: 'ExplanationOfBenefit', id: 'well-visit', type: { coding: [{ code: 'professional' }] }, billablePeriod: { start: '2026-03-02' }, provider: { display: 'Example Clinic' },
  item: [{ productOrService: { coding: [{ code: '99396' }] }, servicedDate: '2026-03-02', adjudication: [{ category: { coding: [{ system: ADJ, code: 'eligible' }] }, amount: { value: 200 } }, { category: { coding: [{ system: C4, code: 'coinsurance' }] }, amount: { value: 40 } }, { category: { coding: [{ system: C4, code: 'memberliability' }] }, amount: { value: 40 } }] }] });

test('the CARIN examples read into claims and totals, with amounts the file omits shown as not stated', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#carin-eob-reader');
  await page.locator('#cer-files').setInputFiles({ name: 'claims.json', mimeType: 'application/json', buffer: Buffer.from(bundle) });
  const out = page.locator('#q-results');
  await expect(out).toContainText('10 claims; nothing flagged.');
  await expect(out).toContainText('Totals by year');
  await expect(out).toContainText('(2 not stated)');
  await expect(out).toContainText('Orange Medical Group');
  await expect(out.locator('details.receipt')).toBeVisible();
  await expectNoHScroll(page, 'carin-eob-reader');
});

test('a preventive visit with cost sharing is flagged with its fact and a link to the next tool', async ({ page }) => {
  await page.goto('/#carin-eob-reader');
  await page.locator('#cer-files').setInputFiles({ name: 'claims.ndjson', mimeType: 'application/x-ndjson', buffer: Buffer.from(preventive) });
  const out = page.locator('#q-results');
  await expect(out).toContainText('1 claim in 2026; 1 worth asking about.');
  await expect(out).toContainText('Code 99396 on 2026-03-02 is a preventive medicine visit, and the file shows $40.00 for you to pay.');
  await expect(out.getByRole('link', { name: 'Preventive care cost check' })).toHaveAttribute('href', '#preventive-cost-share-check');
});
