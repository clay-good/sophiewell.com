// spec-v1502 tool 3, batch: a CSV of authorizations becomes a renewal worklist sorted by submit-by date,
// in the upload Worker, with the same answer the form gives for each row.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

test('an authorization CSV gives a sorted renewal worklist and redactable downloads', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#auth-runout');
  await page.locator('#ar-asof').fill('2026-12-10');
  await page.locator('#ar-upload-file').setInputFiles({
    name: 'auths.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'auth number,start date,end date,units approved,units used,units per dose,interval days,next dose,lead days',
      'LATE-2,2026-06-01,2026-12-31,10,0,1,56,2026-07-06,14',
      'EARLY-1,2026-06-01,2026-11-30,4,1,1,56,2026-07-06,14',
      'BAD-3,2026-06-01,2026-11-30,4,,1,56,2026-07-06,14',
    ].join('\n')),
  });
  await expect(page.locator('#ar-upload-map-reference')).toHaveValue('0');
  await expect(page.locator('#ar-upload-map-next_dose')).toHaveValue('7');
  await page.getByRole('button', { name: 'Use 3 rows' }).click();
  const w = page.locator('#ar-worklist');
  await expect(w).toContainText('2 renewals scheduled');
  await expect(w).toContainText('1 already past due');
  await expect(w).toContainText('1 row needs corrected inputs');
  await expect(w.locator('ol li').first()).toContainText('EARLY-1: submit by 2026-12-07 (past due');
  await expect(w.locator('ol li').last()).toContainText('BAD-3: Enter the units or visits used so far');
  await expect(page.locator('.upload-file-results th')).toContainText(['sophiewell_submit_renewal_by', 'sophiewell_status']);
  await expectNoHScroll(page, 'auth-runout');
});
