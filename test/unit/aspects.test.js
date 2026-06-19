// spec-v117 2.1: Alberta Stroke Program Early CT Score (Barber 2000). Score =
// 10 - (count of the 10 affected MCA-territory regions), clamped 0-10; the
// source dichotomizes at <= 7 (worse outcome and higher symptomatic-hemorrhage
// risk).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aspects } from '../../lib/neuro-v117.js';

test('10 -> band: a normal scan scores 10/10, favorable range', () => {
  const r = aspects({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 10);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ASPECTS 10\/10 .* favorable range/);
});

test('three regions affected -> 7/10, the <= 7 worse-outcome band', () => {
  const r = aspects({ caudate: true, lentiform: true, insula: true });
  assert.equal(r.score, 7);
  assert.equal(r.affected, 3);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /ASPECTS <= 7/);
});

test('all ten regions affected -> 0/10, clamped at the floor', () => {
  const r = aspects({ caudate: true, lentiform: true, internalCapsule: true, insula: true, m1: true, m2: true, m3: true, m4: true, m5: true, m6: true });
  assert.equal(r.score, 0);
  assert.equal(r.affected, 10);
});

test('eight clear regions (2 affected) -> 8/10 stays favorable (> 7)', () => {
  const r = aspects({ m1: true, m2: true });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, false);
});

test('the affected regions are named back to the user', () => {
  const r = aspects({ caudate: true, m4: true });
  assert.match(r.regions, /caudate/);
  assert.match(r.regions, /M4/);
});
