import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lips } from '../../lib/scoring-v4.js';

test('lips none -> 0', () => {
  const r = lips({});
  assert.equal(r.score, 0);
  assert.equal(r.highRisk, false);
});

test('lips threshold 4: sepsis + pneumonia + tachypnea -> 4.0 (high)', () => {
  const r = lips({ sepsis: true, pneumonia: true, tachypneaRrGt30: true });
  // 1 + 1.5 + 1.5 = 4.0
  assert.equal(r.score, 4);
  assert.equal(r.highRisk, true);
});

test('lips diabetes -1 modifier reduces score', () => {
  const r = lips({ pneumonia: true, diabetes: true });
  // 1.5 + (-1) = 0.5
  assert.equal(r.score, 0.5);
  assert.equal(r.highRisk, false);
});

test('lips high: many predictors -> >=4', () => {
  const r = lips({ shock: true, sepsis: true, pneumonia: true,
    highRiskSurgery: true, obesityBmiGt30: true });
  // 2 + 1 + 1.5 + 1.5 + 1 = 7.0
  assert.equal(r.score, 7);
  assert.equal(r.highRisk, true);
});
