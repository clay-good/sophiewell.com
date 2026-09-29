// Focused regression guard: icd10-validate reads no bundled ICD-10-CM data.
//
// It used to fetch data/icd10cm/shards/<letter>.json to add a note saying
// whether the typed code was "in the bundled sample set" -- 20 hand-written
// example codes, two of them retired (M54.5, R51). A sample cannot say whether
// a reader's code exists (spec-v1614 §1), so spec-v1622 removed the note and
// the fetch. This keeps them removed: typing codes from any chapter requests
// nothing under data/icd10cm/ and still renders the structural verdict.
//
// chromium-only: the network/console assertions are engine-agnostic.

import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'network assertions are chromium-only');

test('icd10-validate: renders a verdict without reading the bundled sample', async ({ page }) => {
  const dataRequests = [];
  page.on('request', (r) => { if (/\/data\/icd10cm\//.test(r.url())) dataRequests.push(r.url()); });

  await page.goto('/#icd10-validate', { waitUntil: 'load' });
  await expect(page.locator('#icd-in')).toBeVisible();

  await page.fill('#icd-in', 'T81.4XXA');
  await page.locator('#icd-in').dispatchEvent('change');
  await page.locator('#icd-7th').check();
  await expect(page.locator('h2').first()).toContainText('T81.4XXA');

  await page.fill('#icd-in', 'M54.50');
  await page.locator('#icd-in').dispatchEvent('change');
  await expect(page.locator('h2').first()).toContainText('M54.50');
  await expect(page.locator('main')).not.toContainText('bundled ICD-10-CM sample');
  expect(dataRequests, `icd10-validate must not read data/icd10cm:\n${dataRequests.join('\n')}`).toEqual([]);
});
