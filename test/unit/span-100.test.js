// spec-v210 2.3: SPAN-100 index worked examples. SPAN-100 = age + NIHSS,
// dichotomized at 100. Threshold spec-v97 cross-verified (Saposnik 2013).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spanScore as span } from '../../lib/stroke-prognosis-v210.js';

test('SPAN-100 positive (>= 100, worked example)', () => {
  const r = span({ age: 80, nihss: 22 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 102);
  assert.equal(r.positive, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /positive/);
});

test('SPAN-100 negative (< 100)', () => {
  const r = span({ age: 60, nihss: 10 });
  assert.equal(r.score, 70);
  assert.equal(r.positive, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /negative/);
});

test('the 100 boundary is inclusive for positive', () => {
  assert.equal(span({ age: 90, nihss: 10 }).positive, true); // 100
  assert.equal(span({ age: 90, nihss: 9 }).positive, false); // 99
});

test('index is the plain sum of age and NIHSS', () => {
  const r = span({ age: 72, nihss: 18 });
  assert.equal(r.score, 90);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = span({ age: 80 });
  assert.equal(r.valid, false);
});
