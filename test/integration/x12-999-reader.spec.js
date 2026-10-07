// The X12 999 Acknowledgment Reader, driven through a real file (example-correctness lists it as file-driven).
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

function acknowledgment() {
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = ['ST*999*0001*005010X231A1', 'AK1*HC*17*005010X222A1', 'AK2*837*0001*005010X222A1', 'IK5*A', 'AK2*837*0002*005010X222A1', 'IK3*NM1*12*2010BA*8', 'IK4*9*67*7*123', 'IK5*R*5', 'AK9*P*2*2*1'];
  set.push(`SE*${set.length + 1}*0001`);
  return [isa, 'GS*FA*SENDER*RECEIVER*20260928*1200*1*X*005010X231A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('999 reader lists the rejected set first with its error positions, and makes no network request', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#x12-999-reader');
  await page.locator('#x999-files').setInputFiles({ name: 'ack.999', mimeType: 'text/plain', buffer: Buffer.from(acknowledgment()) });
  await expect(page.locator('#x999-status')).toHaveText('1 file read.');
  await expect(page.locator('#q-results')).toContainText('1 rejected, 0 accepted with errors and 1 accepted transaction sets.');
  const rows = page.locator('#q-results tbody tr');
  await expect(rows.nth(0)).toContainText('0002');
  await expect(rows.nth(0)).toContainText('NM1@12 loop 2010BA code 8');
  await expect(rows.nth(1)).toContainText('0001');
  await expectNoHScroll(page, 'x12-999-reader');
  expect(offOrigin).toEqual([]);
});
