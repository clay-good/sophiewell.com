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
const NO_CURATED = [
  ['abg', ['airway-resistance', 'auto-peep', 'cpis-vap', 'cuff-leak']],
  ['acetaminophen-nomogram', ['nac-dosing', 'kings-college', 'digifab-dosing', 'tca-bicarbonate']],
];

for (const [id, expected] of NO_CURATED) {
  test(`${id} offers related tools instead of nothing`, async ({ page }) => {
    await page.goto(`/#${id}`);
    const links = page.locator('.related-tools .related-link');
    await expect(links).toHaveCount(expected.length);
    const hrefs = await links.evaluateAll((els) => els.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual(expected.map((r) => `#${r}`));
  });
}

test('a curated list is rendered as curated, not topped up or reordered', async ({ page }) => {
  await page.goto('/#wells-pe');
  const hrefs = await page.locator('.related-tools .related-link')
    .evaluateAll((els) => els.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(['#perc', '#pesi', '#years-pe']);
});
