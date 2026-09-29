// spec-v1625 step 2 (X12 family) / spec-v1615 Tests: each X12 tool's receipt
// names its file by SHA-256 and kind, reproduces its result hash on a second
// run, holds no business value from the file, and its CSV export ends with
// the provenance row.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'test', 'fixtures', 'file-kinds');
const CASES = [
  ['x12-835-reader', 'x12-835.835', 'x835-files', 'x12-835', 'Remittance (835) file'],
  ['x12-837-check', 'x12-837p.837', 'x837-files', 'x12-837p', 'Professional claim (837P) file'],
  ['x12-271-reader', 'x12-271.271', 'x271-file', 'x12-271', 'Eligibility response (271) file'],
  ['x12-277-reader', 'x12-277.277', 'x277-files', 'x12-277', 'Claim status (277) file'],
];

test.skip(({ browserName }) => browserName !== 'chromium', 'download handling is engine-agnostic; one engine');

// Business values in a file: every element of every segment except the
// envelope (ISA, GS, ST, SE, GE, IEA), longer than 3 characters.
function businessValues(text) {
  const out = new Set();
  for (const seg of text.split('~')) {
    const el = seg.trim().split('*');
    if (['ISA', 'GS', 'ST', 'SE', 'GE', 'IEA', ''].includes(el[0])) continue;
    for (const v of el.slice(1)) for (const part of v.split(':')) if (part.length > 3) out.add(part);
  }
  return [...out];
}

async function runOnce(page, tool, fixture, inputId) {
  await page.goto('/');
  await page.goto(`/#${tool}`);
  await page.locator(`#${inputId}`).setInputFiles({ name: fixture, mimeType: 'text/plain', buffer: readFileSync(join(DIR, fixture)) });
  await page.locator('details.receipt summary').click();
  const [share] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download receipt to share' }).click()]);
  const [named] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download receipt with file names' }).click()]);
  return {
    share: JSON.parse(readFileSync(await share.path(), 'utf8')),
    named: JSON.parse(readFileSync(await named.path(), 'utf8')),
  };
}

for (const [tool, fixture, inputId, kind, label] of CASES) {
  test(`${tool}: a receipt that names the file by hash and reproduces`, async ({ page }) => {
    const bytes = readFileSync(join(DIR, fixture));
    const a = await runOnce(page, tool, fixture, inputId);
    expect(a.share.receiptVersion).toBe(1);
    expect(a.share.tool.id).toBe(tool);
    expect(a.share.files).toHaveLength(1);
    expect(a.share.files[0]).toMatchObject({ name: `${label} 1 of 1`, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), kind });
    expect(a.named.files[0].name).toBe(fixture);
    expect(a.share.resultHash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.share.resultHash).toBe(a.named.resultHash);
    const text = JSON.stringify(a.share);
    for (const v of businessValues(bytes.toString('utf8'))) expect(text, `the receipt holds "${v}" from the file`).not.toContain(v);
    const b = await runOnce(page, tool, fixture, inputId);
    expect(b.share.resultHash).toBe(a.share.resultHash);
    expect(b.share.ranAt >= a.share.ranAt).toBe(true);
  });
}

test('the 835 CSV export ends with its provenance row', async ({ page }) => {
  await page.goto('/#x12-835-reader');
  await page.locator('#x835-files').setInputFiles({ name: 'x12-835.835', mimeType: 'text/plain', buffer: readFileSync(join(DIR, 'x12-835.835')) });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download redacted CSV' }).click()]);
  const csv = readFileSync(await dl.path(), 'utf8').trimEnd().split('\r\n');
  expect(csv.at(-1)).toMatch(/^# Made by sophiewell\.com x12-835-reader, build [^,]+, result [0-9a-f]{64}\. Files are named by SHA-256 in the receipt\.$/);
});
