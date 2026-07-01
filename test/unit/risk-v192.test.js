// spec-v192 §2: screening / bedside-risk instruments - FINDRISC, the Grobman
// race-free VBAC calculator, the Marburg Heart Score, and the ADHERE CART tree.
// (GWTG-HF deferred - see lib/risk-v192.js header and docs/scope-post-parity.md.)
// Point tables / coefficients / thresholds cross-verified (spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findrisc, grobmanVbac, marburgHeartScore, adhereHf } from '../../lib/risk-v192.js';

test('findrisc: point table and 10-year risk bands', () => {
  // healthy young -> low
  const low = findrisc({ age: 30, bmi: 22, waist: 75, sex: 'female', active: '1', fruitVeg: '1' });
  assert.equal(low.score, 0);
  assert.equal(low.riskBand, 'low');
  // age 60 (3) + BMI 32 (3) + waist 90 female (4) + inactive (2) = 12 -> moderate
  const mod = findrisc({ age: 60, bmi: 32, waist: 90, sex: 'female', active: false, fruitVeg: '1', familyHistory: 'none' });
  assert.equal(mod.score, 12);
  assert.equal(mod.riskBand, 'moderate');
  // max-ish -> very high
  const vh = findrisc({ age: 70, bmi: 32, waist: 105, sex: 'male', active: false, fruitVeg: false, bpMed: '1', highGlucose: '1', familyHistory: 'first' });
  assert.equal(vh.score, 26);
  assert.equal(vh.riskBand, 'very high');
  assert.equal(findrisc({ age: 50 }).valid, false);
});

test('grobman-vbac: race-free 2021 logistic, prior-VBAC contrast', () => {
  const vbac = grobmanVbac({ age: 30, weight: 80, height: 165, vaginalHistory: 'vbac' });
  assert.equal(vbac.probability, 92.7);
  const none = grobmanVbac({ age: 30, weight: 80, height: 165, vaginalHistory: 'none' });
  assert.equal(none.probability, 66.3);
  assert.ok(vbac.probability > none.probability);
  // probability stays within [0, 100]
  const extreme = grobmanVbac({ age: 55, weight: 200, height: 150, arrestIndication: '1', chronicHtn: '1' });
  assert.ok(extreme.probability >= 0 && extreme.probability <= 100);
  assert.equal(grobmanVbac({ age: 30, weight: 80 }).valid, false);
});

test('marburg-heart-score: five criteria and the >= 3 threshold', () => {
  assert.equal(marburgHeartScore({}).score, 0);
  const two = marburgHeartScore({ ageSex: '1', vascular: '1' });
  assert.equal(two.score, 2);
  assert.equal(two.abnormal, false); // CAD unlikely
  const three = marburgHeartScore({ ageSex: '1', vascular: '1', worseExercise: '1' });
  assert.equal(three.score, 3);
  assert.equal(three.abnormal, true); // higher risk
});

test('adhere-hf: CART tree reaches each terminal node', () => {
  assert.equal(adhereHf({ bun: 30, sbp: 130 }).group, 'low');
  assert.match(adhereHf({ bun: 30, sbp: 130 }).mortality, /2\.1/);
  assert.equal(adhereHf({ bun: 30, sbp: 100 }).group, 'intermediate'); // ~5.5%
  assert.equal(adhereHf({ bun: 50, sbp: 130 }).group, 'intermediate'); // ~6.4%
  assert.equal(adhereHf({ bun: 50, sbp: 100, creatinine: 2.0 }).group, 'intermediate'); // ~12.4%
  const high = adhereHf({ bun: 50, sbp: 100, creatinine: 3.0 });
  assert.equal(high.group, 'high');
  assert.match(high.mortality, /21\.9/);
  // the deep split needs creatinine
  assert.equal(adhereHf({ bun: 50, sbp: 100 }).valid, false);
  assert.equal(adhereHf({ bun: 30 }).valid, false);
});
