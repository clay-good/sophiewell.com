// spec-v56 §2.12: pediatric resuscitation bolus (PALS).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsResus } from '../../lib/medication-v5.js';

test('15 kg x 20 mL/kg -> 300 mL, no caution in sepsis', () => {
  const r = pedsResus({ weightKg: 15, mlPerKg: 20, context: 'sepsis' });
  assert.equal(r.bolusMl, 300);
  assert.equal(r.cardiacCautionFlag, false);
  assert.equal(r.weightCapped, false);
});

test('10 mL/kg path', () => {
  const r = pedsResus({ weightKg: 20, mlPerKg: 10 });
  assert.equal(r.bolusMl, 200);
});

test('cardiac/DKA + 20 mL/kg raises the caution flag', () => {
  const r = pedsResus({ weightKg: 15, mlPerKg: 20, context: 'cardiac-dka' });
  assert.equal(r.cardiacCautionFlag, true);
});

test('weight capped at 50 kg adult dose', () => {
  const r = pedsResus({ weightKg: 70, mlPerKg: 20 });
  assert.equal(r.bolusMl, 1000); // 50*20
  assert.equal(r.weightCapped, true);
});

test('rejects impossible weight / rate', () => {
  assert.throws(() => pedsResus({ weightKg: 0, mlPerKg: 20 }), /weightKg/);
  assert.throws(() => pedsResus({ weightKg: 15, mlPerKg: 50 }), /mlPerKg/);
});
