// spec-v1006: an incomplete score may rule IN. It must never rule OUT.
//
// test/mcp/incomplete-does-not-rule-out.test.js proves the libraries refuse. This
// proves the READER sees the refusal, which is a different code path and the one
// that was still broken after the libraries were fixed: four of these renderers
// read their inputs with `nv(id)`, which is `Number(input.value)`, and
// `Number('')` is 0. So a cleared form reached the library as a form full of
// zeros -- every value "present", none of them missing -- and the guard never
// fired. They read with `nvOrNull` now, the same reader `mods` was moved to at
// spec-v930 for the same reason.
//
// The check is what a reader actually does: open the tile, clear the fields, and
// start typing their own numbers.

import { test, expect } from '@playwright/test';
const CASES = [
  ['lrinec', 'Enter all six LRINEC labs'],
  ['mods', 'Enter all six MODS organ systems'],
  ['carpenter-coustan', 'Enter all four Carpenter-Coustan draws'],
  ['iadpsg', 'Enter all three IADPSG draws'],
  ['nutric', 'Enter the NUTRIC inputs'],
  ['mnutric', 'Enter the mNUTRIC inputs'],
  ['rome-ecopd', 'Measure all five Rome variables'],
];
for (const [id, want] of CASES) {
  test(`${id}: clearing every field shows a prompt`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await page.waitForSelector('#q-results');
    await page.waitForTimeout(400);
    await page.evaluate(() => {
      const skip = new Set(['hero-search', 'topbar-search', 'q']);
      for (const el of document.querySelectorAll('input')) {
        if (skip.has(el.id) || el.type === 'search' || el.closest('form[role="search"]')) continue;
        if (el.type === 'checkbox' || el.type === 'radio') { el.checked = false; }
        else { el.value = ''; }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(300);
    const text = await page.locator('#q-results').innerText();
    expect(text, `${id} output`).toContain(want);
    expect(text).not.toMatch(/\bnull\b/);
    expect(text).not.toMatch(/\bNaN\b/);
  });
}
