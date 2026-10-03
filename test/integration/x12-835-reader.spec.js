import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const ERA = [
  'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:',
  'GS*HP*SENDER*RECEIVER*20260928*1200*1*X*005010X221A1',
  'ST*835*0001', 'BPR*I*120*C*CHK************20260928', 'TRN*1*TRACE-1*12345',
  'CLP*ACCT-1*1*200*120*30**PCN-1', 'NM1*QC*1*DOE*JANE****MI*MEMBER-1',
  'SVC*HC:99213*200*120', 'CAS*CO*45*50', 'CAS*PR*1*30',
  'SE*9*0001', 'GE*1*1', 'IEA*1*000000001',
].join('~') + '~';

test('835 reader proves balances and exports a patient-redacted claim table', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url());
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#x12-835-reader');
  await page.locator('#x835-files').setInputFiles({ name: 'era.835', mimeType: 'text/plain', buffer: Buffer.from(ERA) });
  await expect(page.locator('#x835-status')).toHaveText('1 file read.');
  await expect(page.locator('#q-results')).toContainText('1 of 1 claims balance; 1 of 1 payments reconcile.');
  await expect(page.locator('#q-results')).toContainText('Patient responsibility');
  await expect(page.locator('#q-results')).toContainText('$30.00');
  await expectNoHScroll(page, 'x12-835-reader');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('era-835-reader-redacted-results.csv');
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).not.toContain('JANE DOE');
  expect(csv).not.toContain('MEMBER-1');
  expect(csv).not.toContain('ACCT-1');
  expect(csv).toContain('[REDACTED]');
  expect(csv).toContain('200.00,120.00,30.00');
  expect(offOrigin).toEqual([]);
});
