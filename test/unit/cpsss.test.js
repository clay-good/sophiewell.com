// spec-v119 2.1: C-STAT / CPSSS (Katz 2015). Conjugate gaze +2, LOC questions/
// commands incorrect +1, severe arm weakness +1; total 0-4; dichotomy >= 2
// predicts a large-vessel occlusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpsss } from '../../lib/neuro-v119.js';

test('no items -> 0/4, below the LVO threshold', () => {
  const r = cpsss({});
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the >= 2/);
});

test('LOC alone -> 1/4, still below the >= 2 band-flip', () => {
  const r = cpsss({ loc: true });
  assert.equal(r.total, 1);
  assert.equal(r.abnormal, false);
});

test('gaze alone -> 2/4, crosses the LVO-prediction threshold', () => {
  const r = cpsss({ gaze: true });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /predicts a large-vessel occlusion/);
});

test('LOC + arm -> 2/4, the same band-flip from two 1-point items', () => {
  const r = cpsss({ loc: true, arm: true });
  assert.equal(r.total, 2);
  assert.equal(r.abnormal, true);
});

test('all three items -> 4/4 (max)', () => {
  const r = cpsss({ gaze: true, loc: true, arm: true });
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, true);
});

test('scalar / non-object fuzz arg yields a valid 0/4, never NaN', () => {
  const r = cpsss(7);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
