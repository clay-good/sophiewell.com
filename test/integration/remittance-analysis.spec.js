import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

function era(date, payer, claims) {
  const body = [`BPR*I*${claims.reduce((sum, claim) => sum + claim.paid, 0).toFixed(2)}*C*CHK************${date}`, `TRN*1*TRACE-${date}*12345`, `N1*PR*${payer}`];
  claims.forEach((claim) => body.push(
    `CLP*${claim.account}*1*${claim.billed.toFixed(2)}*${claim.paid.toFixed(2)}*0**P-${claim.account}`,
    'NM1*82*1*CLINICIAN*SAM****XX*1234567890',
    `SVC*HC:${claim.code}${claim.modifier ? `:${claim.modifier}` : ''}*${claim.billed.toFixed(2)}*${claim.paid.toFixed(2)}`,
    `CAS*CO*${claim.reason}*${(claim.billed - claim.paid).toFixed(2)}`,
  ));
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = ['ST*835*0001', ...body]; set.push(`SE*${set.length + 1}*0001`);
  return [isa, 'GS*HP*SENDER*RECEIVER*20260928*1200*1*X*005010X221A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('denial pattern groups two payment months and exports redacted detail', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#denial-pattern-report');
  await page.locator('#dpr-files').setInputFiles([
    { name: 'aug.835', mimeType: 'text/plain', buffer: Buffer.from(era('20260831', 'Alpha Plan', [{ account: 'A-001', billed: 200, paid: 150, code: '99213', reason: '45' }])) },
    { name: 'sep.835', mimeType: 'text/plain', buffer: Buffer.from(era('20260930', 'Beta Plan', [{ account: 'B-002', billed: 220, paid: 120, code: '99214', reason: '50' }])) },
  ]);
  await expect(page.locator('#dpr-status')).toHaveText('2 files analyzed.');
  await expect(page.locator('#q-results')).toContainText('2 adjustments total $150.00.');
  await expect(page.locator('#q-results')).toContainText('2026-09 changed by $50.00 from 2026-08 (100%).');
  await expect(page.locator('#q-results')).toContainText('Medical necessity or coverage');
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const csv = await readFile(await (await downloadPromise).path(), 'utf8');
  expect(csv).not.toContain('A-001'); expect(csv).not.toContain('B-002'); expect(csv).toContain('[REDACTED]');
  expect(offOrigin).toEqual([]);
});

test('underpayment check maps a fee schedule and flags a one-cent variance', async ({ page }) => {
  await page.goto('/#underpayment-check');
  const remittance = era('20260930', 'Example Plan', [
    { account: 'EXACT', billed: 200, paid: 150, code: '99213', modifier: '25', reason: '45' },
    { account: 'LOW', billed: 200, paid: 149.99, code: '99213', modifier: '25', reason: '45' },
  ]);
  await page.locator('#upc-remittances').setInputFiles({ name: 'payment.835', mimeType: 'text/plain', buffer: Buffer.from(remittance) });
  await expect(page.locator('#upc-status')).toContainText('1 remittance file is ready');
  await page.locator('#upc-fees').setInputFiles({ name: 'fees.csv', mimeType: 'text/csv', buffer: Buffer.from('billing_code,modifier,contracted_amount\n99213,25,150.00') });
  await expect(page.locator('#upc-status')).toContainText('Review the fee schedule columns');
  await page.getByRole('button', { name: 'Use 1 fee rows' }).click();
  await expect(page.locator('#q-results')).toContainText('1 of 2 matched lines was paid below contract, totaling $0.01.');
  await expect(page.locator('#q-results')).toContainText('Example Plan');
  await expect(page.locator('#q-results')).toContainText('99213');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download results CSV' }).click();
  const csv = await readFile(await (await downloadPromise).path(), 'utf8');
  expect(csv).toContain('LOW'); expect(csv).not.toContain('EXACT'); expect(csv).toContain('150.00,149.99,0.01');
});
