// spec-v1625 step 3 / spec-v1615 §2: drop a receipt with the files it names;
// the tool re-runs on them and says whether the result is the same.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'test', 'fixtures', 'file-kinds');
const era = () => ({ name: 'era.835', mimeType: 'text/plain', buffer: readFileSync(join(DIR, 'x12-835.835')) });

test.skip(({ browserName }) => browserName !== 'chromium', 'one engine; home-files.spec.js covers the drop on three');

async function receiptFor(page) {
  await page.goto('/#x12-835-reader');
  await page.locator('#x835-files').setInputFiles(era());
  await page.locator('details.receipt summary').click();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download receipt to share' }).click()]);
  return JSON.parse(readFileSync(await dl.path(), 'utf8'));
}

async function dropOnHome(page, files) {
  await page.goto('/');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('#hero-files-button').click();
  await (await chooser).setFiles(files);
}

const asFile = (receipt) => ({ name: 'receipt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(receipt)) });

test('a receipt dropped with its file reproduces the result', async ({ page }) => {
  const receipt = await receiptFor(page);
  await dropOnHome(page, [asFile(receipt), era()]);
  await expect(page).toHaveURL(/#x12-835-reader$/);
  await expect(page.locator('.receipt-check')).toHaveText(new RegExp(`^Reproduced: same result as the receipt \\(${receipt.resultHash.slice(0, 12)}`));
});

test('a receipt whose result differs says so', async ({ page }) => {
  const receipt = { ...(await receiptFor(page)), resultHash: '0'.repeat(64) };
  await dropOnHome(page, [asFile(receipt), era()]);
  await expect(page.locator('.receipt-check')).toHaveText('Not reproduced. The result differs.');
  await expect(page.locator('.receipt-check')).toHaveClass(/warn/);
});

test('a receipt without its file names the file that is missing', async ({ page }) => {
  const receipt = await receiptFor(page);
  const changed = { ...era(), buffer: Buffer.from(readFileSync(join(DIR, 'x12-835.835'), 'utf8').replace('CLP*ACCT-1*1*200', 'CLP*ACCT-1*1*201')) };
  await dropOnHome(page, [asFile(receipt), changed]);
  await expect(page).toHaveURL(/#\/intake$/);
  await expect(page.locator('#q-results')).toContainText('The receipt names 1 file; 1 of them was not dropped (Remittance (835) file 1 of 1).');
});
