// spec-v1506 tool 9 with spec-v1517's NDC shard: an NDC typed into the negotiated-price check.

import { test, expect } from '@playwright/test';

test('an NDC loads the CMS file\'s list and shows the drug\'s price and the package\'s per-unit price', async ({ page }) => {
  await page.goto('/#partd-mfp-price-check');
  await page.locator('#mfp-date').fill('2026-06-01');
  await page.locator('#mfp-ndc').fill('00003-0893-21');
  const out = page.locator('#q-results');
  await expect(out).toContainText('Eliquis / Eliquis Sprinkle: $231.00 per 30-day equivalent supply on June 1, 2026.');
  await expect(out).toContainText('NDC 00003-0893-21: $4.145072 per unit on June 1, 2026');
  await page.locator('#mfp-ndc').fill('00003-0893-99');
  await expect(out).toContainText('NDC 00003-0893-99 is not in the CMS');
});
