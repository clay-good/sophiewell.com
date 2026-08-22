// The worked example has to actually land in the fields.
//
// Every tool page says "The tool opens with these values already filled in.
// Replace them with your own", and the tile itself says "These are example
// values." On six tiles that was not true. They load their picklist over the
// network and build their rows and options when the fetch resolves, so the
// fill -- which runs in a microtask -- set a select that had no options yet,
// or, on opioid-mme, a row that did not exist. All six then rendered no result
// at all under a page stating one, and rvu-payment had its choice overwritten
// when the locality file landed a moment later.
//
// This is the only place that is visible: the ids are right in lib/meta.js,
// the renderers are right on their own, and what fails is the order they
// happen in. So the sweep opens every tile and asserts the documented value is
// in the documented field.
import { test, expect } from '@playwright/test';

test.skip(({ browserName }) => browserName !== 'chromium', 'whole-catalog sweep is chromium-only');

// The five screener tiles name their example by item index -- `phq9-0` is item
// one -- because that is what the MCP field registry calls them. On screen the
// items are radio groups (`phq9-i0-v1`), and the prefill comes from the
// instrument config's own `exampleAnswers` rather than from this path. That
// the two agree is asserted in test/unit/screener-example.test.js, which does
// not need a browser.
const SELF_FILLING = new Set(['phq9', 'gad7', 'auditc', 'cage', 'epds']);

test('every documented example value is in its field when the tile opens', async ({ page }) => {
  test.setTimeout(900_000);
  await page.goto('/');
  const tiles = await page.evaluate(async () => {
    const mod = await import('/lib/meta.js');
    return Object.entries(mod.META)
      .filter(([, m]) => m && m.example && m.example.fields)
      .map(([id, m]) => [id, m.example.fields]);
  });
  expect(tiles.length).toBeGreaterThan(1500);

  const failures = [];
  for (const [id, fields] of tiles) {
    if (SELF_FILLING.has(id)) continue;
    await page.goto(`/#${id}`);
    const missed = await page.evaluate(async (f) => {
      // One task, so a renderer that builds its inputs from a fetch has landed
      // and the retry has run.
      await new Promise((r) => setTimeout(r, 40));
      const out = [];
      for (const [k, v] of Object.entries(f)) {
        const n = document.getElementById(k);
        if (!n) { out.push(`${k} is not on the page`); continue; }
        if (n.type === 'checkbox' || n.type === 'radio') continue;
        if (String(n.value) !== String(v)) out.push(`${k} holds "${n.value}", example says "${v}"`);
      }
      return out;
    }, fields);
    if (missed.length) failures.push(`${id}: ${missed.join('; ')}`);
  }

  expect(failures, `${failures.length} tiles do not open with their example`).toEqual([]);
});
