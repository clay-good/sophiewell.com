// spec-v152 2.4: Penn State ventilated REE (Frankenfield 2004/2009). Standard
// (2003b) RMR = Mifflin*0.96 + Tmax*167 + Ve*31 - 6212; modified (2010) RMR =
// Mifflin*0.71 + Tmax*85 + Ve*64 - 3085 applies ONLY when BMI>=30 AND age>=60.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pennStateRee } from '../../lib/nutrition-energy-v152.js';

test('tile example: standard 2003b branch (BMI 22.9, age 40) -> RMR 2031', () => {
  // Mifflin male 70/175/40 = 1598.75; 1598.75*0.96 + 38.5*167 + 9*31 - 6212
  // = 1534.8 + 6429.5 + 279 - 6212 = 2031.3 -> 2031.
  const r = pennStateRee({ weight: 70, height: 175, age: 40, sex: 'male', tmax: 38.5, ve: 9 });
  assert.equal(r.valid, true);
  assert.equal(r.branch, 'standard');
  assert.equal(r.score, 2031);
});

test('modified 2010 branch when BMI>=30 AND age>=60 -> RMR 2000', () => {
  // Mifflin male 100/165/65 = 1711.25; 1711.25*0.71 + 38*85 + 10*64 - 3085
  // = 1214.9875 + 3230 + 640 - 3085 = 1999.9875 -> 2000.
  const r = pennStateRee({ weight: 100, height: 165, age: 65, sex: 'male', tmax: 38, ve: 10 });
  assert.equal(r.branch, 'modified');
  assert.equal(r.score, 2000);
});

test('obese but young (BMI>=30, age<60) still uses standard form', () => {
  const r = pennStateRee({ weight: 100, height: 165, age: 45, sex: 'male', tmax: 38, ve: 10 });
  assert.equal(r.branch, 'standard');
});

test('blank input -> valid:false complete-the-fields', () => {
  assert.equal(pennStateRee({ weight: 70, height: 175, age: 40 }).valid, false);
  assert.equal(pennStateRee({}).valid, false);
});
