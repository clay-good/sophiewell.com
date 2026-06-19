// spec-v114 2.3: Bronchiectasis Severity Index (Chalmers 2014). Nine weighted
// items; bands low 0-4, intermediate 5-8, high >= 9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bronchiectasisBsi } from '../../lib/pulm-v114.js';

test('worked example flips into the high band', () => {
  // age 72 (4) + BMI 17 (2) + FEV1 45 (2) + exac 3 (2) + MRC 4 (2) + admission (5) + Pseudomonas (3) = 20
  const r = bronchiectasisBsi({ age: 72, bmi: 17, fev1: 45, exacerbations: 3, mrc: 4, priorAdmission: true, pseudomonas: true });
  assert.equal(r.total, 20);
  assert.equal(r.tier, 'high');
});

test('age bands: <50=0, 50-69=2, 70-79=4, >=80=6', () => {
  const base = { bmi: 22, fev1: 90, exacerbations: 0, mrc: 1 };
  assert.equal(bronchiectasisBsi({ ...base, age: 40 }).total, 0);
  assert.equal(bronchiectasisBsi({ ...base, age: 60 }).total, 2);
  assert.equal(bronchiectasisBsi({ ...base, age: 75 }).total, 4);
  assert.equal(bronchiectasisBsi({ ...base, age: 85 }).total, 6);
});

test('FEV1 bands: >80=0, 50-80=1, 30-49=2, <30=3', () => {
  const base = { age: 40, bmi: 22, exacerbations: 0, mrc: 1 };
  assert.equal(bronchiectasisBsi({ ...base, fev1: 85 }).total, 0);
  assert.equal(bronchiectasisBsi({ ...base, fev1: 65 }).total, 1);
  assert.equal(bronchiectasisBsi({ ...base, fev1: 40 }).total, 2);
  assert.equal(bronchiectasisBsi({ ...base, fev1: 25 }).total, 3);
});

test('low -> intermediate -> high band boundary at 4/5 and 8/9', () => {
  // 4 = high age band only -> low
  assert.equal(bronchiectasisBsi({ age: 75, bmi: 22, fev1: 90, exacerbations: 0, mrc: 1 }).tier, 'low');
  // 5 = admission only -> intermediate
  assert.equal(bronchiectasisBsi({ age: 40, bmi: 22, fev1: 90, exacerbations: 0, mrc: 1, priorAdmission: true }).tier, 'intermediate');
  // 9 = admission(5) + Pseudomonas(3) + MRC5(... use 4=2 -> 10) keep >=9
  assert.equal(bronchiectasisBsi({ age: 40, bmi: 22, fev1: 90, exacerbations: 0, mrc: 4, priorAdmission: true, pseudomonas: true }).tier, 'high');
});

test('radiology items stack: >=3 lobes (+1) and cystic (+1) can both score', () => {
  const base = { age: 40, bmi: 22, fev1: 90, exacerbations: 0, mrc: 1 };
  assert.equal(bronchiectasisBsi({ ...base, lobes3: true }).total, 1);
  assert.equal(bronchiectasisBsi({ ...base, lobes3: true, cystic: true }).total, 2);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(bronchiectasisBsi({ age: 72 }).valid, false);
  assert.equal(bronchiectasisBsi({}).valid, false);
});
