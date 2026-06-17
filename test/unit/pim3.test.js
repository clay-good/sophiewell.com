// spec-v98 2.3: Paediatric Index of Mortality 3 (Straney 2013). Fixed logistic
// equation; predicted death = e^logit / (1 + e^logit).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pim3 } from '../../lib/peds-v98.js';

test('worked logistic probability matches the published equation', () => {
  // SBP 90, vent on (+0.9763), base excess |-5| (+0.3355), high-risk dx (+1.0725):
  // logit = -1.7928 + 0.9763 + 0.0671*5 - 0.0431*90 + 0.1716*(90*90/1000) + 1.0725.
  const r = pim3({ sbp: 90, mechVent: true, baseExcess: -5, riskCategory: 'high' });
  assert.equal(r.valid, true);
  assert.equal(r.x, -1.9);
  assert.equal(r.risk, 13.04);
});

test('overflow guard: a huge linear predictor yields a finite probability in [0,100]', () => {
  const r = pim3({ sbp: 1e9, mechVent: true, baseExcess: 1e9, riskCategory: 'very-high' });
  assert.equal(r.valid, true);
  assert.ok(Number.isFinite(r.risk));
  assert.ok(r.risk >= 0 && r.risk <= 100);
});

test('elective and low-risk-diagnosis terms lower the probability', () => {
  const sick = pim3({ sbp: 60, mechVent: true, baseExcess: -10, riskCategory: 'very-high' });
  const well = pim3({ sbp: 110, elective: true, riskCategory: 'low' });
  assert.ok(well.risk < sick.risk);
});

test('blank SBP surfaces the complete-the-fields fallback', () => {
  const r = pim3({ mechVent: true, riskCategory: 'none' });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});

test('FiO2*100/PaO2 only contributes when both gas values are present', () => {
  const without = pim3({ sbp: 90, riskCategory: 'none' });
  const withGas = pim3({ sbp: 90, fio2: 0.6, paO2: 60, riskCategory: 'none' });
  assert.ok(withGas.risk > without.risk);
});
