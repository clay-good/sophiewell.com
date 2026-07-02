// spec-v205 2.4: COPD Assessment Test worked examples across the impact bands.
// 8 items each 0-5, total 0-40; low <10, medium 10-20, high 21-30, very high >30;
// GOLD >=10 symptomatic. Scoring spec-v97 cross-verified (Jones 2009 / GOLD /
// GPnotebook).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cat } from '../../lib/pulm-copd-v205.js';

const full = (v) => ({ cough: v, phlegm: v, chest: v, breathless: v, activity: v, confidence: v, sleep: v, energy: v });

test('high-impact worked example (total 24)', () => {
  const r = cat({ cough: 4, phlegm: 3, chest: 2, breathless: 4, activity: 3, confidence: 2, sleep: 3, energy: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 24);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high impact/);
});

test('low-impact case (< 10) is below the GOLD threshold', () => {
  const r = cat({ cough: 1, phlegm: 1, chest: 1, breathless: 2, activity: 1, confidence: 0, sleep: 1, energy: 1 });
  assert.equal(r.score, 8);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low impact/);
});

test('maximum score 40 -> very high impact', () => {
  const r = cat(full(5));
  assert.equal(r.score, 40);
  assert.match(r.band, /very high/);
});

test('GOLD threshold at 10', () => {
  assert.equal(cat(full(1)).abnormal, false); // total 8
  const nine = { ...full(1), breathless: 2 }; // 9
  assert.equal(cat(nine).abnormal, false);
  const ten = { ...full(1), breathless: 3 }; // 10
  assert.equal(cat(ten).abnormal, true);
});

test('missing an item -> complete-the-fields', () => {
  const r = cat({ cough: 3 });
  assert.equal(r.valid, false);
  assert.match(r.message, /eight CAT items/);
});

test('out-of-range item is rejected', () => {
  const r = cat({ ...full(2), cough: 6 });
  assert.equal(r.valid, false);
});
