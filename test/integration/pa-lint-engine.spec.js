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

// Synced to the 25-rule starter set at wave 52-1f close. Adding rules
// generally means adding anchors to this fixture too; the engine
// unit suite uses the canonical version, this is the e2e mirror.
const HAPPY_TEXT = [
  'Cover sheet',
  'Patient: Jane Q Doe',
  'DOB: 1985-03-12',
  'Member ID: W123456789',
  'Date of service: 2026-04-12',
  'Procedure 99213 office visit',
  'Quantity: 1',
  'Dx: I10 essential hypertension',
  'Place of service: 11',
  'Ordering provider NPI: 1234567893',
  'TIN: 123456789',
  'Chief complaint: hypertension follow-up',
  'Medical necessity: required for blood-pressure control.',
  'Step therapy: trial of lisinopril completed without adequate response.',
  'Active medications: lisinopril 10 mg daily.',
  'Allergies: NKDA.',
  'Duration: 12 months requested.',
  'Servicing facility NPI: 1306849393',
  'Signature: Jane Doe MD, 2026-04-12',
].join('\n') + '\n';

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
  await expect(rules).toHaveCount(125);
  // None of them should be block / flag / error on the happy packet.
  await expect(page.locator('.pa-rule[data-status="block"]')).toHaveCount(0);
  await expect(page.locator('.pa-rule[data-status="flag"]')).toHaveCount(0);
  await expect(page.locator('.pa-rule[data-status="error"]')).toHaveCount(0);
});

test('pa-lint: a TXT missing the NPI flips R-PA-016 to block', async ({ page }) => {
  await page.goto('/#pa-lint');
  await expect(page.locator('#pa-file-picker')).toBeAttached();

  // Strip both NPI lines so R-PA-016 (any Luhn-valid NPI) flips.
  const text = HAPPY_TEXT
    .replace('Ordering provider NPI: 1234567893\n', '')
    .replace('Servicing facility NPI: 1306849393\n', '');
  await page.setInputFiles('#pa-file-picker', {
    name: 'note.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(text, 'utf8'),
  });

  await expect(page.locator('.pa-findings-headline')).toBeVisible({ timeout: 10_000 });
  // Match on the rule-id chip span specifically; the .pa-rule body of
  // R-PA-019 mentions R-PA-016 in its note text and would otherwise
  // collide with a plain hasText filter.
  const npiRule = page.locator('.pa-rule').filter({ has: page.locator('.pa-rule-id', { hasText: /^R-PA-016$/ }) });
  await expect(npiRule).toHaveAttribute('data-status', 'block');
});
