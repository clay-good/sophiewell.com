// spec-v124 2.2: MELD-XI (Heuman 2007). 5.11*ln(bili) + 11.76*ln(creat) + 9.44,
// labs mg/dL floored at 1.0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meldXi } from '../../lib/hep-v124.js';

test('worked example', () => {
  const r = meldXi({ bilirubin: 2.0, creatinine: 1.5 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 18);
});

test('both labs <= 1.0 floor to the intercept (round 9.44 = 9)', () => {
  const r = meldXi({ bilirubin: 0.5, creatinine: 0.8 });
  assert.equal(r.score, 9);
});

test('missing labs -> valid:false', () => {
  assert.equal(meldXi({ bilirubin: 2.0 }).valid, false);
  assert.equal(meldXi(9).valid, false);
});

test('never goes negative (floor guarantees >= intercept)', () => {
  assert.ok(meldXi({ bilirubin: 0.1, creatinine: 0.1 }).score >= 9);
});
