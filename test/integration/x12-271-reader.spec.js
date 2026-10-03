import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { expectNoHScroll } from '../lib/no-hscroll.js';

function eligibilityResponse() {
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = [
    'ST*271*0001*005010X279A1', 'BHT*0022*11*TRACK*20260928*1200',
    'HL*1**20*1', 'NM1*PR*2*PLAN*****PI*842610001',
    'HL*2*1*21*1', 'NM1*1P*2*CLINIC*****XX*1234567893',
    'HL*3*2*22*0', 'NM1*IL*1*DOE*JANE****MI*MEMBER-1', 'REF*6P*GROUP-7', 'REF*IG*POLICY-99',
    'EB*1*IND*30***23*****Y', 'DTP*356*D8*20260101', 'DTP*357*D8*20261231', 'MSG*Subscriber address 1 Main Street',
    'EB*C*IND*30***23*1500*****Y', 'EB*C*IND*30***29*1112.40*****Y',
  ];
  set.push(`SE*${set.length + 1}*0001`);
  return [isa, 'GS*HB*SENDER*RECEIVER*20260928*1200*1*X*005010X279A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('271 reader accepts a file and pasted response and redacts patient identifiers', async ({ page }) => {
  const offOrigin = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://localhost:4173') offOrigin.push(request.url()); });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#x12-271-reader');
  const response = eligibilityResponse();
  await page.locator('#x271-file').setInputFiles({ name: 'eligibility.271', mimeType: 'text/plain', buffer: Buffer.from(response) });
  await expect(page.locator('#x271-status')).toHaveText('1 response read.');
  await expect(page.locator('#q-results')).toContainText('1 active and 0 inactive people reported across 3 benefit lines.');
  await expect(page.locator('#q-results')).toContainText('Individual Deductible in network: $1,500.00 for the calendar year; $1,112.40 remaining.');
  await expect(page.locator('#q-results')).toContainText('C');
  await expect(page.locator('#q-results')).toContainText('Deductible');
  await expectNoHScroll(page, 'x12-271-reader');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('eligibility-271-redacted-benefits.csv');
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).not.toContain('JANE DOE'); expect(csv).not.toContain('MEMBER-1'); expect(csv).not.toContain('POLICY-99'); expect(csv).not.toContain('1 Main Street');
  expect(csv).toContain('[REDACTED]'); expect(csv).toContain('1500.00');

  await page.locator('#x271-paste').fill(response);
  await page.getByRole('button', { name: 'Read pasted response' }).click();
  await expect(page.locator('#x271-status')).toHaveText('1 response read.');
  await expect(page.locator('#q-results')).toContainText('Showing all 3 benefit lines.');
  expect(offOrigin).toEqual([]);
});
