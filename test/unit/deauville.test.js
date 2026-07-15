// spec-v314: Deauville 5-point score (FDG-PET metabolic response in lymphoma).
// Worked-example tests: each score's negative/positive flag, the score-3 clinical-
// context wording, the worked example (score 4 -> positive), and the out-of-range
// guard. Scale cross-verified against the Lugano classification (Barrington 2014).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deauvilleScore } from '../../lib/deauville-v314.js';

test('scores 1-2 are negative (complete metabolic response)', () => {
  for (const s of [1, 2]) {
    const r = deauvilleScore({ score: s });
    assert.equal(r.negative, true);
    assert.equal(r.positive, false);
    assert.equal(r.abnormal, false);
    assert.match(r.interpretation, /complete metabolic response/);
  }
});

test('score 3 is read in the clinical context (not flagged positive)', () => {
  const r = deauvilleScore({ score: 3 });
  assert.equal(r.positive, false);
  assert.equal(r.negative, false);
  assert.match(r.interpretation, /clinical context/);
});

test('scores 4-5 are positive (inadequate metabolic response)', () => {
  for (const s of [4, 5]) {
    const r = deauvilleScore({ score: s });
    assert.equal(r.positive, true);
    assert.equal(r.abnormal, true);
    assert.match(r.interpretation, /positive/);
  }
});

test('the uptake descriptions match the scale', () => {
  assert.match(deauvilleScore({ score: 2 }).description, /mediastinum/);
  assert.match(deauvilleScore({ score: 3 }).description, /liver/);
  assert.match(deauvilleScore({ score: 5 }).description, /new lesions/);
});

test('an out-of-range score throws RangeError', () => {
  assert.throws(() => deauvilleScore({ score: 0 }), RangeError);
  assert.throws(() => deauvilleScore({ score: 6 }), RangeError);
  assert.throws(() => deauvilleScore({ score: '3.5' }), RangeError);
});

test('the worked example (score 4) is a positive scan', () => {
  const r = deauvilleScore({ score: 4 });
  assert.equal(r.score, 4);
  assert.equal(r.positive, true);
  assert.match(r.band, /moderately increased compared to the liver/);
});
