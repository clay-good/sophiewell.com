// spec-v1625 step 2 (price file, remittance analysis, CSV workbench) /
// spec-v1615 Tests: the receipt names each file by SHA-256 and kind,
// records the reader's choices without any value from a file, reproduces its
// result hash on a second run, and CSV exports end with the provenance row.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'test', 'fixtures', 'file-kinds');
const sha = (b) => createHash('sha256').update(b).digest('hex');

test.skip(({ browserName }) => browserName !== 'chromium', 'download handling is engine-agnostic; one engine');

async function receipts(page, after) {
  await page.locator('details.receipt summary').click();
  const [share] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download receipt to share' }).click()]);
  const [named] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download receipt with file names' }).click()]);
  const out = { share: JSON.parse(readFileSync(await share.path(), 'utf8')), named: JSON.parse(readFileSync(await named.path(), 'utf8')) };
  if (after) await after();
  return out;
}

const RUNS = {
  'hpt-file-check': async (page) => {
    await page.goto('/#hpt-file-check');
    await page.locator('#hpt-file').setInputFiles({ name: 'mercy-standard-charges.csv', mimeType: 'text/csv', buffer: readFileSync(join(DIR, 'hpt-tall.csv')) });
    await expect(page.locator('#q-results')).toContainText('structural');
    return [readFileSync(join(DIR, 'hpt-tall.csv'))];
  },
  'denial-pattern-report': async (page) => {
    await page.goto('/#denial-pattern-report');
    await page.locator('#dpr-files').setInputFiles({ name: 'era_smith.835', mimeType: 'text/plain', buffer: readFileSync(join(DIR, 'x12-835.835')) });
    await expect(page.locator('#q-results')).toContainText('adjustments total');
    return [readFileSync(join(DIR, 'x12-835.835'))];
  },
  'mpr-gap-days': async (page) => {
    await page.goto('/#mpr-gap-days');
    await page.locator('#mpr-upload-file').setInputFiles({ name: 'jones_fills.csv', mimeType: 'text/csv', buffer: readFileSync(join(DIR, 'fill-history.csv')) });
    await page.getByRole('button', { name: 'Use 2 rows' }).click();
    await expect(page.locator('details.receipt')).toBeVisible();
    return [readFileSync(join(DIR, 'fill-history.csv'))];
  },
};

for (const [tool, run] of Object.entries(RUNS)) {
  test(`${tool}: a receipt that names the file by hash and reproduces`, async ({ page }) => {
    const [bytes] = await run(page);
    const a = await receipts(page);
    expect(a.share.tool.id).toBe(tool);
    expect(a.share.files[0].sha256).toBe(sha(bytes));
    expect(a.share.files[0].size).toBe(bytes.length);
    expect(a.share.files[0].name).toMatch(/ 1 of 1$/);
    expect(a.named.files[0].name).not.toMatch(/ 1 of 1$/);
    // No value from the file, and not the file's name, in the version to share.
    const text = JSON.stringify(a.share);
    for (const v of ['smith', 'jones', 'mercy', 'Example General Hospital', 'atorvastatin', 'ACCT-1', 'MEMBER-1', 'DOE']) expect(text).not.toContain(v);
    await page.goto('/');
    await run(page);
    const b = await receipts(page);
    expect(b.share.resultHash).toBe(a.share.resultHash);
  });
}

test('the workbench CSV export ends with its provenance row', async ({ page }) => {
  await RUNS['mpr-gap-days'](page);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download redacted CSV' }).click()]);
  const csv = readFileSync(await dl.path(), 'utf8').trimEnd().split('\r\n');
  expect(csv.at(-1)).toMatch(/^# Made by sophiewell\.com mpr-gap-days, build [^,]+, result [0-9a-f]{64}\./);
});
