import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expectNoHScroll } from '../lib/no-hscroll.js';

function claimFile() {
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = [
    'ST*837*0001*005010X222A1', 'BHT*0019*00*BATCH*20260928*1200*CH',
    'HL*1**20*1', 'NM1*85*2*CLINIC*****XX*1234567893',
    'HL*2*1*22*0', 'NM1*IL*1*DOE*JANE****MI*1EG4TE5MK73', 'NM1*PR*2*MEDICARE*****PI*00882',
    'CLM*CLEAN-1*100***11:B:1*Y*A*Y*I', 'HI*ABK:M5450', 'LX*1', 'SV1*HC:99213*100*UN*1***1', 'DTP*472*D8*20260920',
    'CLM*BAD-2*100***11:B:1*Y*A*Y*I', 'NM1*82*1*CLINICIAN*SAM****XX*1234567890', 'HI*ABK:123', 'LX*1', 'SV1*HC:99214*90*UN*1***1', 'DTP*472*D8*20260920',
  ];
  set.push(`SE*${set.length + 1}*0001`);
  return [isa, 'GS*HC*SENDER*RECEIVER*20260928*1200*1*X*005010X222A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('837 checker reports claim findings and exports patient-redacted results', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#x12-837-check');
  await page.locator('#x837-files').setInputFiles({ name: 'claims.837', mimeType: 'text/plain', buffer: Buffer.from(claimFile()) });
  await expect(page.locator('#x837-status')).toHaveText('1 file checked.');
  await expect(page.locator('#q-results')).toContainText('1 of 2 claims passed all checks; 1 failed.');
  await expect(page.locator('#q-results')).toContainText('charge total at segment');
  await expect(page.locator('#q-results')).toContainText('ICD-10-CM at segment');
  await expect(page.locator('#q-results')).toContainText('NPI at segment');
  await expectNoHScroll(page, 'x12-837-check');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('claims-837-check-redacted-results.csv');
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).not.toContain('JANE DOE'); expect(csv).not.toContain('1EG4TE5MK73'); expect(csv).not.toContain('CLEAN-1');
  expect(csv).toContain('[REDACTED]'); expect(csv).toContain('100.00,90.00');
  expect(offOrigin).toEqual([]);
});
