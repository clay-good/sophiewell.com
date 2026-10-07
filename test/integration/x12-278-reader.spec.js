// The X12 278 Prior Authorization Response Reader, driven through a real file (example-correctness lists it).
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

function response() {
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = ['ST*278*0001*005010X217', 'BHT*0007*11*000121797*20260930*1358*18', 'HL*1**20*1', 'NM1*X3*2*PLAN*****PI*12302', 'HL*2*1*21*1', 'NM1*1P*1*CLINIC****XX*1234567893', 'HL*3*2*22*1', 'NM1*IL*1*DOE*JANE****MI*MEMBER1',
    'HL*4*3*EV*1', 'TRN*2*TRACE-1*1311235567', 'HCR*A1*AUTH-1', 'DTP*AAH*RD8*20261001-20261229', 'HL*5*4*SS*0', 'SV1*HC:64483', 'HCR*A3**0B'];
  set.push(`SE*${set.length + 1}*0001`);
  return [isa, 'GS*HI*SENDER*RECEIVER*20260930*1358*1*X*005010X217', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('278 reader lists the denied service first with its raw codes, keeps the review number, and makes no network request', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#x12-278-reader');
  await page.locator('#x278-files').setInputFiles({ name: 'auth.278', mimeType: 'text/plain', buffer: Buffer.from(response()) });
  await expect(page.locator('#x278-status')).toHaveText('1 file read.');
  await expect(page.locator('#q-results')).toContainText('1 denied, 0 rejected, 0 pended, 1 approved and 0 other decisions.');
  const rows = page.locator('#q-results tbody tr');
  await expect(rows.nth(0)).toContainText('denied'); await expect(rows.nth(0)).toContainText('64483'); await expect(rows.nth(0)).toContainText('0B');
  await expect(rows.nth(1)).toContainText('AUTH-1');
  await expectNoHScroll(page, 'x12-278-reader');
  expect(offOrigin).toEqual([]);
});
