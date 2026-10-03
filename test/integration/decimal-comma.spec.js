// spec-v1542 §3: a decimal comma typed into a number field. Before this, 37,5 became 375 in Chromium (every
// locale) and in WebKit with an English locale. Now a decimal comma reads as a point in every engine and
// locale, and a comma that could be a thousands separator empties the field with a note.
import { test, expect } from '@playwright/test';

const result = (page) => page.locator('#q-results').innerText();

async function typeInto(page, sel, text) {
  await page.locator(sel).fill('');
  await page.locator(sel).click();
  await page.keyboard.type(text);
  await page.waitForTimeout(150);
}

for (const locale of ['en-US', 'fr-FR', 'es-PE', 'pt-BR']) {
  test.describe(locale, () => {
    test.use({ locale });
    test(`70,5 reads as 70.5, never 705; 1,500 is refused (${locale})`, async ({ page }) => {
      await page.goto('/#bmi');
      await expect(page.locator('#w')).toBeVisible();
      await typeInto(page, '#w', '70.5');
      const dot = await result(page);
      await typeInto(page, '#w', '70,5');
      expect(await page.locator('#w').inputValue()).toBe('70.5');
      expect(await result(page)).toBe(dot);
      await expect(page.locator('.decimal-comma-note')).toContainText('The comma was read as a decimal point: 70.5.');
      await typeInto(page, '#w', '705');
      expect(await result(page)).not.toBe(dot);
      await typeInto(page, '#w', '1,500');
      expect(await page.locator('#w').inputValue()).toBe('');
      await expect(page.locator('.decimal-comma-note')).toContainText('1,500 could be a decimal or a thousands separator');
    });
  });
}
