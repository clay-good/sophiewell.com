// spec-v1604 tool 1: an insurer price file checked against the CMS schema in a Worker, and a table of
// contents checked against the files chosen with it.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const DIR = join(process.cwd(), 'test', 'fixtures', 'tic-v2.2.1');
const inn = readFileSync(join(DIR, 'in-network-rates-fee-for-service-single-plan-sample.json'));

test('a CMS sample in-network file passes, with its type, item count and a receipt', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#tic-file-check');
  await page.locator('#tic-files').setInputFiles({ name: 'rates.json', mimeType: 'application/json', buffer: inn });
  const out = page.locator('#q-results');
  await expect(out).toContainText('No deficiencies against the CMS Transparency in Coverage schema v2.2.1.');
  await expect(out).toContainText('In-network rates file');
  await expect(out).toContainText('2 items');
  await expect(out.locator('details.receipt')).toBeVisible();
  await expectNoHScroll(page, 'tic-file-check');
});

test('a table of contents chosen with one of its files names the ones missing, by path', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#tic-file-check');
  await page.locator('#tic-files').setInputFiles([
    { name: 'index.json', mimeType: 'application/json', buffer: readFileSync(join(DIR, 'table-of-contents-sample.json')) },
    { name: 'in-network-file-123456.json', mimeType: 'application/json', buffer: inn },
  ]);
  const out = page.locator('#q-results');
  await expect(out).toContainText("4 deficiencies against the CMS Transparency in Coverage schema v2.2.1, in the table of contents' references.");
  await expect(out).toContainText('$.reporting_structure[1].in_network_files[0].location');
  await expect(out).toContainText('names chip-in-network-file.json, which is not among the files chosen.');
  await expectNoHScroll(page, 'tic-file-check');
});
