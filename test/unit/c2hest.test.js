// spec-v1434: C2HEST (Li 2019, Chest; PMC6437029).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { c2hest } from '../../lib/c2hest-v1434.js';

const NONE = { shd: 'no', cad: 'no', copd: 'no', htn: 'no', age75: 'no', systolicHf: 'no', hyperthyroid: 'no' };

test('points: CAD 1, COPD 1, hypertension 1, age >=75 2, systolic HF 2, hyperthyroidism 1', () => {
  assert.equal(c2hest(NONE).score, 0);
  assert.equal(c2hest({ ...NONE, cad: 'yes', copd: 'yes', htn: 'yes', age75: 'yes', systolicHf: 'yes', hyperthyroid: 'yes' }).score, 8);
  assert.equal(c2hest({ ...NONE, age75: 'yes' }).score, 2);
  assert.equal(c2hest({ ...NONE, systolicHf: 'yes', hyperthyroid: 'yes' }).score, 3);
});

test('groups low 0-1, medium 2-3, high 4 or more', () => {
  assert.equal(c2hest({ ...NONE, htn: 'yes' }).group, 'low');
  assert.equal(c2hest({ ...NONE, age75: 'yes' }).group, 'medium');
  assert.equal(c2hest({ ...NONE, age75: 'yes', htn: 'yes' }).group, 'medium');
  assert.equal(c2hest({ ...NONE, age75: 'yes', systolicHf: 'yes' }).group, 'high');
  assert.match(c2hest({ ...NONE, age75: 'yes', systolicHf: 'yes' }).band, /15\.98% per year/);
});

test('structural heart disease is not scored', () => {
  const r = c2hest({ shd: 'yes' });
  assert.equal(r.valid, true);
  assert.equal(r.score, null);
  assert.match(r.band, /does not apply/);
});

test('a blank item is asked for, never read as no', () => {
  assert.match(c2hest({ ...NONE, htn: '' }).message, /hypertension is still needed/);
  assert.match(c2hest({ cad: 'no' }).message, /^Answer every item: structural heart disease/);
});
