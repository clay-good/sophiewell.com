// spec-v104 2.5: EGSYS score (Del Rosso 2008). Verified vs primary paper + MDCalc:
// effort +3 and supine +2 are SEPARATE items; the two -1 items score when PRESENT;
// range -2 to +12; >= 3 suggests cardiac syncope.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { egsys } from '../../lib/cardio-v104.js';

test('no factors -> 0, below threshold', () => {
  const r = egsys({});
  assert.equal(r.total, 0);
  assert.equal(r.cardiac, false);
});

test('both -1 items present -> -2 (minimum, negative-term-inclusive)', () => {
  const r = egsys({ precipitating: true, autonomicProdrome: true });
  assert.equal(r.total, -2);
  assert.equal(r.cardiac, false);
});

test('2 -> 3 flip with a negative term: palpitations(+4) + autonomic(-1) = 3 -> cardiac', () => {
  const r = egsys({ palpitations: true, autonomicProdrome: true });
  assert.equal(r.total, 3);
  assert.equal(r.cardiac, true);
});

test('below threshold: palpitations(+4) + both -1 items = 2 -> not cardiac', () => {
  const r = egsys({ palpitations: true, autonomicProdrome: true, precipitating: true });
  assert.equal(r.total, 2);
  assert.equal(r.cardiac, false);
});

test('effort(+3) and supine(+2) are separate items summing to 5', () => {
  const r = egsys({ effort: true, supine: true });
  assert.equal(r.total, 5);
});

test('all positives -> 12 (maximum)', () => {
  const r = egsys({ abnormalEcgOrHeartDisease: true, palpitations: true, effort: true, supine: true });
  assert.equal(r.total, 12);
  assert.equal(r.cardiac, true);
});
