import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

function claimStatusResponse() {
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = [
    'ST*277*0001*005010X214', 'BHT*0085*08*BATCH*20260928*1200*TH',
    'HL*1**20*1', 'HL*2*1*21*1', 'HL*3*2*19*1', 'NM1*85*2*CLINIC',
    'HL*4*3*PT*0', 'NM1*QC*1*DOE*JANE****MI*MEMBER-1', 'TRN*2*TRACE-ACCEPT', 'STC*A2:20:PR*20260928*WQ*100', 'REF*D9*ACCEPT-1',
    'HL*5*3*PT*0', 'NM1*QC*1*ROE*JOHN****MI*MEMBER-2', 'TRN*2*TRACE-REJECT', 'STC*A8:496:85*20260928*U*200*****A7:178', 'REF*D9*REJECT-2',
  ];
  set.push(`SE*${set.length + 1}*0001`);
  return [isa, 'GS*HN*SENDER*RECEIVER*20260928*1200*1*X*005010X214', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('277 reader puts rejections first, links raw codes and redacts claim identifiers', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#x12-277-reader');
  await page.locator('#x277-files').setInputFiles({ name: 'status.277', mimeType: 'text/plain', buffer: Buffer.from(claimStatusResponse()) });
  await expect(page.locator('#x277-status')).toHaveText('1 file read.');
  await expect(page.locator('#q-results')).toContainText('1 rejected, 0 pending and 1 accepted claims.');
  const rows = page.locator('#q-results tbody tr');
  await expect(rows.nth(0)).toContainText('REJECT-2'); await expect(rows.nth(0)).toContainText('A8'); await expect(rows.nth(0)).toContainText('496');
  await expect(rows.nth(1)).toContainText('ACCEPT-1');
  await expect(page.getByRole('link', { name: 'Look up raw codes' })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Look up raw codes' }).first()).toHaveAttribute('href', 'https://x12.org/codes');
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('status-277-redacted-claims.csv');
  const csv = await readFile(await download.path(), 'utf8');
  for (const sensitive of ['REJECT-2', 'ACCEPT-1', 'TRACE-REJECT', 'JOHN ROE', 'MEMBER-2']) expect(csv).not.toContain(sensitive);
  expect(csv).toContain('[REDACTED]'); expect(csv.indexOf('rejected')).toBeLessThan(csv.indexOf('accepted'));
  expect(offOrigin).toEqual([]);
});

