// spec-v1073: an unanswered rating item is not a zero.
//
// The browser and the agent surface disagreed about what a rating instrument
// needs, and they disagreed in the reassuring direction.
//
// lib/screener.js renders no result at all until every item has an answer, so a
// PHQ-9 with one question untouched shows a reader nothing. The adapter beside
// it read each item as `Number(a[`i${i}`]) || 0`, so an item an agent did not
// send was summed as a zero and the band printed anyway:
//
//   compute_calculator { id: "phq9",   inputs: {} }  ->  "Minimal depression"
//   compute_calculator { id: "cage",   inputs: {} }  ->  "Negative"
//   compute_calculator { id: "epds",   inputs: {} }  ->  "Low likelihood"
//   compute_calculator { id: "mnihss", inputs: {} }  ->  "mNIHSS 0 of 31: no stroke symptoms"
//
// The last one had a sibling that already knew better: `nihss` returns
// INCOMPLETE with "an unscored exam is not a normal exam".
//
// The invariant is narrow and mechanical, and deliberately says nothing about
// which fields "matter": a calculator ALL of whose inputs are rated items --
// every field `kind: 'number'`, none of them declared required -- must not
// answer a call carrying no inputs at all. Fixing one means declaring its items
// required, which is what the browser's controls already are: a graded select
// always carries a value, so there is no browser state this refuses that the
// browser answers.
//
// The ledger is for instruments whose inputs are COUNTS or MEASUREMENTS rather
// than grades, where a zero is a real thing a clinician means. Every line was
// read one at a time; adding one needs the sentence that says why.

import test from 'node:test';
import assert from 'node:assert/strict';
import { allCalculators } from '../../mcp/catalog.js';
import { computeCalculator } from '../../mcp/tools.js';

// tileId -> why an empty call may still answer.
const COUNTS_NOT_GRADES = {
  'pbac-hmb': 'counts of soiled pads, tampons and clots: none counted yet is the normal state of a chart that is still being filled in, and the browser reads a blank the same way',
  'isgps-dge': 'days of NGT / postoperative days, on a form that tells the reader on screen to "leave an entry at 0 if it does not apply"',
  'dka-resolution': 'reports enteredCount: 0 and resolved: false -- it says how many of the four resolution criteria it actually had',
};

test('spec-v1073: an instrument built only of rated items does not answer an empty call', () => {
  const offenders = [];
  for (const tool of allCalculators()) {
    const fields = tool.fields || [];
    if (!fields.length) continue;
    if (!fields.every((f) => f.kind === 'number' && !f.required)) continue;
    const r = computeCalculator({ id: tool.id, inputs: {} });
    if (r?.valid !== true) continue;
    if (Object.prototype.hasOwnProperty.call(COUNTS_NOT_GRADES, tool.id)) continue;
    offenders.push(`${tool.id} (${fields.length} items) -> ${JSON.stringify(r.result).slice(0, 120)}`);
  }
  assert.deepEqual(offenders, [],
    `${offenders.length} rating instrument(s) scored every unanswered item as zero and reported a band:\n`
    + `${offenders.join('\n')}\n`
    + 'Declare the items `required` in the adapter -- the browser renders them as graded controls that\n'
    + 'always carry a value, so requiring them refuses nothing a reader can reach. If the inputs are\n'
    + 'counts or measurements rather than grades, add the id to COUNTS_NOT_GRADES with the reason.');
});

// The other half: requiring the items must not have broken the tiles. Each of
// these answers its own worked example, and refuses when one item is dropped.
const FIXED = [
  'phq9', 'gad7', 'epds', 'auditc', 'cage', 'audit-full',
  'mnihss', 'wilson-airway', 'rdai-tal', 'clinical-dehydration-scale',
  'mrss-modified-rodnan-skin-score', 'poem', 'ferriman-gallwey', 'thompson-hie',
  'menopause-rating-scale', 'kupperman-index', 'wexner',
];

test('spec-v1073: each fixed instrument still answers a complete example', async () => {
  const { META } = await import('../../lib/meta.js');
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  for (const id of FIXED) {
    const tool = byId.get(id);
    assert.ok(tool, `${id} is no longer exposed; update this list deliberately`);
    const fields = META[id]?.example?.fields;
    assert.ok(fields, `${id} has no worked example`);
    const r = computeCalculator({ id, inputs: { ...fields } });
    assert.equal(r.valid, true, `${id} no longer answers its own example: ${r.message}`);
  }
});

test('spec-v1073: dropping one item refuses, and names the item', async () => {
  const { META } = await import('../../lib/meta.js');
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  for (const id of FIXED) {
    const tool = byId.get(id);
    const fields = { ...META[id].example.fields };
    for (const f of tool.fields) {
      const partial = { ...fields };
      delete partial[f.dom];
      const r = computeCalculator({ id, inputs: partial });
      assert.equal(r.valid, false, `${id} still answers without ${f.dom}`);
      assert.equal(r.code, 'MISSING_INPUT', `${id} without ${f.dom}: expected MISSING_INPUT, got ${r.code}`);
      assert.equal(r.field, f.dom, `${id} without ${f.dom}: refusal named ${r.field}`);
    }
  }
});

// The five generic screeners are also reachable by calling the adapter's own
// compute, which is how test/mcp/blank-is-absent.test.js drives the catalog.
// `required` does not run there, so the compute carries its own guard.
test('spec-v1073: the screener computes refuse an absent item on their own', () => {
  const byId = new Map(allCalculators().map((t) => [t.id, t]));
  for (const [id, n] of [['phq9', 9], ['gad7', 7], ['epds', 10], ['auditc', 3], ['cage', 4]]) {
    const tool = byId.get(id);
    const full = {};
    for (let i = 0; i < n; i += 1) full[`i${i}`] = 1;
    assert.equal(typeof tool.compute(full).score, 'number', `${id} does not score a full set`);

    const short = { ...full };
    delete short[`i${n - 1}`];
    const r = tool.compute(short);
    assert.equal(r.valid, false, `${id} scored ${n - 1} of ${n} items`);
    assert.match(r.message, /unanswered/, `${id} refusal does not say what is unanswered`);
  }
});
