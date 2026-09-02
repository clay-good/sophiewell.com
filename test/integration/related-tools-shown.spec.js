// spec-v940: the live tool shows the same related tools the tool page does.
//
// renderMetaBlock listed only the hand-picked `META[id].related` ids and rendered
// nothing when there were none, while scripts/build-tool-pages.mjs has always
// topped each page's list up from what the tile shares with the rest of the
// catalog. So 102 tiles offered a reader four neighbours at /tools/<id>/ and a
// dead end at /#<id>. Both surfaces now call lib/related.js.
//
// Curation is untouched: the fill runs only when nothing is curated, which is
// what these two cases pin from either side.

import { test, expect } from '@playwright/test';

// abg and acetaminophen-nomogram have no curated siblings; wells-pe has three.
//
// spec-v977: these two used to pin the four filled ids IN ORDER, and that is not
// what spec-v940 shipped. The fill ranks the catalog by shared tokens weighted by
// how rare each is across every tile, so ANY catalog change reweights it: retiring
// four duplicate tiles (spec-v973) moved cpis-vap from third to first in abg's list
// and turned this green test red, with the same four tiles on the page throughout.
//
// So assert what the change was actually for. The invariant is the SET, and -- much
// stronger than any frozen list -- that the two surfaces agree: the in-app list at
// /#<id> names the same neighbours as the pre-rendered /tools/<id>/ page, which is
// the whole point of both calling lib/related.js.
const NO_CURATED = ['abg', 'acetaminophen-nomogram'];
const FILL_COUNT = 4;

const hrefsOf = (page, selector, attr) =>
  page.locator(selector).evaluateAll((els, a) => els.map((el) => el.getAttribute(a)), attr);

for (const id of NO_CURATED) {
  test(`${id} offers related tools instead of nothing`, async ({ page }) => {
    await page.goto(`/#${id}`);
    const links = page.locator('.related-tools .related-link');
    await expect(links).toHaveCount(FILL_COUNT);
    const inApp = (await hrefsOf(page, '.related-tools .related-link', 'href')).map((h) => h.replace(/^#/, ''));

    expect(inApp).not.toContain(id, 'a tile is not its own neighbour');
    expect(new Set(inApp).size).toBe(FILL_COUNT, 'no duplicate neighbours');

    // The pre-rendered page for the same tile, served from dist on :4174.
    await page.goto(`http://localhost:4174/tools/${id}/`);
    const onPage = (await hrefsOf(page, '.tp-related a', 'href'))
      .map((h) => (h.match(/\/tools\/([a-z0-9_-]+)\//) || [])[1])
      .filter(Boolean);

    expect(new Set(inApp)).toEqual(new Set(onPage));
  });
}

test('a curated list is rendered as curated, not topped up or reordered', async ({ page }) => {
  await page.goto('/#wells-pe');
  const hrefs = await page.locator('.related-tools .related-link')
    .evaluateAll((els) => els.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(['#perc', '#pesi', '#years-pe']);
});
