// A tile's explanation is written twice, by two hands: the renderer's intro
// note above the fields, and the `NOTE` constant in lib/<tile>.js that
// hoistIntroNote lifts out of the results region and parks below them. They are
// paraphrases rather than repeats, so `dropRestatedSentences` (verbatim) never
// saw them, and 420 tiles printed the same paragraph twice on one screen.
//
// `foldRestatedNote` folds the later one into a disclosure. These assert the
// three things that matter: it folds, it keeps every word, and it stays folded
// (hoistIntroNote runs a MutationObserver that parks the note it lifts, and an
// earlier attempt at this was quietly undone by it).

import { test, expect } from '@playwright/test';

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

async function bodyText(page) {
  return norm(await page.locator('.tool-body').innerText({ timeout: 5000 }).catch(() => ''));
}

test('ahlback-knee-oa states its explanation once, and keeps the other copy', async ({ page }) => {
  await page.goto('/#ahlback-knee-oa', { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const visible = await page.evaluate(() => {
    const body = document.querySelector('.tool-body');
    return [...body.children]
      .filter((e) => e.tagName === 'P' && e.classList.contains('muted'))
      .map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim());
  });
  // The intro stays where it is useful: above the fields.
  expect(visible.some((t) => t.startsWith('The Ahlback classification of knee osteoarthritis'))).toBe(true);
  // The paraphrase is no longer a visible sibling.
  expect(visible.some((t) => t.includes('(Ahlback 1968)'))).toBe(false);

  // Nothing was deleted: it is inside a disclosure, still in the DOM.
  const folded = await page.evaluate(() => {
    const d = [...document.querySelectorAll('.tool-body > details.note-more')];
    return d.map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim());
  });
  expect(folded.some((t) => t.includes('(Ahlback 1968)'))).toBe(true);
});

test('the fold survives the intro-note observer', async ({ page }) => {
  await page.goto('/#ahlback-knee-oa', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const stillVisible = await page.evaluate(() => [...document.querySelector('.tool-body').children]
    .filter((e) => e.tagName === 'P' && e.classList.contains('muted'))
    .some((e) => (e.textContent || '').includes('(Ahlback 1968)')));
  expect(stillVisible).toBe(false);
});

test('a tile whose two notes say different things keeps both visible', async ({ page }) => {
  // effective-osmolality's intro defines the formula; its hoisted note is about
  // what the number means and what it excludes. Different paragraphs, both stay.
  await page.goto('/#effective-osmolality', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const text = await bodyText(page);
  expect(text).toContain('Effective osmolality');
  const visibleParas = await page.evaluate(() => [...document.querySelector('.tool-body').children]
    .filter((e) => e.tagName === 'P' && e.classList.contains('muted')).length);
  expect(visibleParas).toBeGreaterThan(1);
});

test('the posture line is never folded away', async ({ page }) => {
  // Not every tile carries it (wells-pe and curb-65 do not), so assert on the
  // ones that do: wherever the line exists, it must be in front of the reader
  // and not inside a disclosure.
  for (const id of ['ahlback-knee-oa', 'c-rads', 'stratify']) {
    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const body = document.querySelector('.tool-body');
      const has = (body.textContent || '').includes('Decision support, not a verdict');
      const visible = [...body.querySelectorAll('p')]
        .some((e) => (e.textContent || '').startsWith('Decision support, not a verdict') && !e.closest('details'));
      return { has, visible };
    });
    expect(r.has, `${id} should carry the posture line`).toBe(true);
    expect(r.visible, `${id} must keep its posture line in front of the reader`).toBe(true);
  }
});
