// spec-v101 2.4: ATRIA Stroke Risk Score (Singer 2013).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atriaStroke } from '../../lib/cardio-v101.js';

test('blank age -> invalid', () => {
  assert.equal(atriaStroke({}).valid, false);
});

test('age 60, no prior stroke -> 0 (low)', () => {
  const r = atriaStroke({ age: 60 });
  assert.equal(r.total, 0);
  assert.equal(r.risk, 'low');
});

test('age 60 WITH prior stroke -> 8 via the prior-stroke age column (column flip)', () => {
  const r = atriaStroke({ age: 60, priorStroke: true });
  assert.equal(r.total, 8);
  assert.equal(r.risk, 'high');
});

test('non-monotonic interaction: prior-stroke <65 (8) scores above 65-74 (7)', () => {
  const young = atriaStroke({ age: 60, priorStroke: true }).total;
  const older = atriaStroke({ age: 70, priorStroke: true }).total;
  assert.equal(young, 8);
  assert.equal(older, 7);
});

test('score 6 is the intermediate band', () => {
  // age 75-84 no prior stroke = 5, + one factor = 6.
  const r = atriaStroke({ age: 80, diabetes: true });
  assert.equal(r.total, 6);
  assert.equal(r.risk, 'intermediate');
});

test('maximum is 15', () => {
  const r = atriaStroke({ age: 90, priorStroke: true, female: true, diabetes: true, chf: true, hypertension: true, proteinuria: true, renal: true });
  assert.equal(r.total, 15);
});
