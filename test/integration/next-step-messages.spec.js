// spec-v1257: the two dynamic next-step messages reach the browser verbatim.
import { test, expect } from '@playwright/test';

test('the spinal epidural abscess pathway asks for the sedimentation rate', async ({ page }) => {
  await page.goto('/#sea-guideline');

  await page.locator('#sea-injectiondruguse').check();
  await page.locator('#sea-esr').fill('');
  await expect(page.locator('#q-results')).toContainText('Enter the sedimentation rate');
});

test('the Lyme algorithm asks for the second-tier result', async ({ page }) => {
  await page.goto('/#lyme-two-tier');

  await page.locator('#lyme-firsttier').selectOption('positive');
  await page.locator('#lyme-secondtier').selectOption('not-done');
  await expect(page.locator('#q-results')).toContainText('Enter the second-tier result');
});
