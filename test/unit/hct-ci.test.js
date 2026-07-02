// spec-v199 2.5: hctCi worked examples and the verified Sorror grid weights.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hctCi } from '../../lib/myeloid-prognosis-v199.js';

test('low risk 0: no comorbidity', () => {
  const r = hctCi({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.match(r.band, /low risk/);
  assert.equal(r.abnormal, false);
});

test('intermediate 1-2: two 1-point items', () => {
  const r = hctCi({ arrhythmia: true, cardiac: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /intermediate risk/);
});

test('high >=3: prior solid tumor alone (+3)', () => {
  const r = hctCi({ solidTumor: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /high risk/);
});

test('rheumatologic and peptic ulcer weigh +2 each (Sorror grid)', () => {
  assert.equal(hctCi({ rheumatologic: true }).score, 2);
  assert.equal(hctCi({ pepticUlcer: true }).score, 2);
});

test('hepatic/pulmonary graded selects do not double-count', () => {
  assert.equal(hctCi({ hepatic: 'severe' }).score, 3);
  assert.equal(hctCi({ pulmonary: 'moderate', arrhythmia: true }).score, 3);
});
