// spec-v645: CHEOPS (Children's Hospital of Eastern Ontario Pain Scale).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cheops } from '../../lib/cheops-v645.js';

const MIN = { cry: 'nocry', facial: 'smiling', verbal: 'positive', torso: 'neutral', touch: 'nottouching', legs: 'neutral' };
const MAX = { cry: 'scream', facial: 'grimace', verbal: 'pain', torso: 'tense', touch: 'grabbing', legs: 'squirming' };

test('score floor is 4 (not 3) because cry has no zero option', () => {
  const r = cheops(MIN);
  assert.equal(r.total, 4);
  assert.equal(r.min, 4);
});

test('score ceiling is 13', () => {
  const r = cheops(MAX);
  assert.equal(r.total, 13);
  assert.equal(r.max, 13);
});

test('META example: crying + grimace + pain + neutral torso/touch/legs = 9', () => {
  const r = cheops({ cry: 'crying', facial: 'grimace', verbal: 'pain', torso: 'neutral', touch: 'nottouching', legs: 'neutral' });
  assert.equal(r.total, 9);
  assert.match(r.bandLabel, /CHEOPS 9 of 13/);
});

test('non-uniform per-item points', () => {
  // Cry: nocry 1, moaning 2, crying 2, scream 3.
  const base = { facial: 'smiling', verbal: 'positive', torso: 'neutral', touch: 'nottouching', legs: 'neutral' }; // 0+0+1+1+1 = 3
  assert.equal(cheops({ ...base, cry: 'nocry' }).total, 4);
  assert.equal(cheops({ ...base, cry: 'moaning' }).total, 5);
  assert.equal(cheops({ ...base, cry: 'scream' }).total, 6);
  // Facial: smiling 0 vs grimace 2 (a 2-point swing).
  assert.equal(cheops({ ...base, cry: 'nocry', facial: 'grimace' }).total, 6);
});

test('verbal collapses pain and both to 2, non-pain complaints to 1', () => {
  const base = { cry: 'nocry', facial: 'smiling', torso: 'neutral', touch: 'nottouching', legs: 'neutral' }; // 1+0+1+1+1 = 4 before verbal
  assert.equal(cheops({ ...base, verbal: 'positive' }).total, 4);
  assert.equal(cheops({ ...base, verbal: 'none' }).total, 5);
  assert.equal(cheops({ ...base, verbal: 'other' }).total, 5);
  assert.equal(cheops({ ...base, verbal: 'pain' }).total, 6);
  assert.equal(cheops({ ...base, verbal: 'both' }).total, 6);
});

test('every item is required; an unrated item is incomplete', () => {
  const r = cheops({ cry: 'crying' });
  assert.equal(r.valid, false);
  assert.equal(r.code, 'MISSING_INPUT');
});

test('an unrecognized behavior is rejected, not scored as zero', () => {
  const r = cheops({ ...MIN, cry: 'sobbing' });
  assert.equal(r.valid, false);
  assert.equal(r.code, 'UNKNOWN_INPUT');
});
