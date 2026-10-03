// spec-v1505 backfill: ndc-hcpcs-units reads the code and billing unit for an NDC from the CMS ASP
// NDC-HCPCS crosswalk. The crosswalk is served from fixed fixtures, because the real one changes quarterly.

import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const MANIFEST = { dataset: 'asp-ndc', shardLayout: 'shards', coverage: 'full', sourceEdition: '2026 Q4', fetchedAt: '2026-10-01', expiresOn: '2099-01-01', shards: [{ name: '50242.json' }, { name: '00069.json' }] };
const AVASTIN = [{ ndc: '50242006101', codes: [{ code: 'J9035', labeler: 'Genentech, Inc.', drug: 'Avastin', dosage: '10 MG', pkgSize: 16, pkgQty: 1, billUnits: 40, billUnitsPkg: 40 }] }];
const RETACRIT = [{ ndc: '00069130510', codes: [
  { code: 'Q5105', drug: 'Retacrit', dosage: '100 UNITS', pkgSize: 1, pkgQty: 10, billUnits: 20, billUnitsPkg: 200 },
  { code: 'Q5106', drug: 'Retacrit', dosage: '1000 UNITS', pkgSize: 1, pkgQty: 10, billUnits: 2, billUnitsPkg: 20 },
] }];

test('an NDC fills the code and unit; a two-code NDC asks which', async ({ page }) => {
  const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/data/asp-ndc/manifest.json', (r) => r.fulfill(json(MANIFEST)));
  await page.route('**/data/asp-ndc/shards/50242.json', (r) => r.fulfill(json(AVASTIN)));
  await page.route('**/data/asp-ndc/shards/00069.json', (r) => r.fulfill(json(RETACRIT)));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#ndc-hcpcs-units');
  const out = page.locator('#q-results');
  await page.fill('#nh-ndc', '50242-061-01');
  await page.fill('#nh-dose', '400');
  await expect(out).toContainText('40 billing unit(s)');
  await expect(out).toContainText('J9035 (Avastin)');
  await expect(out).toContainText('Report the NDC on the claim as 50242-0061-01');
  await expectNoHScroll(page, 'ndc-hcpcs-units');

  await page.fill('#nh-ndc', '0069-1305-10');
  await page.fill('#nh-dose', '10000');
  await page.selectOption('#nh-dose-unit', 'units');
  await expect(out).toContainText('bills under more than one code: Q5105 (100 UNITS per unit) or Q5106 (1000 UNITS per unit)');
  await page.fill('#nh-code', 'Q5106');
  await expect(out).toContainText('10 billing unit(s)');

  await page.fill('#nh-ndc', '');
  await page.fill('#nh-code', '');
  await page.fill('#nh-dose', '35');
  await page.selectOption('#nh-dose-unit', 'mg');
  await page.fill('#nh-unitsize', '10');
  await expect(out).toContainText('4 billing unit(s)');
});
