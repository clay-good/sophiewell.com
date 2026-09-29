// spec-v1623 step 2: the file inventory at #/intake. The fixtures folder is
// chosen as files; every fixture gets a row with the right label, zips are
// unpacked, system files are counted, and nothing leaves the page.

import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'test', 'fixtures', 'file-kinds');

test('the inventory recognizes the fixtures folder in the page, offline', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (r) => { if (new URL(r.url()).origin !== 'http://localhost:4173') offOrigin.push(r.url()); });
  await page.goto('/#/intake');
  await expect(page.locator('h1')).toHaveText('Your files');
  const names = readdirSync(DIR).sort();
  const files = [...names.map((name) => ({ name, mimeType: 'application/octet-stream', buffer: readFileSync(join(DIR, name)) })),
    { name: '.DS_Store', mimeType: 'application/octet-stream', buffer: Buffer.from('x') }];
  await page.locator('#intake-files').setInputFiles(files);
  await expect(page.locator('#intake-status')).toContainText('system files were skipped', { timeout: 15000 });
  const row = (path) => page.locator('#q-results tbody tr').filter({ has: page.locator('td.intake-path', { hasText: new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) });
  await expect(row('x12-835.835')).toContainText('Remittance (835) file (2 remittance transactions). Certain.');
  await expect(row('x12-835.835').locator('a', { hasText: 'X12 835 Remittance Reader' })).toHaveAttribute('href', '#x12-835-reader');
  await expect(row('ccd.xml')).toContainText('planned and not built yet');
  await expect(row('claims.xlsx')).toContainText('Save it as CSV');
  await expect(row('ambiguous.csv')).toContainText('Choose one:');
  await expect(row('nested.zip/remits/inner.zip/era.835')).toContainText('Remittance (835) file');
  await expect(row('reference-nadac.csv')).toContainText('Reference table');
  await expect(row('unknown.txt')).toContainText("We couldn't identify unknown.txt.");
  // One row per fixture, except the two archives, which become their members.
  const count = await page.locator('#q-results tbody tr').count();
  expect(count).toBe(names.length - 2 + 3);
  expect(offOrigin).toEqual([]);
});

test('the inventory view has no horizontal scroll at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#/intake');
  await page.locator('#intake-files').setInputFiles([{ name: 'x12-271.271', mimeType: 'text/plain', buffer: readFileSync(join(DIR, 'x12-271.271')) }]);
  await expect(page.locator('#intake-status')).toContainText('1 file: 1 recognized.');
  const w = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  expect(w.s).toBeLessThanOrEqual(w.c + 1);
});
