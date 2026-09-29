import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('appeal worklist maps a claim file, sorts deadlines and redacts references', async ({ page }) => {
  await page.goto('/#appeal-worklist');
  await page.locator('#aw-asof').fill('2026-09-26');
  const csv = [
    'claim id,payer,denial date,denied amount,appeal days',
    'C-100,medicare,2026-08-01,1200,',
    'C-101,ma,2026-08-20,5400,',
    'C-102,medicaid,2026-09-01,800,90',
    'C-103,ma,2026-06-01,300,',
  ].join('\n');
  await page.locator('#aw-upload-file').setInputFiles({ name: 'claims.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#aw-upload-status')).toContainText('Review the proposed columns');
  await page.getByRole('button', { name: 'Use 4 rows' }).click();
  await expect(page.locator('#aw-upload-status')).toContainText('4 rows are in use');
  await expect(page.locator('#q-results')).toContainText('3 claims still appealable');
  await expect(page.locator('#q-results')).toContainText('first due: C-101');
  await expect(page.locator('.upload-file-results')).toContainText('past deadline');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted CSV' }).click();
  const output = await readFile(await (await downloadPromise).path(), 'utf8');
  expect(output).not.toContain('C-100'); expect(output).not.toContain('C-101');
  expect(output).toContain('[REDACTED]'); expect(output).toContain('sophiewell_appeal_due');
});

function era(date, payer, account, reason, amount) {
  const isa = 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *260928*1200*^*00501*000000001*0*P*:';
  const set = [
    'ST*835*0001', `BPR*I*${(200 - amount).toFixed(2)}*C*CHK************${date}`, `N1*PR*${payer}`,
    `CLP*${account}*1*200.00*${(200 - amount).toFixed(2)}*0**P-${account}`,
    `SVC*HC:99214*200.00*${(200 - amount).toFixed(2)}`, `CAS*CO*${reason}*${amount.toFixed(2)}`,
  ];
  set.push(`SE*${set.length + 1}*0001`);
  return [isa, 'GS*HP*SENDER*RECEIVER*20260928*1200*1*X*005010X221A1', ...set, 'GE*1*1', 'IEA*1*000000001'].join('~') + '~';
}

test('appeal worklist reads 835 files after explicit payer mapping', async ({ page }) => {
  await page.goto('/#appeal-worklist');
  await page.locator('#aw-asof').fill('2026-09-26');
  await page.locator('#aw-835-files').setInputFiles([
    { name: 'alpha.835', mimeType: 'text/plain', buffer: Buffer.from(era('20260901', 'Alpha Plan', 'A-100', 50, 100)) },
    { name: 'beta.835', mimeType: 'text/plain', buffer: Buffer.from(era('20260901', 'Beta Employer Plan', 'B-200', 197, 80)) },
  ]);
  await expect(page.locator('#aw-835-status')).toContainText('Choose the payer type');
  await page.getByLabel('Payer type for Alpha Plan').selectOption('ma');
  await page.getByLabel('Payer type for Beta Employer Plan').selectOption('employer');
  await page.getByRole('button', { name: 'Build worklist for 2 claims' }).click();
  await expect(page.locator('#q-results')).toContainText('2 claims still appealable');
  await expect(page.locator('#q-results')).toContainText('first due: A-100 by November 5, 2026');
  await expect(page.locator('#aw-835-results')).toContainText('Beta Employer Plan');
  await expect(page.locator('#aw-835-results')).toContainText('2027-02-28');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download redacted 835 worklist CSV' }).click();
  const output = await readFile(await (await downloadPromise).path(), 'utf8');
  expect(output).not.toContain('A-100'); expect(output).not.toContain('B-200');
  expect(output).toContain('[REDACTED]'); expect(output).toContain('payer_type');
});
