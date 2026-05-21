import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flacc } from '../../lib/scoring-v4.js';

test('flacc 0 (all zero; tile example) -> relaxed', () => {
  const r = flacc({ face: 0, legs: 0, activity: 0, cry: 0, consolability: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.band, 'no pain / relaxed');
});

test('flacc 3 (upper edge of mild) -> mild discomfort', () => {
  const r = flacc({ face: 1, legs: 1, activity: 1, cry: 0, consolability: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.band, 'mild discomfort');
});

test('flacc 4 (lower edge of moderate) -> moderate pain', () => {
  const r = flacc({ face: 1, legs: 1, activity: 1, cry: 1, consolability: 0 });
  assert.equal(r.score, 4);
  assert.equal(r.band, 'moderate pain');
});

test('flacc 6 (upper edge of moderate) -> moderate pain', () => {
  const r = flacc({ face: 1, legs: 1, activity: 1, cry: 1, consolability: 2 });
  assert.equal(r.score, 6);
  assert.equal(r.band, 'moderate pain');
});

test('flacc 7 (lower edge of severe) -> severe pain', () => {
  const r = flacc({ face: 2, legs: 1, activity: 1, cry: 2, consolability: 1 });
  assert.equal(r.score, 7);
  assert.equal(r.band, 'severe pain');
});

test('flacc 10 (all 2s) -> severe pain', () => {
  const r = flacc({ face: 2, legs: 2, activity: 2, cry: 2, consolability: 2 });
  assert.equal(r.score, 10);
  assert.equal(r.band, 'severe pain');
});

test('flacc rejects out-of-range items', () => {
  assert.throws(() => flacc({ face: 3, legs: 0, activity: 0, cry: 0, consolability: 0 }));
  assert.throws(() => flacc({ face: -1, legs: 0, activity: 0, cry: 0, consolability: 0 }));
  assert.throws(() => flacc({ face: 1.5, legs: 0, activity: 0, cry: 0, consolability: 0 }));
});
