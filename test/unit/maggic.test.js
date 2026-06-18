// spec-v102 2.1: MAGGIC Heart Failure Risk Score (Pocock 2013).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maggic } from '../../lib/cardio-v102.js';

test('missing required inputs -> invalid', () => {
  assert.equal(maggic({ age: 70 }).valid, false);
});

test('worked case -> 28 points, 20.9% / 45.8%', () => {
  const r = maggic({ age: 70, male: true, lvef: 30, nyha: 3, sbp: 120, bmi: 24, creatinine: 1.2, diabetes: true, hfOver18mo: true, onBetaBlocker: true, onAceArb: true });
  assert.equal(r.total, 28);
  assert.equal(r.mortality1yr, 20.9);
  assert.equal(r.mortality3yr, 45.8);
});

test('age and SBP scored from the EF tier (interaction)', () => {
  // EF 45 (>=40 tier): age 70-74 column = 9, SBP <110 column = 2.
  const hi = maggic({ age: 72, lvef: 45, nyha: 1, sbp: 100, bmi: 24, creatinine: 1.0, onBetaBlocker: true, onAceArb: true });
  // EF 25 (<30 tier): age 70-74 column = 6, SBP <110 column = 5.
  const lo = maggic({ age: 72, lvef: 25, nyha: 1, sbp: 100, bmi: 24, creatinine: 1.0, onBetaBlocker: true, onAceArb: true });
  const ageHi = hi.items.find((i) => i.label.startsWith('Age')).value;
  const ageLo = lo.items.find((i) => i.label.startsWith('Age')).value;
  assert.equal(ageHi, 9);
  assert.equal(ageLo, 6);
});

test('best-case low score maps to low mortality', () => {
  const r = maggic({ age: 50, lvef: 60, nyha: 1, sbp: 160, bmi: 24, creatinine: 0.8, onBetaBlocker: true, onAceArb: true });
  assert.equal(r.total, 3);
  assert.equal(r.mortality1yr, 2);
});

test('out-of-table sum clamps to the 0-50 mortality row, no undefined', () => {
  const r = maggic({ age: 90, lvef: 10, nyha: 4, sbp: 90, bmi: 14, creatinine: 5, diabetes: true, copd: true, smoker: true, hfOver18mo: true });
  assert.ok(r.total > 50);
  assert.equal(r.scoredTotal, 50);
  assert.equal(r.mortality1yr, 84.2);
  assert.equal(r.mortality3yr, 98.5);
});
