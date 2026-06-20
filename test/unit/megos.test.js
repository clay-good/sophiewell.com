// spec-v121 2.2: mEGOS (Walgaard 2011). Age (0-2), preceding diarrhea (+1), and
// MRC sum-score band weighted by timing (admission 0/2/4/6 -> 0-9; day 7 0/3/6/9
// -> 0-12). Outcome reported as a relative reading of the range (no per-score %).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { megos } from '../../lib/neuro-v121.js';

test('all 0-point inputs at admission -> 0/9, low', () => {
  const r = megos({ age: '0', timing: 'admission', mrc: '0' });
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.max, 9);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low score within the published 0-9 range/);
});

test('admission MRC weighting differs from day 7', () => {
  const adm = megos({ age: '0', timing: 'admission', mrc: '2' }); // 31-40 -> +4
  const d7 = megos({ age: '0', timing: 'day7', mrc: '2' });       // 31-40 -> +6
  assert.equal(adm.total, 4);
  assert.equal(d7.total, 6);
  assert.equal(adm.max, 9);
  assert.equal(d7.max, 12);
});

test('worked day-7 band: age >60 + diarrhea + MRC <=30 -> 12/12, high', () => {
  const r = megos({ age: '2', diarrhea: true, timing: 'day7', mrc: '3' });
  assert.equal(r.total, 12);
  assert.equal(r.max, 12);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high score within the published 0-12 range/);
});

test('clamps to max (cannot exceed range)', () => {
  const r = megos({ age: '2', diarrhea: true, timing: 'admission', mrc: '3' }); // 2+1+6 = 9
  assert.equal(r.total, 9);
  assert.equal(r.max, 9);
});

test('scalar / non-object fuzz arg yields a valid 0, never NaN', () => {
  const r = megos('x');
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(Number.isFinite(r.total), true);
});
