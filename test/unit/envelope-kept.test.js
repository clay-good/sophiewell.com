// spec-v1800: a tool whose field IS one of lib/bounds.js's quantities keeps that quantity's envelope.
//
// `lib/bounds.js` is a sourced promise -- each range is one outside which a value is "beyond recorded
// extremes" -- and 569 declarations name an envelope because the library applies it. These eleven fields
// did not, so a systolic pressure of 1,000 mmHg scored a trauma score, an albumin of 14 g/dL scored the top
// nutritional band, a fetal heart rate of 5 read as the absence of tachycardia, and a serum calcium of 1.5
// mg/dL was multiplied into a calcium-phosphate product. `probe-envelope-unenforced` found them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';

// [tool, field, a value outside the envelope, a value inside it]
const CASES = [
  // GAP and MGAP get the CEILING only: spec-v1154 settled that a typed 0 systolic is a real reading in a
  // trauma score, so the envelope floor of 20 is deliberately not applied there.
  ['gap', 'gap-sbp', 1000, 120],
  ['mgap', 'mgap-sbp', 1000, 120],
  ['reveal-lite-2', 'rv-sbp', 1000, 120],
  ['tash-score', 'ta-sbp', 1000, 120],
  ['triple-i', 'ti-fhr', 5, 150],
  ['conut', 'conut-albumin', 14, 3.5],
  ['pni-onodera', 'pni-albumin', 14, 3.5],
  ['gnri', 'gnri-weight', 1000, 70],
  ['gnri', 'gnri-weight', 0.1, 70],
  ['calcium-phosphate-product', 'capo4-ca', 1.5, 9.5],
  ['calcium-phosphate-product', 'capo4-po', 0.1, 4],
  // spec-v1801: found once the finder stopped skipping a whole field because ONE of its edges was declared.
  ['anticoag-reversal', 'ar-inr', 0.25, 3.2],
  ['bmi', 'h', 5, 1.75],
  ['ebv-mabl', 'em-min', 1.5, 25],
];

for (const [id, dom, outside, inside] of CASES) {
  test(`${id} ${dom}: ${outside} is refused and ${inside} still answers`, () => {
    const ex = META[id].example.fields;
    let bad;
    try { bad = computeCalculator({ id, inputs: { ...ex, [dom]: String(outside) } }); } catch { bad = { valid: false }; }
    assert.equal(bad.valid, false, `${outside} should be refused`);
    const good = computeCalculator({ id, inputs: { ...ex, [dom]: String(inside) } });
    assert.equal(good.valid, true, `${inside} should still answer`);
  });
}
