// spec-v1512 tool 5: two products found by name in the fetched Orange Book, picked, and decided.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

test('the preface\'s own example: Procardia XL (AB2) and an AB1 nifedipine are not substitutable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#substitution-check');
  await page.fill('#sub-rx-name', 'Procardia XL 30MG');
  await page.fill('#sub-shelf-name', 'nifedipine Aurobindo 30MG');
  const out = page.locator('#q-results');
  await expect(out).toContainText('Not substitutable: the ratings differ (AB2 prescribed, AB1 on the shelf).');
  await expect(out).toContainText('FDA Orange Book, 20');
  await expectNoHScroll(page, 'substitution-check');
});

test('an AB2 generic of the same reference is substitutable, subject to state law', async ({ page }) => {
  await page.goto('/#substitution-check');
  await page.fill('#sub-rx-name', 'Procardia XL 30MG');
  await page.fill('#sub-shelf-name', 'nifedipine Osmotica 30MG');
  await expect(page.locator('#q-results')).toContainText('Substitutable at the pharmacy (subject to state law): both products are rated AB2.');
});

test('a name that finds several products waits for a pick', async ({ page }) => {
  await page.goto('/#substitution-check');
  await page.fill('#sub-rx-name', 'Humira 40MG/0.8ML');
  await page.fill('#sub-shelf-name', 'Abrilada 40MG/0.8ML Autoinjector');
  await expect(page.locator('#q-results')).toContainText('Choose the prescribed product.');
  const rx = page.locator('#sub-rx-pick');
  const label = await rx.locator('option', { hasText: /^Humira 40MG\/0\.8ML, autoinjector/ }).first().textContent();
  await rx.selectOption({ label });
  await expect(page.locator('#q-results')).toContainText('Substitutable at the pharmacy (subject to state law): the product on the shelf is licensed as interchangeable');
});
