// spec-v138 2.2: fullPIERS (von Dadelszen 2011). logit = 2.68 - 0.0541*GA + 1.23*chest
// - 0.0271*creat + 0.207*plt + 4e-5*plt^2 + 0.0101*AST - 3.05e-6*AST^2 + 2.5e-4*creat*plt
// - 6.99e-5*plt*AST - 2.56e-3*plt*SpO2. SpO2 only via the platelet interaction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fullPiers } from '../../lib/ob-v138.js';

test('worked example -> 17.6% intermediate', () => {
  const r = fullPiers({ ga: 32, chestPainDyspnea: 'yes', spo2: 96, platelets: 120, creatinine: 90, ast: 60 });
  assert.equal(r.valid, true);
  assert.equal(r.probability, 17.6);
  assert.equal(r.abnormal, false);
});

test('high-risk profile crosses the >= 30% rule-in flag', () => {
  const r = fullPiers({ ga: 28, chestPainDyspnea: 'yes', spo2: 90, platelets: 40, creatinine: 200, ast: 300 });
  assert.equal(r.valid, true);
  assert.ok(r.probability >= 30);
  assert.equal(r.abnormal, true);
});

test('probability is bounded 0-100 even for extreme inputs', () => {
  const r = fullPiers({ ga: 40, chestPainDyspnea: 'no', spo2: 100, platelets: 1, creatinine: 1, ast: 1 });
  assert.ok(r.probability >= 0 && r.probability <= 100);
});

test('missing predictor -> valid:false', () => {
  assert.equal(fullPiers({ ga: 32, spo2: 96, platelets: 120, creatinine: 90 }).valid, false);
  assert.equal(fullPiers(7).valid, false);
});
