// spec-v538: the NEOS score.
// Worked-example tests: the five predictors, the 0-5 range, and above all that probabilities are returned
// ONLY for the scores the source actually published (0/1 and 4/5) and refused for 2 and 3, plus the
// prohibition on reading it as a basis for limiting treatment. Predictors and bands transcribed from Balu
// and colleagues 2019 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neos, NEOS_PREDICTORS } from '../../lib/neos-v538.js';

function score(n) {
  const keys = NEOS_PREDICTORS.slice(0, n).map((p) => p.key);
  return neos(Object.fromEntries(NEOS_PREDICTORS.map((p) => [p.key, keys.includes(p.key) ? 'yes' : 'no'])));
}

test('five predictors, one point each', () => {
  assert.equal(NEOS_PREDICTORS.length, 5);
  assert.deepEqual(NEOS_PREDICTORS.map((p) => p.key),
    ['icu', 'noEarlyTreatment', 'noImprovement', 'abnormalMri', 'csfPleocytosis']);
});

test('the range is 0 to 5', () => {
  assert.equal(score(0).total, 0);
  assert.equal(score(5).total, 5);
});

test('probabilities are published ONLY for 0/1 and 4/5', () => {
  for (const n of [0, 1]) {
    const r = score(n);
    assert.equal(r.probabilityPublished, true, `score ${n}`);
    assert.match(r.probability, /3 percent/);
  }
  for (const n of [4, 5]) {
    const r = score(n);
    assert.equal(r.probabilityPublished, true, `score ${n}`);
    assert.match(r.probability, /69 percent/);
  }
});

test('NO probability is returned for a score of 2 or 3, and the result says why', () => {
  for (const n of [2, 3]) {
    const r = score(n);
    assert.equal(r.probabilityPublished, false, `score ${n}`);
    assert.equal(r.probability, null, `score ${n}`);
    assert.match(r.band, /did not publish a probability for this score/);
    assert.match(r.band, /pooled groups of twenty patients or fewer/);
    // No stray percentage should appear for these scores.
    assert.doesNotMatch(r.band, /\d+ percent(?!age)/);
  }
});

test('the outcome is defined as mRS 3 or more (the META example is a 4)', () => {
  const r = score(4);
  assert.match(r.band, /modified Rankin Scale of 3 or more/);
  assert.match(r.bandLabel, /NEOS 4 of 5/);
});

test('every score refuses the treatment-limitation reading', () => {
  for (let n = 0; n <= 5; n += 1) {
    const r = score(n);
    assert.match(r.band, /not a basis for withdrawing or limiting treatment/);
    assert.match(r.band, /compatible with good recovery/);
  }
});

test('the abnormal-MRI predictor keeps the source’s loose definition', () => {
  const mri = NEOS_PREDICTORS.find((p) => p.key === 'abnormalMri');
  assert.match(mri.detail, /referring physician/);
  assert.match(mri.detail, /kept here deliberately/);
});

test('the copy states the score is not available at presentation', () => {
  const n = score(0).note;
  assert.match(n, /both require four weeks to have passed/);
  assert.match(n, /rather than an early triage tool/);
  assert.match(n, /does not diagnose anti-NMDA receptor encephalitis/);
});

test('yes/no parsing and the guards', () => {
  assert.equal(neos({}).valid, false);
  const partial = neos({ icu: 'yes', noEarlyTreatment: 'no' });
  assert.equal(partial.valid, false);
  assert.match(partial.message, /noImprovement/);
  assert.equal(neos({ icu: 'maybe', noEarlyTreatment: 'no', noImprovement: 'no',
    abnormalMri: 'no', csfPleocytosis: 'no' }).valid, false);
  assert.equal(neos({ icu: true, noEarlyTreatment: 1, noImprovement: false,
    abnormalMri: 0, csfPleocytosis: 'no' }).total, 2);
});
