// spec-v127 2.3: AKIN (Mehta 2007). Stage 1-3; RRT forces 3; worst of Cr and UO.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { akinAki } from '../../lib/nephro-v127.js';

test('creatinine x3.5 -> stage 3', () => {
  const r = akinAki({ baselineCr: 1.0, currentCr: 3.5 });
  assert.equal(r.valid, true);
  assert.equal(r.stage, 3);
});

test('RRT initiation forces stage 3', () => {
  const r = akinAki({ rrt: true });
  assert.equal(r.stage, 3);
  assert.match(r.band, /renal replacement therapy/);
});

test('absolute rise >= 0.3 mg/dL -> stage 1', () => {
  const r = akinAki({ baselineCr: 1.0, currentCr: 1.4 });
  assert.equal(r.stage, 1);
});

test('x2 -> stage 2', () => {
  assert.equal(akinAki({ baselineCr: 1.0, currentCr: 2.0 }).stage, 2);
});

test('nothing entered / scalar -> valid:false', () => {
  assert.equal(akinAki({}).valid, false);
  assert.equal(akinAki(9).valid, false);
});

test('one creatinine on its own cannot rule AKI out (spec-v1063)', () => {
  // The stage is the worse of two arms, and the creatinine arm needs BOTH a
  // baseline and a current value. Scoring an unassessed arm as a normal one made
  // this answer "AKIN: no AKI criteria met" for a patient whose current
  // creatinine nobody had entered -- on a form that otherwise looked complete.
  const half = akinAki({ baselineCr: 1.0, currentCr: null, rrt: false, uoClass: '0' });
  assert.equal(half.valid, false);
  assert.match(half.message, /cannot rule acute kidney injury in or out/);

  // The other arm may still rule IN, and says what it was scored from.
  const uoOnly = akinAki({ baselineCr: 1.0, currentCr: null, rrt: false, uoClass: '2' });
  assert.equal(uoOnly.valid, true);
  assert.equal(uoOnly.stage, 2);
  assert.equal(uoOnly.crAssessed, false);
  assert.match(uoOnly.band, /urine-output criterion alone/);

  // A complete pair is untouched.
  const both = akinAki({ baselineCr: 1.0, currentCr: 3.5, rrt: false, uoClass: '0' });
  assert.equal(both.crAssessed, true);
  assert.equal(both.stage, 3);
  assert.doesNotMatch(both.band, /alone/);
});
