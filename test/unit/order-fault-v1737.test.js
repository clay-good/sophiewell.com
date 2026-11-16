// spec-v1737: two measurements whose order is fixed by definition. A diastolic above
// the systolic, or an HDL or LDL above the total cholesterol it is part of, used to
// compute -- a MAP above the systolic, a 0.6% Framingham risk from an HDL four times
// the total. Each tool here now refuses with the pair named.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderFault } from '../../lib/num.js';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';
import { allCalculators } from '../../mcp/catalog.js';

test('orderFault: names the pair, skips blanks, allows equal', () => {
  const row = (lo, hi) => [['diastolic pressure', lo, 'systolic pressure', hi, 'it is the lower one.']];
  assert.equal(orderFault(row(120, 80)), 'The diastolic pressure (120) is above the systolic pressure (80); it is the lower one. Check the values entered.');
  assert.equal(orderFault(row(80, 120)), null);
  assert.equal(orderFault(row(80, 80)), null);
  assert.equal(orderFault(row('', 80)), null);
  assert.equal(orderFault(row(null, 80)), null);
  assert.equal(orderFault(row('abc', 80)), null);
});

const cat = new Map(allCalculators().map((t) => [t.id, t]));
const dom = (id, arg) => cat.get(id).fields.find((f) => f.arg === arg).dom;
// Swap the example's two values so the part exceeds the whole.
const swapped = (id, lowArg, highArg) => {
  const ex = { ...META[id].example.fields };
  const l = dom(id, lowArg); const h = dom(id, highArg);
  [ex[l], ex[h]] = [ex[h], ex[l]];
  return computeCalculator({ id, inputs: ex });
};

const ROWS = [
  ...['map', 'shock-index', 'abcd2', 'abcd3-i', 'charge-af', 'meows', 'metabolic-syndrome', 'pph-who-2025',
    'labor-care-guide-alert', 'tpa-eligibility'].map((id) => [id, 'dbp', 'sbp']),
  ...['score2', 'score2-op', 'mesa-chd', 'framingham-cvd', 'reynolds-risk', 'non-hdl-remnant', 'ascvd', 'prevent']
    .map((id) => [id, 'hdl', 'totalChol']),
  ['ldl-calc', 'hdl', 'totalChol'], ['castelli-index', 'hdl', 'tc'], ['castelli-index', 'ldl', 'tc'],
  ['non-hdl-remnant', 'ldl', 'totalChol'],
];

for (const [id, lowArg, highArg] of ROWS) {
  test(`${id}: ${lowArg} above ${highArg} is refused; the example still answers`, () => {
    assert.notEqual(computeCalculator({ id, inputs: { ...META[id].example.fields } }).valid, false, 'example answers');
    const r = swapped(id, lowArg, highArg);
    assert.equal(r.valid, false, JSON.stringify(r).slice(0, 200));
    assert.match(JSON.stringify(r), /is above the (systolic pressure|total cholesterol)/);
  });
}

test('simon-broome-fh: an LDL above the total cholesterol is refused; both lipids in order answer', () => {
  const base = { 'sb-xanthoma': '1' };
  const r = computeCalculator({ id: 'simon-broome-fh', inputs: { ...base, 'sb-tc': '5', 'sb-ldl': '8' } });
  assert.equal(r.valid, false);
  assert.match(r.message, /LDL cholesterol \(8\) is above the total cholesterol \(5\)/);
  assert.notEqual(computeCalculator({ id: 'simon-broome-fh', inputs: { ...base, 'sb-tc': '9', 'sb-ldl': '6' } }).valid, false);
});
