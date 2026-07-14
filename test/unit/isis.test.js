// spec-v302: Instability Severity Index Score (ISIS). Worked-example tests: the
// empty score (0), the maximum (10), each factor's weight, the >6 high-risk
// threshold (6 is not high risk, 7 is), and the boolean coercions. Points
// cross-verified against Balg & Boileau 2007 and the Clin Orthop Surg 2019
// reliability study (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isisScore } from '../../lib/isis-v302.js';

test('no factors is 0 of 10, not high risk', () => {
  const r = isisScore({});
  assert.equal(r.total, 0);
  assert.equal(r.max, 10);
  assert.equal(r.highRisk, false);
  assert.equal(r.abnormal, false);
});

test('all factors sum to the maximum of 10', () => {
  const r = isisScore({ ageUnder20: true, competitive: true, contactSport: true, hyperlaxity: true, hillSachs: true, glenoidLoss: true });
  assert.equal(r.total, 10);
  assert.equal(r.highRisk, true);
});

test('each factor carries its published weight (2/2/1/1/2/2)', () => {
  assert.equal(isisScore({ ageUnder20: true }).total, 2);
  assert.equal(isisScore({ competitive: true }).total, 2);
  assert.equal(isisScore({ contactSport: true }).total, 1);
  assert.equal(isisScore({ hyperlaxity: true }).total, 1);
  assert.equal(isisScore({ hillSachs: true }).total, 2);
  assert.equal(isisScore({ glenoidLoss: true }).total, 2);
});

test('the >6 cutoff is strict: 6 is not high risk, 7 is', () => {
  // 2 + 2 + 2 = 6 (age, competitive, Hill-Sachs) -> not high risk.
  const six = isisScore({ ageUnder20: true, competitive: true, hillSachs: true });
  assert.equal(six.total, 6);
  assert.equal(six.highRisk, false);
  // + contact sport (1) = 7 -> high risk.
  const seven = isisScore({ ageUnder20: true, competitive: true, hillSachs: true, contactSport: true });
  assert.equal(seven.total, 7);
  assert.equal(seven.highRisk, true);
  assert.match(seven.band, /an open procedure/);
});

test('boolean coercion accepts checkbox-style values', () => {
  assert.equal(isisScore({ ageUnder20: '1', competitive: 'on', hillSachs: 'true' }).total, 6);
});

test('the worked example (age + competitive + Hill-Sachs + glenoid) is 8 and high risk', () => {
  const r = isisScore({ ageUnder20: true, competitive: true, hillSachs: true, glenoidLoss: true });
  assert.equal(r.total, 8);
  assert.equal(r.highRisk, true);
  assert.match(r.band, /ISIS 8 of 10/);
});
