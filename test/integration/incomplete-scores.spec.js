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
// spec-v1007: the second wave. These six renderers already read with `optNum`, so
// what is proved here is the other half -- that the view prints the refusal rather
// than a `null` total or a `NaN` percentage where the reading used to be.
//
// Two of them mix in pickers, and a picker is an ANSWER, not a gap -- so clearing
// the inputs alone leaves `mehran-cin` with its example's "congestive heart
// failure: yes" and 8 real points, which correctly still bands. These cases send
// every picker back to its first option (the negative answer) as well, which is
// the state a reader who has answered the questions but has no labs is in.
const CASES_V1007 = [
  ['bard-score', 'Enter the rest of BARD'],
  ['hscore-hlh', 'Enter the HScore measurements'],
  ['tash-score', 'Enter the four TASH measurements'],
  ['rabt-score', 'to compute the shock index'],
  ['alt-70', 'Enter the three ALT-70 measurements'],
  ['mehran-cin', 'Enter the rest of the Mehran score'],
];
const RESET_PICKERS = new Set(CASES_V1007.map(([id]) => id));
for (const [id, want] of [...CASES, ...CASES_V1007]) {
  test(`${id}: clearing every field shows a prompt`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await page.waitForSelector('#q-results');
    await page.waitForTimeout(400);
    await page.evaluate((resetPickers) => {
      if (resetPickers) {
        for (const sel of document.querySelectorAll('#q-view select, #tool select, select')) {
          if (sel.closest('form[role="search"]') || !sel.options.length) continue;
          sel.selectedIndex = 0;
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const skip = new Set(['hero-search', 'topbar-search', 'q']);
      for (const el of document.querySelectorAll('input')) {
        if (skip.has(el.id) || el.type === 'search' || el.closest('form[role="search"]')) continue;
        if (el.type === 'checkbox' || el.type === 'radio') { el.checked = false; }
        else { el.value = ''; }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, RESET_PICKERS.has(id));
    await page.waitForTimeout(300);
    const text = await page.locator('#q-results').innerText();
    expect(text, `${id} output`).toContain(want);
    expect(text).not.toMatch(/\bnull\b/);
    expect(text).not.toMatch(/\bNaN\b/);
  });
}
