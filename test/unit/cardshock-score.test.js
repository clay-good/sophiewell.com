// spec-v102 2.5: CardShock Risk Score (Harjola 2015).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardShock } from '../../lib/cardio-v102.js';

test('missing lactate/eGFR -> invalid', () => {
  assert.equal(cardShock({ acs: true }).valid, false);
});

test('low-risk case -> 2, low (~8.7%)', () => {
  const r = cardShock({ acs: true, lowEf: true, lactate: 1.5, egfr: 80 });
  assert.equal(r.total, 2);
  assert.equal(r.risk, 'low');
});

test('3 -> 4 flips low to intermediate', () => {
  const lo = cardShock({ ageOver75: true, confusion: true, priorMiCabg: true, lactate: 1, egfr: 70 });
  const hi = cardShock({ ageOver75: true, confusion: true, priorMiCabg: true, acs: true, lactate: 1, egfr: 70 });
  assert.equal(lo.total, 3);
  assert.equal(lo.risk, 'low');
  assert.equal(hi.total, 4);
  assert.equal(hi.risk, 'intermediate');
});

test('lactate and eGFR are graded bands', () => {
  assert.equal(cardShock({ lactate: 1.9, egfr: 61 }).total, 0);
  assert.equal(cardShock({ lactate: 3, egfr: 45 }).total, 2); // 1 + 1
  assert.equal(cardShock({ lactate: 5, egfr: 20 }).total, 4); // 2 + 2
});

test('maximum is 9, high (~77%)', () => {
  const r = cardShock({ ageOver75: true, confusion: true, priorMiCabg: true, acs: true, lowEf: true, lactate: 5, egfr: 25 });
  assert.equal(r.total, 9);
  assert.equal(r.risk, 'high');
});
