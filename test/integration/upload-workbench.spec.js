// spec-v1501 §3: a real module Worker parses local fills and the reader confirms
// the proposed columns before the existing PDC compute runs.
import { test, expect } from '@playwright/test';

test('PDC file intake maps synonyms and matches the existing compute path', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url());
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#pdc-star');
  await page.locator('#ps-year').fill('2026');
  await page.locator('#ps-upload-file').setInputFiles({
    name: 'fills.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'member name,star measure,dispense date,supply days,drug ingredient',
      '"Smith, Ann",D10,2026-01-05,30,atorvastatin',
      '"Smith, Ann",D10,2026-02-10,30,atorvastatin',
    ].join('\n')),
  });

  await expect(page.getByText('Review the proposed columns, then use the rows.')).toBeVisible();
  await expect(page.locator('#ps-upload-map-patient')).toHaveValue('0');
  await expect(page.locator('#ps-upload-map-ingredient')).toHaveValue('4');
  const confirm = page.getByRole('button', { name: 'Use 2 rows' });
  const confirmBox = await confirm.boundingBox();
  expect(confirmBox.height).toBeGreaterThanOrEqual(44);
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  await confirm.click();

  await expect(page.locator('#ps-upload-status')).toContainText('2 rows are in use');
  await expect(page.locator('#q-results')).toContainText('D10 (statins): 0 of 1 adherent');
  await expect(page.locator('#q-results')).toContainText('Smith, Ann');

  await page.locator('#ps-year').fill('2025');
  await expect(page.locator('#q-results')).toContainText('No fill falls in the measurement year.');
  await page.locator('#ps-year').fill('2026');
  await expect(page.locator('#q-results')).toContainText('D10 (statins): 0 of 1 adherent');

  await page.locator('#ps-fills').fill('Bo, D10, 2026-01-01, 30, rosuvastatin');
  await expect(page.locator('#ps-upload-status')).toHaveText('Using the fills entered above.');
  await expect(page.locator('#q-results')).toContainText('fewer than 2 fills');
  expect(offOrigin).toEqual([]);
});

test('required columns block a file until the reader maps them', async ({ page }) => {
  await page.goto('/#pdc-star');
  const originalResult = await page.locator('#q-results').textContent();
  await page.locator('#ps-upload-file').setInputFiles({
    name: 'incomplete.tsv',
    mimeType: 'text/tab-separated-values',
    buffer: Buffer.from('patient\tmeasure\tfill_date\tdays_supply\nAnn\tD10\t2026-01-05\t30'),
  });

  await expect(page.locator('#ps-upload-status')).toContainText('Choose file columns for: Ingredient');
  await page.getByRole('button', { name: 'Use 1 rows' }).click();
  await expect(page.locator('#ps-upload-status')).toHaveText('Choose a column for Ingredient.');
  await expect(page.locator('#q-results')).toHaveText(originalResult);
});
