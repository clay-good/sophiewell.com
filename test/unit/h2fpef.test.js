// spec-v102 2.3: H2FPEF Score (Reddy 2018).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h2fpef } from '../../lib/cardio-v102.js';

test('no factors -> 0, low', () => {
  const r = h2fpef({});
  assert.equal(r.total, 0);
  assert.equal(r.prob, 'low');
});

test('AF (3) + obesity (2) -> 5, intermediate (upper edge)', () => {
  const r = h2fpef({ afib: true, obese: true });
  assert.equal(r.total, 5);
  assert.equal(r.prob, 'intermediate');
});

test('5 -> 6 flips intermediate to high', () => {
  const r = h2fpef({ afib: true, obese: true, ageOver60: true });
  assert.equal(r.total, 6);
  assert.equal(r.prob, 'high');
});

test('maximum is 9', () => {
  const r = h2fpef({ obese: true, antihypertensives: true, afib: true, pulmHtn: true, ageOver60: true, eeOver9: true });
  assert.equal(r.total, 9);
  assert.equal(r.prob, 'high');
});

test('score 1 is low (rule-out edge)', () => {
  const r = h2fpef({ ageOver60: true });
  assert.equal(r.total, 1);
  assert.equal(r.prob, 'low');
});
