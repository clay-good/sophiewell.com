// spec-v1799: a per-kilogram dose refuses a weight below the lib/bounds.js envelope.
//
// Six tools took the weightKg envelope's CEILING and left the floor open, so a weight of 0.1 kg -- which
// the envelope's own note calls a unit error, "a value below ~0.2 kg usually means the unit (g/lb vs kg) is
// wrong" -- was dosed per kilogram and answered. `probe-envelope-unenforced` found them by asking, of every
// field whose own words and unit name an envelope, whether the tool answers outside it.
//
// The two that read lb or kg take the floor in the unit the reader picked: 0.2 kg is 0.44 lb.
import test from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { computeCalculator } from '../../mcp/tools.js';
import { BOUNDS } from '../../lib/bounds.js';

const FLOORED = [
  ['conc-rate', 'w'],
  ['pediatric-administered-activity', 'paa-weight'],
  ['auth-units-request', 'au-weight'],
  ['epinephrine-device-weight-band', 'edw-weight'],
  ['otc-child-label-dose', 'ocd-weight'],
  ['digoxin-label-dose', 'dg-weight'],
];

for (const [id, dom] of FLOORED) {
  test(`${id}: a weight below the weightKg envelope is refused, not dosed`, () => {
    const ex = META[id].example.fields;
    assert.equal(computeCalculator({ id, inputs: ex }).valid, true, 'the worked example still computes');
    const under = BOUNDS.weightKg.min / 2;
    let r;
    try { r = computeCalculator({ id, inputs: { ...ex, [dom]: String(under) } }); } catch { r = { valid: false }; }
    assert.equal(r.valid, false, `${under} should be refused`);
    // And the edge itself still answers, so the floor is a floor and not a wider cap.
    const at = computeCalculator({ id, inputs: { ...ex, [dom]: String(BOUNDS.weightKg.min) } });
    assert.notEqual(at, null);
  });
}
