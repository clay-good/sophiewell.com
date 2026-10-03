// spec-v1512 tool 2: the dose calendar downloads as an .ics file.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.skip(({ browserName }) => browserName !== 'chromium', 'download handling is engine-agnostic; one engine');

test('the dates download as a calendar file with one event per dose', async ({ page }) => {
  await page.goto('/#dose-calendar');
  await page.fill('#dc-start', '2026-10-05');
  await page.fill('#dc-w2', '2');
  await page.fill('#dc-w3', '6');
  await page.fill('#dc-every', '8');
  await page.fill('#dc-count', '2');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download the dates as a calendar file (.ics)' }).click()]);
  expect(dl.suggestedFilename()).toBe('dose-calendar.ics');
  const ics = readFileSync(await dl.path(), 'utf8');
  expect((ics.match(/BEGIN:VEVENT/g) || []).length).toBe(5);
  expect(ics).toContain('SUMMARY:Maintenance dose 2');
});
