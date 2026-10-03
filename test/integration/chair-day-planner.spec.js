// spec-v1512 tool 4: the chair planner from typed appointments and from a CSV in the upload Worker.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

test('typed appointments and an appointment CSV give the same first-fit day', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#chair-day-planner');
  const out = page.locator('#q-results');
  await expect(out).toContainText('3 of 3 appointments scheduled in 2 chairs from 08:00 to 12:00: 62.5% of chair time booked.');
  await expect(out).toContainText('Chair 2 (62.5% booked): 08:00-09:30 B, 09:30-10:30 C');
  await page.locator('#cdp-upload-file').setInputFiles({
    name: 'day.csv', mimeType: 'text/csv',
    buffer: Buffer.from('patient,chair time,premed,observation,start time\nA,120,15,15,08:00\nB,60,0,30,08:00\nC,60,0,0,09:00\nD,240,0,0,11:00\n'),
  });
  await page.getByRole('button', { name: 'Use 4 rows' }).click();
  await expect(out).toContainText('3 of 4 appointments scheduled');
  await expect(out).toContainText('D (240 minutes) does not fit from 11:00 before closing');
  await expect(page.locator('.upload-file-results th')).toContainText(['sophiewell_chair', 'sophiewell_start', 'sophiewell_status']);
  await expectNoHScroll(page, 'chair-day-planner');
});
