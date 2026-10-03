// spec-v1510 tool 2: nadac-margin prices a claim from the NADAC week it fetches. The week is served
// from a fixed fixture here, because the real one is refreshed weekly and its prices move.

import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const ROW = { ndc: '00002143380', description: 'TRULICITY 0.75 MG/0.5 ML PEN', perUnit: 487.57264, effectiveDate: '2026-09-23', pricingUnit: 'ML' };
const MANIFEST = { dataset: 'nadac', shardLayout: 'shards', coverage: 'full', fetchedAt: '2026-09-29', expiresOn: '2099-01-01', shards: [{ name: '00002.json' }] };

async function fixedWeek(page) {
  const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/data/nadac/manifest.json', (r) => r.fulfill(json(MANIFEST)));
  await page.route('**/data/nadac/week.json', (r) => r.fulfill(json({ asOfDate: '2026-09-30' })));
  await page.route('**/data/nadac/shards/00002.json', (r) => r.fulfill(json([ROW])));
}

test('a claim one cent below NADAC is flagged; other dates and NDCs get no benchmark', async ({ page }) => {
  await fixedWeek(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#nadac-margin');
  const out = page.locator('#q-results');
  await page.fill('#nm-cost', '');
  await page.fill('#nm-ndc', '0002-1433-80');
  await page.fill('#nm-dos', '2026-09-25');
  await page.fill('#nm-qty', '2');
  await page.fill('#nm-paid', '975.14');
  await expect(out).toContainText('NADAC $487.57264 per mL, effective Sep 23, 2026, times 2 = $975.15');
  await expect(out).toContainText('$0.01 below NADAC');
  await expect(out).toContainText('Below cost by $0.01');
  await expectNoHScroll(page, 'nadac-margin');

  await page.fill('#nm-dos', '2026-09-01');
  await expect(out).toContainText('No benchmark: this NDC\'s NADAC took effect Sep 23, 2026');
  await page.fill('#nm-dos', '2026-09-25');
  await page.fill('#nm-ndc', '00003-0000-01');
  await expect(out).toContainText('NDC 00003-0000-01 is not in the NADAC week of Sep 30, 2026');
});

test('a claims CSV gives margin by payer and drug, with NADAC the page loaded', async ({ page }) => {
  await fixedWeek(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#nadac-margin');
  const csv = 'NDC,Qty,Date filled,Total paid,Plan\n00002-1433-80,2,2026-09-24,975.14,Plan X\n00002-1433-80,2,2026-09-25,1000,Plan Y\n00003-0000-01,1,2026-09-25,5,Plan Y\n';
  await page.locator('#nm-upload-file').setInputFiles({ name: 'claims.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  const w = page.locator('#nm-batch');
  await expect(w).toContainText('2 of 3 claims priced: reimbursed $1,975.14 against a cost of $1,950.30, a margin of $24.84.');
  await expect(w).toContainText('Paid below cost overall: Plan X (-$0.01 on 1 claim)');
  await expect(w.locator('caption', { hasText: 'Margin by payer, lowest first' })).toBeVisible();
  await expect(page.locator('.upload-file-results')).toContainText('Data: nadac');
  await expectNoHScroll(page, 'nadac-margin batch');
});
