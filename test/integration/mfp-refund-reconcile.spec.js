// spec-v1510 tool 7: typed claims against an MTF 835, read on the page.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';
import { mtf835 } from '../lib/mtf-835.js';

const remit = mtf835([
  { rx: '1234567', fill: '0', sdra: 300, paid: 300, mtf: 'M1', dos: '20260302' },
  { rx: '1234568', fill: '1', sdra: 300, paid: 0, mtf: 'M2', dos: '20260303', rarc: 'N908' },
], '20260331');

test('claims matched to the MTF 835: a late refund, a short one with its reason, a missing one', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#mfp-refund-reconcile');
  await page.fill('#mrr-claims', '1234567, 0, 2026-03-02, 00169413212, 30\n1234568, 1, 2026-03-03, 00169413212, 30\n1234570, 0, 2026-02-01, 00169413212, 30');
  await page.locator('#mrr-835').setInputFiles({ name: 'mtf.835', mimeType: 'text/plain', buffer: Buffer.from(remit) });
  const out = page.locator('#q-results');
  await expect(out).toContainText('3 claims as of 2026-03-31: 0 refunded, 1 short, 1 late, 1 missing, 0 paid more than once, 0 not yet due.');
  await expect(out).toContainText('paid 2026-03-31, after the expected 2026-03-30');
  await expect(out).toContainText('N908');
  await expect(page.locator('#mrr-status')).toContainText('2 refund claims read from 1 file.');
  await expectNoHScroll(page, 'mfp-refund-reconcile');
});
