// spec-v117 2.3: DRAGON score (Strbian 2012). D dense-artery/early-infarct on
// CT (0/+1/+2), R prestroke mRS > 1 (+1), A age (0/+1/+2), G glucose > 8 mmol/L
// (+1), O onset-to-treatment > 90 min (+1), N NIHSS (0/+1/+2/+3); total 0-10.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dragonStroke } from '../../lib/neuro-v117.js';

test('worked max: both CT signs, mRS>1, age 82, high glucose, late tx, NIHSS 18 -> 10/10 miserable', () => {
  const r = dragonStroke({ ct: 'both', mrs: true, age: 82, glucose: true, onset: 120, nihss: 18 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 10);
  assert.equal(r.tier, 'miserable');
  assert.equal(r.abnormal, true);
});

test('worked min: no CT sign, age 50, normal glucose, early tx, NIHSS 3 -> 0/10 favorable', () => {
  const r = dragonStroke({ ct: 'neither', age: 50, onset: 60, nihss: 3 });
  assert.equal(r.total, 0);
  assert.equal(r.tier, 'favorable');
  assert.equal(r.abnormal, false);
});

test('mid case lands intermediate without a fabricated percentage', () => {
  // one CT sign (+1), age 70 (+1), NIHSS 12 (+2), onset 80 (0) = 4
  const r = dragonStroke({ ct: 'either', age: 70, onset: 80, nihss: 12 });
  assert.equal(r.total, 4);
  assert.equal(r.tier, 'intermediate');
  assert.match(r.band, /intermediate prognosis/);
  assert.doesNotMatch(r.band, /%/);
});

test('age and NIHSS band boundaries: age 65 and NIHSS 16 cross up', () => {
  const r = dragonStroke({ ct: 'neither', age: 65, onset: 60, nihss: 16 });
  // age 65 (+1) + NIHSS >=16 (+3) = 4
  assert.equal(r.total, 4);
});

test('partial inputs render a complete-the-fields fallback', () => {
  const r = dragonStroke({ ct: 'both', age: 70 });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the patient age, the onset-to-treatment time/);
});

test('spec-v1741: a value ten times past its envelope is refused, not scored', () => {
  const ex = { ct: 'both', mrs: true, age: 82, glucose: true, onset: 120, nihss: 18 };
  assert.equal(dragonStroke(ex).valid, true);
  const badAge = dragonStroke({ ...ex, age: 1300 });
  assert.equal(badAge.valid, false);
  assert.match(badAge.band, /age/);
  assert.equal(dragonStroke({ ...ex, age: 110 }).valid, true);
});

// spec-v1820: the NIHSS runs 0 to 42 by construction.
//
// 42 is the sum of the scale's fifteen item maxima, and four of the catalog's eight NIHSS fields enforced
// it while these four did not -- so a baseline NIHSS of 999999 scored the top severity band in DRAGON, HAT,
// SEDAN and THRIVE and was refused next door in max-ICH, SITS-SICH and SPAN-100. Every item of the scale is
// a whole number, so the total is one too.
test('spec-v1820: a baseline NIHSS above 42, or a fraction, is refused', () => {
  // `fin` in this module takes a real number only, which is what both surfaces hand it.
  const ok = { age: 70, onset: 100, nihss: 12, ct: 'either', mrs: false, glucose: false };
  assert.equal(dragonStroke(ok).valid, true);
  assert.equal(dragonStroke({ ...ok, nihss: 42 }).valid, true, '42 is the maximum, not past it');
  for (const bad of [43, 999999, 12.5]) {
    const r = dragonStroke({ ...ok, nihss: bad });
    assert.equal(r.valid, false, bad);
    assert.match(r.band, /baseline NIHSS/, bad);
    assert.doesNotMatch(r.band, /non-negative/, bad);
  }
});
