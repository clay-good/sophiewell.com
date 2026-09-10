// spec-v1146: the pieces the required-field sweeps share, in one copy.
//
// `required-field-agreement.spec.js` asks the question these serve: `mcp/fields.js`
// marks an input `required`, so an agent omitting it gets MISSING_INPUT and no
// number, and the browser must not answer where the agent surface refuses.
//
// They lived here from spec-v1146 because a PROBE beside that gate asked the same
// question of every required field while the gate only reached the first one per
// tile. spec-v1156 folded the wide question into the gate and deleted the probe.
// The module stays: the "did it answer?" test is a regex that has been tuned three
// times, and it belongs in one place whether one caller reads it or two.

import { allCalculators } from '../../mcp/catalog.js';
import { ASKING, DISCLOSING, ownsTheGap } from './asking-language.js';

// tileId -> the dom ids of every field the agent surface requires.
export function requiredFieldsByTile() {
  const map = {};
  for (const cal of allCalculators()) {
    const doms = (cal.fields || []).filter((f) => f.required).map((f) => f.dom).filter(Boolean);
    if (doms.length) map[cal.id] = doms;
  }
  return map;
}

// Did the tile decline to answer -- either by asking, or by answering and saying
// what it was missing?
//
// spec-v1149: both sweeps here start from a COMPLETE worked example and clear ONE
// field, which is exactly the case test/lib/asking-language.js names when it says
// a disclosure is sufficient: "only the one-blank-field gate, which starts from a
// complete example, accepts a disclosure as sufficient." The empty-form sweeps
// must not, because with nothing entered there is nothing to disclose about --
// but that is not this question. These two had been reading ASKING alone, so a
// tile that answered honestly with its footing ("SAPS II AT LEAST 55 points ...
// the PaO2/FiO2 is not entered") still counted as an offender.
//
// Measured before changing it, as the house rule requires: across every tile and
// every required field, accepting DISCLOSING moves exactly TWO rows from flagged
// to exempt, and both are `saps-ii` disclosing the oxygenation floor spec-v1149
// gave it.
// spec-v1196: `before` is the same tile read with nothing cleared. Given it, the
// vocabulary is matched against what the reading ADDED rather than against all of
// it, because a sentence that was already there cannot be a statement about a gap
// that did not exist when it was written. See `ownsTheGap` in asking-language.js.
// Without it this keeps the older, looser question, for callers that have no
// baseline to compare against.
export function refusedOrDisclosed(text, before) {
  if (before !== undefined) return ownsTheGap(text, before);
  return ASKING.test(text) || DISCLOSING.test(text);
}

// Did the tile ANSWER, as opposed to refusing or saying nothing? A number that
// is not a citation year, outside parentheses.
//
// spec-v1147 considered widening this to count a `NaN` / `Infinity` reading as an
// answer, on the strength of `ascvdPce` returning NaN from a zeroed input. It was
// measured before being added, and it moved ZERO rows: the spec-v53 output-safety
// layer catches a non-finite value before it reaches the DOM, so no tile renders
// one. Not added -- a pattern that moves nothing is a claim the next reader has to
// re-check.
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
  const region = () => document.querySelector('#q-results') || document.querySelector('.screener-result');
  // spec-v1196: the reading with NOTHING cleared. Every sentence in it was
  // written before any field was missing, so it cannot be a statement about one.
  await new Promise((r) => setTimeout(r, 120));
  const q0 = region();
  const base = q0 ? (q0.textContent || '').replace(/\s+/g, ' ') : '';
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
    const q = region();
    out.push({ cleared: dom, base, text: q ? (q.textContent || '').replace(/\s+/g, ' ') : '' });
    n.value = kept;
    n.dispatchEvent(new Event('input', { bubbles: true }));
    n.dispatchEvent(new Event('change', { bubbles: true }));
  }
  return out;
}
