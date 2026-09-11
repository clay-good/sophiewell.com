// spec-v1235: the file spec-v1227's mechanical pass skipped, and the one place
// its rule was applied in the wrong scope.
//
// `lib/gaps-v185.js` already imported `gradeFault` and three of its functions
// already used it, so the file-level filter in spec-v1227 ("has a `missing` list
// and does NOT mention gradeFault") passed over it. Six functions in it still
// had the dead end: `pos(v, max)` returns one `null` for a blank field, a
// non-number and a value past `max`, and the caller reads `null` as absent.
//
//   fick-cardiac-output  haemoglobin 250 g/dL -> "Enter the hemoglobin (g/dL)."
//   matsuda-index        fasting glucose 20000 -> "Enter the fasting glucose (mg/dL)."
//
// A file-level filter is the wrong granularity for a per-function defect. That
// is the correction spec-v1227's own ledger needed.
//
// AND THE SCOPE BUG: `fickCardiacOutput` has two methods, measured and
// estimated, and its `missing` list is checked inside each arm. The transformer
// put the range check inside the `estimated` arm, where a measured Fick -- the
// default -- never reaches it. It is hoisted above the branch here, because the
// two fields it reads are the ones BOTH methods use.
import test from 'node:test';
import assert from 'node:assert/strict';

import { fickCardiacOutput, matsudaIndex, gorlin, lvotStrokeVolume, leanBodyWeight } from '../../lib/gaps-v185.js';

const CHECK = /must be .* Check the value entered\.$/;

test('fick names the haemoglobin it rejected, on BOTH methods', () => {
  const measured = { hb: 14, sao2: 98, svo2: 70, bsa: 1.8, vo2: 250, method: 'measured' };
  assert.match(fickCardiacOutput({ ...measured, hb: 250 }).message, /Hemoglobin \(g\/dL\) must be/);
  assert.match(fickCardiacOutput({ ...measured, bsa: 40 }).message, /BSA \(m²\) must be/);
  assert.equal(fickCardiacOutput(measured).valid, true);

  const estimated = { hb: 14, sao2: 98, svo2: 70, bsa: 1.8, method: 'estimated', age: 60, hr: 70, sex: 'male' };
  assert.match(fickCardiacOutput({ ...estimated, hb: 250 }).message, /Hemoglobin \(g\/dL\) must be/);
  assert.equal(fickCardiacOutput(estimated).valid, true);

  // A blank field is still asked for, in the tile's own words.
  assert.match(fickCardiacOutput({ sao2: 98, svo2: 70, bsa: 1.8, vo2: 250 }).message, /^Enter the hemoglobin/);
});

test('matsuda names the draw it rejected', () => {
  const M = { g0: 90, i0: 10, gMean: 140, iMean: 60 };
  assert.match(matsudaIndex({ ...M, g0: 20000 }).message, /^Fasting glucose \(mg\/dL\) must be/);
  assert.match(matsudaIndex({ ...M, gMean: 20000 }).message, /^Mean OGTT glucose \(mg\/dL\) must be/);
  assert.equal(matsudaIndex(M).valid, true);
  assert.match(matsudaIndex({ i0: 10, gMean: 140, iMean: 60 }).message, /^Enter the fasting glucose/);
});

test('the three other functions in the file carry the same distinction', () => {
  assert.equal(gorlin({ co: 5, hr: 70, period: 0.33, grad: 40, valve: 'aortic' }).valid, true);
  assert.match(gorlin({ co: 5, hr: 3000, period: 0.33, grad: 40, valve: 'aortic' }).message, CHECK);
  assert.equal(lvotStrokeVolume({ d: 2.0, vti: 20, hr: 70, bsa: 1.8 }).valid, true);
  assert.match(lvotStrokeVolume({ d: 2.0, vti: 20, hr: 3000, bsa: 1.8 }).message, CHECK);
  assert.equal(leanBodyWeight({ weight: 80, height: 175, sex: 'male' }).valid, true);
  assert.match(leanBodyWeight({ weight: 9000, height: 175, sex: 'male' }).message, CHECK);
});
