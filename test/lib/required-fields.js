// spec-v1146: the pieces the required-field sweeps share, in one copy.
//
// Two sweeps ask the same question of the same oracle -- `mcp/fields.js` marks
// an input `required`, so an agent omitting it gets MISSING_INPUT and no number,
// and the browser must not answer where the agent surface refuses:
//
//   required-field-agreement.spec.js  -- the GATE. Clears the FIRST required
//     field a tile renders as a text or number input, and fails on a tile that
//     answers anyway. Green.
//   required-field-every-probe.spec.js -- the PROBE. Clears EVERY one of them,
//     one at a time. The gate's one-field-per-tile reach covers 1,089 of the
//     4,226 required fields the catalog declares.
//
// They are kept in one module because a rule written twice drifts: the "did it
// answer?" test in particular is a regex that has been tuned twice, and two
// copies of it would answer differently the day one is touched.

import { allCalculators } from '../../mcp/catalog.js';

// tileId -> the dom ids of every field the agent surface requires.
export function requiredFieldsByTile() {
  const map = {};
  for (const cal of allCalculators()) {
    const doms = (cal.fields || []).filter((f) => f.required).map((f) => f.dom).filter(Boolean);
    if (doms.length) map[cal.id] = doms;
  }
  return map;
}

// Did the tile ANSWER, as opposed to refusing or saying nothing? A number that
// is not a citation year, outside parentheses.
export function answeredWithANumber(text) {
  return /(?:^|[^\d.,])\d+(?:\.\d+)?(?![\d.,]*\s*(?:19|20)\d\d)/.test(text.replace(/\(.*?\)/g, ''));
}

// Passed to page.evaluate: clear one field, read the live region, put it back,
// and move to the next. Selects, checkboxes and sliders are skipped -- clearing
// one sets a different VALUE rather than removing one, which is a different
// question (spec-v1029). Playwright serializes this function into the page, so
// it must not close over anything in Node scope.
export async function clearEachAndRead(doms) {
  const out = [];
  for (const dom of doms) {
    const n = document.getElementById(dom);
    if (!n) continue;
    if (n.tagName === 'SELECT' || n.type === 'checkbox' || n.type === 'range') continue;
    if (String(n.value) === '') continue;
    const kept = n.value;
    n.value = '';
    n.dispatchEvent(new Event('input', { bubbles: true }));
    n.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 110));
    const q = document.querySelector('#q-results') || document.querySelector('.screener-result');
    out.push({ cleared: dom, text: q ? (q.textContent || '').replace(/\s+/g, ' ') : '' });
    n.value = kept;
    n.dispatchEvent(new Event('input', { bubbles: true }));
    n.dispatchEvent(new Event('change', { bubbles: true }));
  }
  return out;
}
