// spec-v1623 step 4 / spec-v1612 Tests: files on the home page, three engines,
// no request off the page's own origin.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'test', 'fixtures', 'file-kinds');
const fixture = (name) => ({ name, mimeType: 'application/octet-stream', buffer: readFileSync(join(DIR, name)) });

let offOrigin;
test.beforeEach(({ page }) => {
  offOrigin = [];
  page.on('request', (r) => { if (new URL(r.url()).origin !== 'http://localhost:4173') offOrigin.push(r.url()); });
});
test.afterEach(() => { expect(offOrigin).toEqual([]); });

test('a chosen 835 opens the remittance reader with the file in it; the URL holds only the route', async ({ page }) => {
  await page.goto('/');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('#hero-files-button').click();
  await (await chooser).setFiles(fixture('x12-835.835'));
  await expect(page).toHaveURL(/#x12-835-reader$/);
  await expect(page.locator('.intake-banner')).toContainText('x12-835.835: read as a remittance (835) file.');
  await expect(page.locator('.intake-banner')).toContainText('Read in this tab. Not uploaded, not kept.');
  await expect(page.locator('.intake-banner')).toContainText('Also from this file: Denial Pattern Report');
  await expect(page.locator('#q-results')).toContainText('claims balance');
});

// The batch tools' hand-offs were exported by their views but never read by app.js until October 7, 2026, so
// these files went to the inventory. This goes through the home page, not the view module.
for (const [file, route, rows] of [['households.csv', 'fpl-percent', 'households'], ['timely-claims.csv', 'timely-filing', 'claims']]) {
  test(`a chosen ${file} opens ${route} with the file in its upload`, async ({ page }) => {
    await page.goto('/');
    const chooser = page.waitForEvent('filechooser');
    await page.locator('#hero-files-button').click();
    await (await chooser).setFiles(fixture(file));
    await expect(page).toHaveURL(new RegExp(`#${route}(&|$)`));
    await expect(page.locator('.intake-banner')).toContainText(`${file}: read as a spreadsheet (CSV).`);
    await page.locator('.upload-workbench button', { hasText: /^Use \d+ rows?$/ }).click();
    await expect(page.locator('#q-results')).toContainText(new RegExp(`\\d+ ${rows} of \\d+ computed`));
  });
}

test('a file dropped on the home page opens its tool', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit drops the dataTransfer of a script-made DragEvent; the choose path covers WebKit');
  await page.goto('/');
  const bytes = [...readFileSync(join(DIR, 'x12-271.271'))];
  await page.evaluate((b) => {
    const dt = new DataTransfer();
    dt.items.add(new File([new Uint8Array(b)], 'x12-271.271'));
    const home = document.getElementById('home-view');
    for (const type of ['dragenter', 'dragover', 'drop']) home.dispatchEvent(new window.DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, bytes);
  await expect(page).toHaveURL(/#x12-271-reader$/);
  await expect(page.locator('#x271-status')).toHaveText('1 response read.');
});

test('the sample chip, then "Also from this file" reuses the file without a new drop', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'a sample remittance file' }).click();
  await expect(page).toHaveURL(/#x12-835-reader$/);
  await page.locator('.intake-banner a', { hasText: 'Denial Pattern Report' }).click();
  await expect(page).toHaveURL(/#denial-pattern-report$/);
  await expect(page.locator('#q-results')).toContainText('adjustments total');
});

test('several files open the inventory, with one action per tool', async ({ page }) => {
  await page.goto('/');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('#hero-files-button').click();
  const second = { ...fixture('x12-835.835'), name: 'era-2.835' };
  await (await chooser).setFiles([fixture('x12-835.835'), second, fixture('claims.xlsx'), fixture('ambiguous.csv')]);
  await expect(page).toHaveURL(/#\/intake$/);
  await expect(page.locator('#q-results tbody tr')).toHaveCount(4);
  await expect(page.locator('#q-results')).toContainText('Save it as CSV');
  await page.getByRole('button', { name: 'Open Denial Pattern Report with 2 files' }).click();
  await expect(page).toHaveURL(/#denial-pattern-report$/);
  await expect(page.locator('.intake-banner')).toContainText('2 files: read as a remittance (835) file.');
});

test('"Not right?" lists the file with its choices; a reload keeps no file', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'a sample remittance file' }).click();
  await expect(page.locator('#q-results')).toContainText('claims balance');
  await page.reload();
  await expect(page.locator('.intake-banner')).toHaveText("Files aren't kept after a reload. Drop it again.");
  await expect(page.locator('#q-results')).not.toContainText('claims balance');
  await page.goto('/');
  await page.getByRole('button', { name: 'a sample remittance file' }).click();
  await page.getByRole('link', { name: 'Not right? Choose another tool' }).click();
  await expect(page).toHaveURL(/#\/intake$/);
  await expect(page.locator('#q-results tbody tr')).toHaveCount(1);
});

test('keyboard only: reach "Choose files", choose, and land on the result line', async ({ page }) => {
  await page.goto('/');
  await page.locator('#hero-files-button').focus();
  const chooser = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  await (await chooser).setFiles(fixture('x12-277.277'));
  await expect(page).toHaveURL(/#x12-277-reader$/);
  await expect(page.locator('.intake-banner')).toBeFocused();
});

test('mobile: no folder button and no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await expect(page.locator('#hero-files-button')).toBeVisible();
  await expect(page.locator('#hero-folder-button')).toBeHidden();
  const w = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  expect(w.s).toBeLessThanOrEqual(w.c + 1);
});
