// spec-v152 2.5: Ireton-Jones energy equation, 1997 revised (Ireton-Jones 2002).
// Ventilated EEE = 1784 - 11*age + 5*wt + 244*(male) + 239*(trauma) + 804*(burn);
// spontaneous EEE = 629 - 11*age + 25*wt - 609*(obese, BMI>27).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iretonJones } from '../../lib/nutrition-energy-v152.js';

test('tile example: ventilated male 55 yr / 80 kg, no trauma/burn -> 1823', () => {
  // 1784 - 11*55 + 5*80 + 244 + 0 + 0 = 1784 - 605 + 400 + 244 = 1823.
  const r = iretonJones({ mode: 'ventilated', age: 55, weight: 80, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.mode, 'ventilated');
  assert.equal(r.score, 1823);
});

test('ventilated trauma + burn modifiers add 239 + 804', () => {
  const base = iretonJones({ mode: 'ventilated', age: 55, weight: 80, sex: 'male' }).score;
  const r = iretonJones({ mode: 'ventilated', age: 55, weight: 80, sex: 'male', trauma: true, burn: true });
  assert.equal(r.score, base + 239 + 804); // 2866
});

test('female ventilated drops the 244 male indicator', () => {
  const r = iretonJones({ mode: 'ventilated', age: 55, weight: 80, sex: 'female' });
  assert.equal(r.score, 1823 - 244); // 1579
});

test('spontaneous form, non-obese (BMI 26.1) -> 2024', () => {
  // 629 - 11*55 + 25*80 - 0 = 629 - 605 + 2000 = 2024; BMI 80/1.75^2 = 26.1 (<=27).
  const r = iretonJones({ mode: 'spontaneous', age: 55, weight: 80, height: 175 });
  assert.equal(r.mode, 'spontaneous');
  assert.equal(r.score, 2024);
});

test('spontaneous obese (BMI>27) subtracts 609', () => {
  // 90 kg / 175 cm -> BMI 29.4 > 27. 629 - 605 + 2250 - 609 = 1665.
  const r = iretonJones({ mode: 'spontaneous', age: 55, weight: 90, height: 175 });
  assert.equal(r.score, 1665);
});

test('blank input -> valid:false', () => {
  assert.equal(iretonJones({ mode: 'ventilated', age: 55 }).valid, false);
  assert.equal(iretonJones({}).valid, false);
});
