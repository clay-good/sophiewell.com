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
  const extreme = grobmanVbac({ age: 55, weight: 200, height: 150, vaginalHistory: 'none', arrestIndication: '1', chronicHtn: '1' });
  assert.ok(extreme.probability >= 0 && extreme.probability <= 100);
  assert.equal(grobmanVbac({ age: 30, weight: 80 }).valid, false);

  // spec-v1117: the vaginal-delivery history fell back to 'none', which is not a
  // neutral default but the strongest negative term -- so an unstated obstetric
  // history reported the lowest success probability the model can give.
  const unstated = grobmanVbac({ age: 30, weight: 80, height: 165 });
  assert.equal(unstated.valid, false);
  assert.match(unstated.band, /prior vaginal-delivery history is needed/);
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

// spec-v1166: `o.sex === 'male' ? 'male' : 'female'` made an UNSTATED sex a female
// one, and the waist bands are sex-specific -- so an unstated sex scored the waist
// higher, in the alarming direction, for a fact nobody had been asked.
test('findrisc: an unstated sex gives the range the two waist bands span', () => {
  const base = { age: 60, bmi: 32, waist: 90, familyHistory: 'none' };
  const male = findrisc({ ...base, sex: 'male' });
  const female = findrisc({ ...base, sex: 'female' });
  assert.equal(male.score, 9);
  assert.equal(female.score, 13);
  assert.equal(male.sexStated, true);

  // The defect, stated: an absent sex used to score exactly as a female one.
  const absent = findrisc(base);
  assert.equal(absent.sexStated, false);
  assert.notEqual(absent.score, female.score);
  assert.equal(absent.score, 9);
  assert.equal(absent.scoreCeiling, 13);
  assert.equal(absent.riskBand, null);
  assert.match(absent.band, /FINDRISC 9 to 13 of 26/);
  assert.match(absent.band, /the sex is not stated/);
  assert.match(absent.band, /0 points as a man and 4 as a woman/);

  // Rule 25: where both bands give the same points, the reading is decided even
  // though the sex was never stated -- two different facts, reported separately.
  const wide = findrisc({ ...base, waist: 120 });
  assert.equal(wide.sexStated, false);
  assert.equal(wide.waistDecided, true);
  assert.equal(wide.riskBand, 'moderate');
  assert.doesNotMatch(wide.band, /not stated/);
  const narrow = findrisc({ ...base, waist: 60 });
  assert.equal(narrow.sexStated, false);
  assert.equal(narrow.waistDecided, true);
  assert.equal(narrow.riskBand, 'slightly elevated');
  assert.doesNotMatch(narrow.band, /not stated/);
  // And with the sex given, both are true.
  assert.equal(male.waistDecided, true);
  assert.equal(absent.waistDecided, false);
});
