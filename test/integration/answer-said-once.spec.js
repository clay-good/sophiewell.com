// The answer is stated once.
//
// 45 tiles wrote their result as a heading and then a sentence that opened
// with exactly that heading -- "CPOT 0 of 8" above "CPOT 0 of 8: acceptable
// pain per Gelinas 2006 (cutoff <3)." The reader parsed the same words twice
// before reaching the part that was new, and a screen reader read them twice.
//
// lib/long-note.js `mergeRepeatedAnswer` gives the heading the sentence's
// words and drops the duplicate line. This is the only place the result is
// visible: it is a property of what the renderer wrote, not of any one view.
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

test('no tile opens its answer with a line the next line repeats', async ({ page }) => {
  test.setTimeout(900_000);
  await page.goto('/');
  const ids = await page.evaluate(async () => Object.keys((await import('/lib/meta.js')).META));
  expect(ids.length).toBeGreaterThan(1500);

  const doubled = [];
  for (const id of ids) {
    await page.goto(`/#${id}`);
    const hit = await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 40));
      const live = document.querySelector('#q-results');
      if (!live) return null;
      for (const head of live.querySelectorAll('h2, h3')) {
        if (head.children.length) continue;
        const next = head.nextElementSibling;
        if (!next || next.tagName !== 'P' || next.children.length) continue;
        const short = (head.textContent || '').replace(/\s+/g, ' ').trim();
        const full = (next.textContent || '').replace(/\s+/g, ' ').trim();
        if (short.length >= 6 && full.length > short.length && full.startsWith(short)
          && /^[\s:;,.(]/.test(full.charAt(short.length))) return `"${short}" then "${full.slice(0, 70)}"`;
      }
      return null;
    });
    if (hit) doubled.push(`${id}: ${hit}`);
  }

  expect(doubled, `${doubled.length} tiles state their answer twice`).toEqual([]);
});

// The merge has to survive a recompute, because the renderer rewrites the
// whole region on every keystroke and the duplicate comes back with it.
test('the merge holds after the reader changes an input', async ({ page }) => {
  await page.goto('/#cpot', { waitUntil: 'load' });
  const first = () => page.evaluate(() => {
    const live = document.querySelector('#q-results');
    return [...live.children].map((n) => `${n.tagName}|${(n.textContent || '').replace(/\s+/g, ' ').trim()}`);
  });
  expect((await first())[0]).toContain('acceptable pain');

  // Move a scored select, which makes the renderer write the region again.
  const sel = page.locator('#tool-body select').first();
  await sel.selectOption({ index: 1 });
  const after = await first();
  expect(after[0], 'the heading still carries the whole reading').toMatch(/CPOT \d+ of 8: /);
  expect(after.filter((l) => l.startsWith('P|CPOT')), 'and the duplicate line has not come back').toEqual([]);
});
