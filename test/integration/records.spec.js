// spec-v1624 / spec-v1613 Tests: a synthetic health record (no real person)
// dropped on the home page fills the tools it can. The ready answers are the
// tools' own; opening one fills its fields from memory, marks each, and puts
// nothing from the file in the URL or history.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const REC = join(process.cwd(), 'test', 'fixtures', 'records');
const file = (name) => ({ name, mimeType: 'application/octet-stream', buffer: readFileSync(join(REC, name)) });

async function drop(page, files) {
  await page.goto('/');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('#hero-files-button').click();
  await (await chooser).setFiles(files);
}

for (const name of ['ccd-labs.xml', 'fhir-labs.json']) {
  test(`${name}: the record panel lists ready tools, one-short tools and the values found`, async ({ page }) => {
    await drop(page, [file(name)]);
    await expect(page).toHaveURL(/#\/records$/);
    await expect(page.locator('h1')).toHaveText('Your record can fill these tools');
    const egfr = page.locator('.record-ready li[data-tool="egfr"]');
    await expect(egfr).toContainText('58');
    await expect(egfr.locator('.record-used')).toContainText('Creatinine, serum or plasma 1.1 mg/dL (June 14, 2026)');
    await expect(page.locator('.record-ready li[data-tool="prevent"]')).toContainText('needs your answer:');
    await expect(page.locator('li[data-tool="fib4"]')).toContainText('needs alt');
    await expect(page.locator('.record-values')).toContainText('From July 20, 2025, 14 months ago.');
    await expect(page.getByText('Two results at the same time disagree, so neither is used.').first()).toBeVisible();
    await expect(page.getByText(/is not one this value converts from/)).toBeVisible();
    await expect(page.getByText(/more than five years old/)).toBeVisible();
  });
}

test('opening a ready tool fills it from memory, marks each field, and keeps the URL clean', async ({ page }) => {
  await drop(page, [file('ccd-labs.xml')]);
  const answerEl = page.locator('.record-ready li[data-tool="egfr"] .record-answer');
  await expect(answerEl).toHaveText(/^eGFR: 58\.\d mL/);
  const answer = (await answerEl.textContent()).trim();
  const historyBefore = await page.evaluate(() => history.length);
  await page.locator('.record-ready li[data-tool="egfr"] .record-open').click();
  await expect(page).toHaveURL(/#egfr$/);
  await expect(page.locator('#scr')).toHaveValue('1.1');
  await expect(page.locator('#age')).toHaveValue('58');
  await expect(page.locator('#sex')).toHaveValue('F');
  await expect(page.locator('.field-provenance').first()).toHaveText('from your file, June 14, 2026');
  await expect(page.getByText("Links aren't made from file values.")).toBeVisible();
  await page.waitForTimeout(300);
  // Nothing from the file in the fragment, now or after an edit.
  expect(new URL(page.url()).hash).toBe('#egfr');
  await page.locator('#age').fill('59');
  await page.waitForTimeout(300);
  expect(new URL(page.url()).hash).toBe('#egfr');
  expect(await page.evaluate(() => history.length)).toBe(historyBefore + 1);
  // The panel's answer is the tool's own.
  await page.locator('#age').fill('58');
  await expect(page.locator('#q-results')).toContainText(answer);
});
