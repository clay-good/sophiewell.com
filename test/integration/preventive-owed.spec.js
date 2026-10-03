// spec-v1601 tool 1: the USPSTF list filtered to a person, with blanks as questions.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

test('a 52-year-old woman: what is owed at $0, with the USPSTF words and links, and what depends on an answer', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#preventive-owed');
  await page.fill('#pow-age', '52');
  await page.selectOption('#pow-sex', 'female');
  await page.selectOption('#pow-preg', 'no');
  await page.selectOption('#pow-plan', 'private');
  await page.fill('#pow-start', '2027-01-01');
  const out = page.locator('#q-results');
  await expect(out).toContainText('Covered at $0 in network');
  await expect(out).toContainText('The USPSTF recommends screening for colorectal cancer in all adults aged 50 to 75 years.');
  await expect(out).toContainText('Depends on an answer');
  await expect(out).toContainText('Do they have a personal or family history of breast, ovarian, tubal or peritoneal cancer');
  await expect(out.getByRole('link', { name: 'The recommendation at uspreventiveservicestaskforce.org' }).first()).toHaveAttribute('href', /uspreventiveservicestaskforce\.org\/uspstf\/recommendation\//);
  await expectNoHScroll(page, 'preventive-owed');
});

test('answering a risk question moves its recommendation; a grandfathered plan gets no list', async ({ page }) => {
  await page.goto('/#preventive-owed');
  await page.fill('#pow-age', '70');
  await page.selectOption('#pow-sex', 'male');
  await page.selectOption('#pow-plan', 'private');
  await page.fill('#pow-start', '2027-01-01');
  await page.getByText('Questions some recommendations turn on').click();
  await page.selectOption('#pow-risk-ever-smoked', 'yes');
  const owed = page.locator('#q-results ul').filter({ hasText: 'Abdominal Aortic Aneurysm' });
  await expect(owed.first()).toBeVisible();
  await page.selectOption('#pow-plan', 'grandfathered');
  await expect(page.locator('#q-results')).toContainText('A grandfathered plan is not required to cover these recommendations');
});
