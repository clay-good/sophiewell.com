// Focused regression guard: icd10-validate must never request a shard that the
// bundled offline seed does not contain.
//
// The bundled data/icd10cm seed covers only some first letters (A, E, I, J, K,
// M, N, R, Z). The tile's headline use case -- a 7th-character code that "will
// deny for lack of specificity" -- is exactly the S (injuries) and T
// (poisonings/complications) chapters, which are NOT in the seed. Before the
// manifest-gated fetch, typing such a code fired a 404 for
// data/icd10cm/shards/<L>.json (and a console error) even though the structural
// verdict never depends on the shard. The broad tool-interactions sweep catches
// this, but it runs ~6.5 min; this focused guard runs in seconds so a change to
// the tile's existence-check is caught fast.
//
// chromium-only: the on-demand fetch path mirrors the other PA/data specs; the
// network/console assertions are engine-agnostic.

import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'on-demand data-fetch path is chromium-only');

test('icd10-validate: an unbundled-letter code emits no 404 and still renders a verdict', async ({ page }) => {
  const dataErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') dataErrors.push(`console: ${m.text()}`); });
  page.on('response', (r) => {
    if (r.status() >= 400 && /\/data\/icd10cm\//.test(r.url())) dataErrors.push(`http ${r.status()} ${r.url()}`);
  });

  await page.goto('/#icd10-validate', { waitUntil: 'load' });
  await expect(page.locator('#icd-in')).toBeVisible();

  // T-codes (e.g. a complication code requiring a 7th character) have no bundled
  // shard. Type one and tick "7th character required" to drive the headline path.
  await page.fill('#icd-in', 'T81.4XXA');
  await page.locator('#icd-in').dispatchEvent('change');
  await page.locator('#icd-7th').check();
  await page.waitForTimeout(150);

  // The structural verdict still renders (the shard only feeds an optional
  // existence note, which is correctly omitted when the letter isn't bundled).
  await expect(page.locator('h2').first()).toContainText('T81.4XXA');
  expect(dataErrors, `icd10-validate must not fetch a missing shard:\n${dataErrors.join('\n')}`).toEqual([]);

  // A bundled-letter code (M) should still work without error too.
  await page.fill('#icd-in', 'M54.5');
  await page.locator('#icd-in').dispatchEvent('change');
  await page.waitForTimeout(150);
  await expect(page.locator('h2').first()).toContainText('M54.5');
  expect(dataErrors, `bundled-letter path must also be clean:\n${dataErrors.join('\n')}`).toEqual([]);
});
