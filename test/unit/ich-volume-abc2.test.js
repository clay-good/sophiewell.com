// spec-v117 2.2: ABC/2 intracerebral hemorrhage volume (Kothari 1996). Volume
// (mL) = A x B x C / 2 with each orthogonal diameter in cm. >= 30 mL is the
// ICH-score threshold; diameters are non-negative and finite-guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ichVolumeAbc2 } from '../../lib/neuro-v117.js';

test('5 x 4 x 3 cm -> 30 mL, crossing the ICH-score >= 30 mL threshold', () => {
  const r = ichVolumeAbc2({ a: 5, b: 4, c: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.volume, 30);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /meets the ICH-score >= 30 mL threshold/);
});

test('3 x 2 x 2 cm -> 6 mL, below the threshold (band flip)', () => {
  const r = ichVolumeAbc2({ a: 3, b: 2, c: 2 });
  assert.equal(r.volume, 6);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the ICH-score 30 mL threshold/);
});

test('a missing diameter renders a complete-the-fields fallback', () => {
  const r = ichVolumeAbc2({ a: 5, b: 4 });
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter the three orthogonal hematoma diameters/);
});

test('a negative diameter is rejected, never a volume from a bad sign', () => {
  const r = ichVolumeAbc2({ a: 5, b: -4, c: 3 });
  assert.equal(r.valid, false);
  assert.match(r.band, /must be non-negative/);
});

test('zero diameters compute a valid 0 mL volume', () => {
  const r = ichVolumeAbc2({ a: 0, b: 0, c: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.volume, 0);
});
