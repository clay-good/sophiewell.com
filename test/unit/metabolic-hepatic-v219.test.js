// spec-v219: worked examples for the metabolic & hepatic indices.
// Formulas spec-v97 cross-verified (see module header for source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  adaDiabetesRisk, cambridgeDiabetes, lap, vai, conicity, astAltRatio, ggtPlatelet,
} from '../../lib/metabolic-hepatic-v219.js';

test('ada: banded age/BMI plus booleans', () => {
  const r = adaDiabetesRisk({ age: 55, bmi: 32, male: true, hypertension: true }); // 2+2+1+1
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
});
test('ada: low risk below 5', () => {
  const r = adaDiabetesRisk({ age: 30, bmi: 22 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
test('ada: invalid without age/bmi', () => { assert.equal(adaDiabetesRisk({}).valid, false); });

test('cambridge: probability in range', () => {
  const r = cambridgeDiabetes({ age: 45, bmi: 24, familyHistory: '0', smoking: '0' });
  assert.equal(r.valid, true);
  assert.ok(r.probability > 0 && r.probability < 100);
  assert.equal(r.probability, 2.97);
});
test('cambridge: risk rises with factors', () => {
  const low = cambridgeDiabetes({ age: 40, bmi: 22 }).probability;
  const high = cambridgeDiabetes({ age: 65, bmi: 35, antihypertensive: true, familyHistory: '2', smoking: '2' }).probability;
  assert.ok(high > low);
});

test('lap: sex-specific base', () => {
  assert.equal(lap({ waist: 100, triglycerides: 2.0 }).value, 70); // (100-65)*2
  assert.equal(lap({ waist: 100, triglycerides: 2.0, female: true }).value, 84); // (100-58)*2
});
test('lap: floors negative waist term', () => {
  assert.equal(lap({ waist: 50, triglycerides: 2.0 }).value, 0);
});

test('vai: near 1 for healthy profile', () => {
  const r = vai({ waist: 80, bmi: 22, triglycerides: 1.0, hdl: 1.3 });
  assert.ok(r.value > 0.8 && r.value < 1.1);
});
test('vai: example value', () => {
  assert.equal(vai({ waist: 100, bmi: 30, triglycerides: 2.0, hdl: 1.0 }).value, 2.65);
});
test('vai: invalid without hdl', () => { assert.equal(vai({ waist: 100, bmi: 30, triglycerides: 2 }).valid, false); });

test('conicity: computed', () => {
  const r = conicity({ waist: 100, weight: 80, height: 175 });
  assert.equal(r.value, 1.36);
});

test('ast-alt: bands', () => {
  assert.match(astAltRatio({ ast: 60, alt: 30 }).band, /1-2/);
  assert.match(astAltRatio({ ast: 90, alt: 30 }).band, /alcoholic/);
  const low = astAltRatio({ ast: 20, alt: 40 });
  assert.equal(low.ratio, 0.5);
  assert.equal(low.abnormal, false);
});
test('ast-alt: invalid on zero ALT', () => { assert.equal(astAltRatio({ ast: 40, alt: 0 }).valid, false); });

test('gpr: cutoff at 0.32', () => {
  const r = ggtPlatelet({ ggt: 100, ggtUln: 50, platelets: 200 }); // (2/200)*100 = 1
  assert.equal(r.gpr, 1);
  assert.equal(r.abnormal, true);
});
test('gpr: below cutoff', () => {
  const r = ggtPlatelet({ ggt: 30, ggtUln: 50, platelets: 300 }); // (0.6/300)*100 = 0.2
  assert.equal(r.gpr, 0.2);
  assert.equal(r.abnormal, false);
});
test('gpr: invalid on zero platelets', () => { assert.equal(ggtPlatelet({ ggt: 100, ggtUln: 50, platelets: 0 }).valid, false); });
