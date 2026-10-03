// spec-v1501 §4: a letter builder's Word download is the letter on the page, with the blanks banner.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('the ERISA appeal letter downloads as a .docx that carries its blanks banner and its text', async ({ page }) => {
  await page.goto('/#erisa-appeal-letter');
  await expect(page.locator('#q-results')).toContainText('1 blank left to fill before sending.');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#docx-btn').click()]);
  expect(download.suggestedFilename()).toMatch(/\.docx$/);
  const bytes = readFileSync(await download.path());
  expect([...bytes.subarray(0, 2)]).toEqual([0x50, 0x4b]);
  const text = bytes.toString('utf8');
  expect(text).toContain('NOT READY TO SEND: 1 blank in [brackets]');
  expect(text).toContain('Pat Doe');
});
