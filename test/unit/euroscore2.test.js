// spec-v105 2.4: EuroSCORE II in-hospital cardiac-surgery mortality (Nashef 2012
// EJCTS Table 6 multivariate coefficients). Logistic e^y/(1+e^y).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { euroScore2 } from '../../lib/vascular-v105.js';

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
