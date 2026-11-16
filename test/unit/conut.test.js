// spec-v178 §2.3: CONUT points from albumin + cholesterol + lymphocytes -> 0-12.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conut } from '../../lib/ltcga-v178.js';

test('CONUT worked example (alb 3.2, chol 150, lymph 1000) = 5 moderate', () => {
  const r = conut({ albuminGdl: 3.2, cholesterol: 150, lymphocytes: 1000 });
  assert.equal(r.total, 5); // 2 + 1 + 2
  assert.match(r.band, /moderate/);
});

test('CONUT all-normal = 0', () => {
  assert.equal(conut({ albuminGdl: 4.0, cholesterol: 200, lymphocytes: 2000 }).total, 0);
});

test('CONUT severe (all worst) = 12', () => {
  const r = conut({ albuminGdl: 2.0, cholesterol: 80, lymphocytes: 500 });
  assert.equal(r.total, 12);
  assert.match(r.band, /severe/);
});

test('CONUT albumin band edges', () => {
  assert.equal(conut({ albuminGdl: 3.5, cholesterol: 200, lymphocytes: 2000 }).total, 0);
  assert.equal(conut({ albuminGdl: 3.49, cholesterol: 200, lymphocytes: 2000 }).total, 2);
});

test('CONUT guards blanks', () => {
  assert.equal(conut({ albuminGdl: 3.2, cholesterol: 150 }).valid, false);
  assert.equal(conut({}).valid, false);
});

// spec-v1746: an entered value outside the range read as blank and was asked for again.
test('spec-v1746: conut names the range of an impossible entry and still asks for a blank one', () => {
  const ex = { albuminGdl: 3.2, cholesterol: 150, lymphocytes: 1000 };
  assert.equal(conut(ex).valid, true);
  for (const k of Object.keys(ex)) {
    const r = conut({ ...ex, [k]: -999999 });
    assert.equal(r.valid, false);
    assert.match(r.message, /must be greater than 0/);
    assert.match(conut({ ...ex, [k]: '' }).message, /^Enter serum albumin \(g\/dL\), total cholesterol/);
  }
});
