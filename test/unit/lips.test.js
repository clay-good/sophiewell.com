import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lips } from '../../lib/scoring-v4.js';

test('lips none -> 0', () => {
  const r = lips({});
  assert.equal(r.score, 0);
  assert.equal(r.highRisk, false);
});

test('lips cut point is above 4: exactly 4 is not high risk (Gajic 2011 Table 4)', () => {
  const r = lips({ sepsis: true, pneumonia: true, tachypneaRrGt30: true });
  // 1 + 1.5 + 1.5 = 4.0
  assert.equal(r.score, 4);
  assert.equal(r.highRisk, false);
  assert.equal(lips({ shock: true, sepsis: true, pneumonia: true }).highRisk, true); // 4.5
});

test('lips diabetes subtracts 1 only if sepsis', () => {
  const alone = lips({ pneumonia: true, diabetes: true });
  assert.equal(alone.score, 1.5);
  assert.equal(alone.counted.diabetes, false);
  assert.match(alone.band, /only if sepsis/);
  // The paper's example 3: sepsis + shock + diabetes = 1 + 2 - 1 = 2.
  assert.equal(lips({ sepsis: true, shock: true, diabetes: true }).score, 2);
});

test('lips surgery is scored by type, plus 1.5 if emergency', () => {
  assert.equal(lips({ orthoSpineSurgery: true }).score, 1);
  assert.equal(lips({ acuteAbdomenSurgery: true }).score, 2);
  assert.equal(lips({ cardiacSurgery: true }).score, 2.5);
  assert.equal(lips({ aorticVascularSurgery: true }).score, 3.5);
  assert.equal(lips({ aorticVascularSurgery: true, emergencySurgery: true }).score, 5);
  // Emergency alone is not a listed surgery: nothing to add it to.
  const e = lips({ emergencySurgery: true });
  assert.equal(e.score, 0);
  assert.equal(e.counted.emergencySurgery, false);
});

test('lips trauma is scored by type and adds up (the paper\'s examples)', () => {
  // Example 2: TBI + lung contusion + shock + FiO2 > 0.35 = 2 + 1.5 + 2 + 2 = 7.5.
  assert.equal(lips({ traumaticBrainInjury: true, lungContusion: true, shock: true, fio2Gt035or4L: true }).score, 7.5);
  // Example 1: sepsis + shock + pneumonia + alcohol + FiO2 = 7.5.
  assert.equal(lips({ sepsis: true, shock: true, pneumonia: true, alcoholAbuse: true, fio2Gt035or4L: true }).score, 7.5);
  assert.equal(lips({ multipleFractures: true, smokeInhalation: true, nearDrowning: true }).score, 5.5);
});
