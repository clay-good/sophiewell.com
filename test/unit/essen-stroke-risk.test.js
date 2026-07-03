// spec-v206 2.5: Essen Stroke Risk Score worked examples. Age band 0/1/2 + 7
// items x1; total 0-9; low <3, high >=3. Weights + threshold spec-v97
// cross-verified (Weimar 2009 + validation literature).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { essenStroke as essen } from '../../lib/tbi-stroke-v206.js';

test('high-risk worked example (Essen 6)', () => {
  const r = essen({ age: 78, hypertension: true, diabetes: true, pad: true, smoker: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6); // age>75 (2) + HTN + DM + PAD + smoker
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high risk/);
});

test('low-risk case (Essen 1)', () => {
  const r = essen({ age: 60, hypertension: true });
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low risk/);
});

test('age bands: <65 -> 0, 65-75 -> 1, >75 -> 2', () => {
  assert.equal(essen({ age: 64 }).score, 0);
  assert.equal(essen({ age: 65 }).score, 1);
  assert.equal(essen({ age: 75 }).score, 1);
  assert.equal(essen({ age: 76 }).score, 2);
});

test('threshold at 3', () => {
  assert.equal(essen({ age: 60, hypertension: true, diabetes: true }).abnormal, false); // 2
  assert.equal(essen({ age: 60, hypertension: true, diabetes: true, pad: true }).abnormal, true); // 3
});

test('maximum score 9', () => {
  const r = essen({ age: 90, hypertension: true, diabetes: true, priorMi: true, otherCvd: true, pad: true, smoker: true, priorStroke: true });
  assert.equal(r.score, 9);
});

test('missing age -> complete-the-fields', () => {
  const r = essen({ hypertension: true });
  assert.equal(r.valid, false);
});
