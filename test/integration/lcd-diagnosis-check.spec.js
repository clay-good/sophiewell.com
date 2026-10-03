// spec-v1505 tool 3: lcd-diagnosis-check loads only the articles for the code, from fixed fixtures (the
// real MCD export changes weekly).
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const MANIFEST = { dataset: 'mcd-articles', shardLayout: 'shards', coverage: 'full', sourceEdition: '2026-09-28 weekly', fetchedAt: '2026-10-01', expiresOn: '2099-01-01', shards: [{ name: '52369.json' }], ancillary: ['index.json'] };
const ART = [{ id: '52369', version: '17', displayId: 'A52369', title: 'Billing and Coding: Knee Arthroscopy', states: ['NY', 'CT'], regions: ['New York - Upstate'], contractors: ['Wellpoint Federal'],
  codes: { 1: ['29877'] }, covered: { 1: ['M23.205'] }, noncovered: { 1: ['M17.11'] }, asterisked: [], paragraphs: { codes: {}, covered: {}, noncovered: { 1: 'Nationally non-covered (NCD 150.9).' } } }];

test('a diagnosis is read against the state\'s articles for the code', async ({ page }) => {
  const json = (body) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/data/mcd-articles/manifest.json', (r) => r.fulfill(json(MANIFEST)));
  await page.route('**/data/mcd-articles/index.json', (r) => r.fulfill(json({ 29877: [['52369', '1']] })));
  await page.route('**/data/mcd-articles/shards/52369.json', (r) => r.fulfill(json(ART)));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#lcd-diagnosis-check');
  const out = page.locator('#q-results');
  await page.fill('#lcd-code', '29877');
  await page.fill('#lcd-dx', 'M17.11');
  await page.selectOption('#lcd-state', 'NY');
  await expect(out).toContainText('At least one article does not accept these diagnoses for 29877 in NY (MCD export 2026-09-28 weekly).');
  await expect(out).toContainText('A52369 says: Nationally non-covered (NCD 150.9).');
  await expect(out).toContainText('A52369 applies only in New York - Upstate.');
  await expect(out.getByRole('link', { name: 'A52369: Billing and Coding: Knee Arthroscopy' })).toBeVisible();
  await page.fill('#lcd-dx', 'm23205');
  await expect(out).toContainText('The diagnoses support 29877 under the NY articles');
  await page.selectOption('#lcd-state', 'TX');
  await expect(out).toContainText('No billing and coding article for TX lists 29877');
  await expectNoHScroll(page, 'lcd-diagnosis-check');
});
