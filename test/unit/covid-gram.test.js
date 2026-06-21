// spec-v137 2.2: COVID-GRAM Critical Illness Risk Score (Liang W, et al, JAMA
// Intern Med 2020;180:1081). Logistic model p = 1/(1+e^-x); betas = ln(published
// odds ratios), intercept = ln(0.001). Tests pin a worked probability, the
// monotonic effect of each predictor, the logistic clamp under extreme fuzzed
// inputs, and the complete-the-fields fallback.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { covidGram } from '../../lib/id-v137.js';

const base = { xray: 'no', age: 50, hemoptysis: 'no', dyspnea: 'no', unconscious: 'no', comorbidities: 0, cancer: 'no', nlr: 3, ldh: 300, db: 5 };

test('worked example: low-risk profile ~1.9%', () => {
  const r = covidGram(base);
  assert.equal(r.valid, true);
  // x = -6.9078 + 0.02956*50 + 0.05827*3 + 0.0019980*300 + 0.13976*5 = -3.9568
  assert.ok(Math.abs(r.probability - 1.9) < 0.2, `got ${r.probability}`);
});

test('adding chest-imaging abnormality raises the probability', () => {
  const without = covidGram(base).probability;
  const with_ = covidGram({ ...base, xray: 'yes' }).probability;
  assert.ok(with_ > without);
});

test('unconsciousness (largest OR) raises probability more than dyspnea (smallest binary OR)', () => {
  const baseP = covidGram(base).probability;
  const unc = covidGram({ ...base, unconscious: 'yes' }).probability - baseP;
  const dysp = covidGram({ ...base, dyspnea: 'yes' }).probability - baseP;
  assert.ok(unc > dysp);
});

test('probability is bounded in [0, 100] under extreme inputs (logistic clamp)', () => {
  const hi = covidGram({ xray: 'yes', age: 120, hemoptysis: 'yes', dyspnea: 'yes', unconscious: 'yes', comorbidities: 10, cancer: 'yes', nlr: 1000, ldh: 50000, db: 5000 });
  assert.equal(hi.valid, true);
  assert.ok(hi.probability >= 0 && hi.probability <= 100);
  assert.ok(Number.isFinite(hi.probability));
});

test('missing any predictor surfaces the fallback (never scores a blank as 0)', () => {
  assert.equal(covidGram({}).valid, false);
  assert.equal(covidGram({ ...base, xray: '' }).valid, false);
  assert.equal(covidGram({ ...base, age: null }).valid, false);
  assert.equal(covidGram({ ...base, nlr: null }).valid, false);
  assert.equal(covidGram({ ...base, ldh: null }).valid, false);
  assert.equal(covidGram({ ...base, db: null }).valid, false);
});

test('comorbidity count is allowed to be 0 and still valid', () => {
  assert.equal(covidGram({ ...base, comorbidities: 0 }).valid, true);
});
