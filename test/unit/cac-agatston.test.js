// spec-v668: coronary artery calcium (CAC) Agatston score interpretation.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { cacAgatston } from '../../lib/cac-agatston-v668.js';

test('bands: 0 none, 1-99 mild, 100-399 moderate, >=400 severe', () => {
  assert.equal(cacAgatston({ score: '0' }).category, 'none');
  assert.equal(cacAgatston({ score: '50' }).category, 'mild');
  assert.equal(cacAgatston({ score: '250' }).category, 'moderate');
  assert.equal(cacAgatston({ score: '600' }).category, 'severe');
});

test('band boundaries are exact (99/100 and 399/400)', () => {
  assert.equal(cacAgatston({ score: '99' }).category, 'mild');
  assert.equal(cacAgatston({ score: '100' }).category, 'moderate');
  assert.equal(cacAgatston({ score: '399' }).category, 'moderate');
  assert.equal(cacAgatston({ score: '400' }).category, 'severe');
});

test('abnormal flag set at moderate (>=100) and above', () => {
  assert.equal(cacAgatston({ score: '0' }).abnormal, false);
  assert.equal(cacAgatston({ score: '99' }).abnormal, false);
  assert.equal(cacAgatston({ score: '100' }).abnormal, true);
});

test('CAC 0 detail notes risk is low but not zero', () => {
  assert.match(cacAgatston({ score: '0' }).detail, /not zero/);
});

test('META example: 250 = moderate (100-399)', () => {
  const r = cacAgatston({ score: '250' });
  assert.equal(r.category, 'moderate');
  assert.equal(r.range, '100-399');
  assert.match(r.bandLabel, /CAC 250/);
});

test('score is a required non-negative whole number', () => {
  assert.equal(cacAgatston({}).valid, false);
  assert.equal(cacAgatston({}).code, 'MISSING_INPUT');
  assert.equal(cacAgatston({ score: '-5' }).valid, false);
  assert.equal(cacAgatston({ score: '12.5' }).valid, false);
});
