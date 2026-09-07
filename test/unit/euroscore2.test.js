// spec-v105 2.4: EuroSCORE II in-hospital cardiac-surgery mortality (Nashef 2012
// EJCTS Table 6 multivariate coefficients). Logistic e^y/(1+e^y).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { euroScore2, euroScore2Coefficients } from '../../lib/vascular-v105.js';

test('published worked example -> 10.66% (y = -2.126358)', () => {
  // 70yo dialysis-dependent woman, insulin diabetes, COPD, NYHA III, CCS-4, poor
  // LV, recent MI, isolated elective CABG.
  const r = euroScore2({
    age: 70, female: true, insulinDiabetes: true, chronicPulmonary: true,
    nyha: '3', ccs4: true, lvFunction: 'poor', recentMi: true,
    renal: 'dialysis', urgency: 'elective', weightOfIntervention: 'cabg',
  });
  assert.equal(r.valid, true);
  assert.equal(r.y, -2.13);
  assert.equal(r.mortality, 10.66);
  assert.equal(r.tier, 'very high');
});

test('low-risk baseline: 60yo male elective isolated CABG, nothing else', () => {
  const r = euroScore2({
    age: 60, urgency: 'elective', weightOfIntervention: 'cabg',
    nyha: '1', lvFunction: 'good', renal: 'normal', pulmonaryHypertension: 'none',
  });
  // y = -5.324537 + 0.0285181*1 ; mortality ~0.49% -> rounds to 0.5
  assert.equal(r.mortality, 0.5);
  assert.equal(r.tier, 'low');
});

test('age term uses max(1, age-59): age <= 60 all map to x = 1', () => {
  const a = euroScore2({ age: 40, urgency: 'elective', weightOfIntervention: 'cabg' });
  const b = euroScore2({ age: 60, urgency: 'elective', weightOfIntervention: 'cabg' });
  assert.equal(a.mortality, b.mortality);
  const c = euroScore2({ age: 61, urgency: 'elective', weightOfIntervention: 'cabg' });
  assert.ok(c.mortality > b.mortality);
});

test('dialysis coefficient is LOWER than CrCl<=50 (published model feature)', () => {
  const dial = euroScore2({ age: 65, renal: 'dialysis', urgency: 'elective', weightOfIntervention: 'cabg' });
  const cc50 = euroScore2({ age: 65, renal: 'cc-le50', urgency: 'elective', weightOfIntervention: 'cabg' });
  assert.ok(dial.mortality < cc50.mortality);
});

test('blank age -> surfaced fallback, no probability from NaN', () => {
  assert.equal(euroScore2({ female: true }).valid, false);
  assert.equal(euroScore2({}).valid, false);
});

test('extreme inputs stay bounded in [0, 100]%', () => {
  const r = euroScore2({
    age: 95, female: true, insulinDiabetes: true, chronicPulmonary: true,
    extracardiacArteriopathy: true, poorMobility: true, previousCardiacSurgery: true,
    activeEndocarditis: true, criticalPreop: true, recentMi: true, ccs4: true,
    thoracicAorta: true, nyha: '4', lvFunction: 'very-poor', pulmonaryHypertension: 'severe',
    urgency: 'salvage', weightOfIntervention: 'three', renal: 'dialysis',
  });
  assert.ok(r.mortality >= 0 && r.mortality <= 100);
  assert.ok(Number.isFinite(r.mortality));
});

// --- spec-v1107: an unstated category was scored as the healthiest one ---

test('spec-v1107: every graded coefficient is >= 0, which is what makes it a floor', () => {
  // The disclosure below says "each can only raise it". That sentence is false
  // the day a negative coefficient is added, and nothing else would notice.
  for (const key of ['nyha', 'lv', 'pa', 'urgency', 'weight', 'renal']) {
    for (const [level, coefficient] of Object.entries(euroScore2Coefficients[key])) {
      assert.ok(coefficient >= 0, `${key}.${level} is ${coefficient}: the floor claim no longer holds`);
    }
  }
});

test('spec-v1107: an age alone is not a low-risk patient', () => {
  const r = euroScore2({ age: 85 });
  assert.equal(r.valid, true);
  assert.equal(r.unstated.length, 6);
  assert.equal(r.floorOnly, true);
  assert.equal(r.tier, null, 'a tier from six unstated factors is not a tier');
  assert.match(r.band, /at least 1\.01% on what was stated/);
  assert.match(r.band, /6 of the 6 graded factors were not stated/);
  assert.match(r.band, /can only raise it/);
  assert.doesNotMatch(r.band, /low predicted operative risk/);
  // The number itself is unchanged: it is a floor, not a different estimate.
  assert.equal(r.mortality, 1.01);
});

test('spec-v1107: one unstated factor is named on its own', () => {
  const stated = {
    age: 70, nyha: '3', lvFunction: 'moderate', pulmonaryHypertension: 'moderate',
    renal: 'cc51-85', urgency: 'urgent', weightOfIntervention: 'two',
  };
  const full = euroScore2(stated);
  assert.equal(full.floorOnly, false);
  assert.equal(full.tier, 'intermediate');
  assert.deepEqual(full.unstated, []);

  const { nyha, ...withoutNyha } = stated;
  const r = euroScore2(withoutNyha);
  assert.deepEqual(r.unstated, ['the NYHA class']);
  assert.match(r.band, /1 of the 6 graded factors was not stated \(the NYHA class\)/);
  // spec-v1102 measured this drop and left it open: 4.53% down to 3.41%.
  assert.equal(r.mortality, 3.41);
  assert.ok(r.mortality < full.mortality, 'an unstated factor lowered the estimate');
});

test('spec-v1107: the top tier rules in and needs no footing', () => {
  // Rule 13: an unstated covariate cannot talk "very high" down.
  const r = euroScore2({ age: 80, nyha: '4', lvFunction: 'very-poor', urgency: 'salvage' });
  assert.equal(r.tier, 'very high');
  assert.equal(r.floorOnly, false);
  assert.ok(r.unstated.length > 0, 'this call does leave factors unstated');
  assert.doesNotMatch(r.band, /at least/);
});

test('spec-v1107: an unrecognised value is unstated, not the reference level', () => {
  // The reference level of each table is the healthiest option, so a typo used
  // to be scored as the best possible answer.
  const typo = euroScore2({ age: 70, urgency: 'Emergency' });
  assert.ok(typo.unstated.includes('the urgency'));
  assert.equal(typo.mortality, euroScore2({ age: 70 }).mortality);
});
