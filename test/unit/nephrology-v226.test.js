// spec-v226: worked examples for the nephrology / fluid formulas. Formulas
// spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  watsonTbw, salazarCorcoran, epvs, furosemideStressTest, feBicarbonate, correctedPotassiumPh,
} from '../../lib/nephrology-v226.js';

test('watson: male equation', () => {
  const r = watsonTbw({ age: 40, height: 175, weight: 80 });
  assert.equal(r.value, 44.5);
});
test('watson: female equation differs', () => {
  const r = watsonTbw({ age: 40, height: 175, weight: 80, female: true });
  assert.ok(r.value < 44.5);
});
test('watson: invalid without inputs', () => { assert.equal(watsonTbw({}).valid, false); });

test('salazar: obese CrCl', () => {
  const r = salazarCorcoran({ age: 50, weight: 120, height: 170, creatinine: 1.2 });
  assert.equal(r.value, 98.3);
});
test('salazar: invalid on zero creatinine', () => { assert.equal(salazarCorcoran({ age: 50, weight: 120, height: 170, creatinine: 0 }).valid, false); });

test('epvs: Duarte formula', () => {
  const r = epvs({ hematocrit: 40, hemoglobin: 13 });
  assert.equal(r.value, 4.62);
});

test('fst: progression at <= 200', () => {
  const r = furosemideStressTest({ weight: 70, urineOutput2h: 150 });
  assert.equal(r.dose, 70);
  assert.equal(r.progression, true);
});
test('fst: prior exposure uses 1.5 mg/kg', () => {
  const r = furosemideStressTest({ weight: 70, urineOutput2h: 300, priorExposure: true });
  assert.equal(r.dose, 105);
  assert.equal(r.progression, false);
});

test('fe-bicarbonate: distal band', () => {
  const r = feBicarbonate({ urineHco3: 20, plasmaHco3: 24, plasmaCr: 1.0, urineCr: 50 });
  assert.equal(r.value, 1.67);
  assert.match(r.band, /distal/);
});
test('fe-bicarbonate: proximal band', () => {
  const r = feBicarbonate({ urineHco3: 40, plasmaHco3: 24, plasmaCr: 2.0, urineCr: 20 });
  assert.ok(r.value > 15);
  assert.match(r.band, /proximal/);
});

test('corrected-k: rule of thumb', () => {
  const r = correctedPotassiumPh({ potassium: 5.4, ph: 7.2 });
  assert.equal(r.corrected, 4.2);
});
test('corrected-k: invalid pH out of range', () => { assert.equal(correctedPotassiumPh({ potassium: 4, ph: 5 }).valid, false); });
