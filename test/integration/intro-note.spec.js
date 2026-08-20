import { test, expect } from '@playwright/test';

// The static explanation a tile writes into its own aria-live results region.
//
// 964 tiles appended 400 to 3,051 characters of constant prose inside
// `#q-results` on every recompute, so a screen reader re-announced all of it
// every time the reader changed an input, and the "More detail" fold could not
// reach it -- it will not walk into a live region, and it should not.
//
// The unit tests in test/unit/long-note.test.js pin the rule. This pins that it
// is actually reaching the page.
const TILES = ['shanghai-brugada', 'global-ards', 'magic-gvhd', 'mayo-adpkd'];

for (const id of TILES) {
  test(`${id}: the explanation sits above the results, not inside the live region`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await page.waitForSelector('#tool-body [aria-live]');
    await expect.poll(async () => page.evaluate(() => {
      const live = document.querySelector('#tool-body [aria-live]');
      return Array.from(live.children)
        .filter((n) => n.tagName === 'P' && n.classList.contains('muted'))
        .reduce((a, b) => Math.max(a, b.textContent.length), 0);
    })).toBeLessThanOrEqual(280);

    // ... and it is folded, so the page opens on a sentence rather than a wall.
    const folded = await page.evaluate(() => {
      const body = document.querySelector('#tool-body');
      const more = body.querySelector(':scope > details.note-more');
      if (!more) return null;
      const lead = more.previousElementSibling;
      return { summary: more.querySelector('summary').textContent.trim(), lead: lead.textContent.length, hidden: more.querySelector('p').textContent.length };
    });
    expect(folded).not.toBeNull();
    expect(folded.summary).toBe('More detail');
    // spec-v752 moved the answer to the top of the tool body, which changed
    // WHICH fold is first in document order: the hoisted intro note is parked
    // against the results region, so it now leads the body instead of trailing
    // whatever the view wrote. This assertion therefore measures the note this
    // file is named for, rather than an unrelated fold that happened to sit
    // earlier. global-ards' lead is 404 characters -- verified to be a single
    // sentence, with 2,511 more behind the disclosure -- so the bound moves to
    // fit one long sentence while still failing on a wall of text.
    expect(folded.lead).toBeLessThanOrEqual(450);
    expect(folded.hidden).toBeGreaterThan(80);
  });

  test(`${id}: recomputing does not stack a second copy of the explanation`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await page.waitForSelector('#tool-body [aria-live]');
    // Every long explanation on the tile is folded, the hoisted one and any
    // the view itself wrote, so the count is whatever it is -- what matters is
    // that recomputing does not add to it.
    const count = () => page.evaluate(() => document.querySelectorAll('#tool-body details.note-more').length);
    const before = await count();
    expect(before).toBeGreaterThanOrEqual(1);
    await page.evaluate(() => {
      const s = document.querySelector('#tool-body select');
      if (!s) return;
      s.selectedIndex = (s.selectedIndex + 1) % s.options.length;
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(200);
    expect(await count()).toBe(before);
    const stray = await page.evaluate(() => {
      const live = document.querySelector('#tool-body [aria-live]');
      return Array.from(live.children).filter((n) => n.tagName === 'P' && n.classList.contains('muted') && n.textContent.length > 280).length;
    });
    expect(stray).toBe(0);
  });
}
