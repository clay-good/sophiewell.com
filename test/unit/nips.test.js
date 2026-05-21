import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nips } from '../../lib/scoring-v4.js';

test('nips 0 (all zero; tile example) -> no / mild pain', () => {
  const r = nips({ facialExpression: 0, cry: 0, breathingPatterns: 0, arms: 0, legs: 0, stateOfArousal: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.band, 'no / mild pain');
});

test('nips 2 (upper edge of no/mild) -> no / mild', () => {
  const r = nips({ facialExpression: 1, cry: 0, breathingPatterns: 1, arms: 0, legs: 0, stateOfArousal: 0 });
  assert.equal(r.score, 2);
  assert.equal(r.band, 'no / mild pain');
});

test('nips 3 (lower edge of mild-moderate) -> mild-to-moderate', () => {
  const r = nips({ facialExpression: 1, cry: 1, breathingPatterns: 1, arms: 0, legs: 0, stateOfArousal: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.band, 'mild-to-moderate pain');
});

test('nips 4 (upper edge of mild-moderate) -> mild-to-moderate', () => {
  const r = nips({ facialExpression: 1, cry: 1, breathingPatterns: 1, arms: 1, legs: 0, stateOfArousal: 0 });
  assert.equal(r.score, 4);
  assert.equal(r.band, 'mild-to-moderate pain');
});

test('nips 5 (lower edge of severe) -> severe', () => {
  const r = nips({ facialExpression: 1, cry: 2, breathingPatterns: 1, arms: 1, legs: 0, stateOfArousal: 0 });
  assert.equal(r.score, 5);
  assert.equal(r.band, 'severe pain');
});

test('nips 7 (all maxima) -> severe', () => {
  const r = nips({ facialExpression: 1, cry: 2, breathingPatterns: 1, arms: 1, legs: 1, stateOfArousal: 1 });
  assert.equal(r.score, 7);
  assert.equal(r.band, 'severe pain');
});

test('nips rejects out-of-range items', () => {
  assert.throws(() => nips({ facialExpression: 2, cry: 0, breathingPatterns: 0, arms: 0, legs: 0, stateOfArousal: 0 }));
  assert.throws(() => nips({ facialExpression: 0, cry: 3, breathingPatterns: 0, arms: 0, legs: 0, stateOfArousal: 0 }));
});
