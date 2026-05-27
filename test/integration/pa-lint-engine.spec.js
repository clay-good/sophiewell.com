// spec-v52 wave 52-1e: rule engine end-to-end.
//
// Drops two TXT files (a happy-path packet + a missing-NPI packet)
// and asserts:
//   1. The findings panel renders one .pa-rule entry per starter rule.
//   2. The happy packet returns all-pass.
//   3. The missing-NPI packet flips R-PA-016 to block.
//
// This is the first test that exercises the engine end-to-end through
// the DOM, so a regression in the wiring (engine wrong, render wrong,
// or extractor wrong) surfaces here.

import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'engine sweep is chromium-only');

const HAPPY_TEXT =
  'Patient: Jane Q Doe\n'
  + 'DOB: 1985-03-12\n'
  + 'Date of service: 2026-04-12\n'
  + 'Procedure 99213 office visit\n'
  + 'Dx: I10 essential hypertension\n'
  + 'Place of service: 11\n'
  + 'Ordering provider NPI: 1234567893\n';

test('pa-lint: happy-path TXT lights every starter rule green', async ({ page }) => {
  await page.goto('/#pa-lint');
  await expect(page.locator('#pa-file-picker')).toBeAttached();

  await page.setInputFiles('#pa-file-picker', {
    name: 'note.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(HAPPY_TEXT, 'utf8'),
  });

  await expect(page.locator('.pa-findings-headline')).toBeVisible({ timeout: 10_000 });
  // At least 7 rules render (the wave 52-1e starter set).
  const rules = page.locator('.pa-rule');
  await expect(rules).toHaveCount(7);
  // None of them should be block / flag / error on the happy packet.
  await expect(page.locator('.pa-rule[data-status="block"]')).toHaveCount(0);
  await expect(page.locator('.pa-rule[data-status="flag"]')).toHaveCount(0);
  await expect(page.locator('.pa-rule[data-status="error"]')).toHaveCount(0);
});

test('pa-lint: a TXT missing the NPI flips R-PA-016 to block', async ({ page }) => {
  await page.goto('/#pa-lint');
  await expect(page.locator('#pa-file-picker')).toBeAttached();

  const text = HAPPY_TEXT.replace('Ordering provider NPI: 1234567893\n', '');
  await page.setInputFiles('#pa-file-picker', {
    name: 'note.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(text, 'utf8'),
  });

  await expect(page.locator('.pa-findings-headline')).toBeVisible({ timeout: 10_000 });
  const npiRule = page.locator('.pa-rule', { hasText: 'R-PA-016' });
  await expect(npiRule).toHaveAttribute('data-status', 'block');
});
