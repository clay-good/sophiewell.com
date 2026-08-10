// spec-v680: Kobayashi score for IVIG resistance in Kawasaki disease.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { kobayashiKawasaki } from '../../lib/kobayashi-kawasaki-v680.js';

// Lowest-risk baseline: nothing meets a criterion -> 0 points.
const LOW = { sodium: '140', illnessDay: '6', ast: '30', neutrophil: '60', crp: '2', ageMonths: '36', platelets: '400' };

test('no criteria met -> 0, low risk', () => {
  const r = kobayashiKawasaki(LOW);
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('each criterion contributes its weight', () => {
  assert.equal(kobayashiKawasaki({ ...LOW, sodium: '133' }).score, 2);
  assert.equal(kobayashiKawasaki({ ...LOW, illnessDay: '4' }).score, 2);
  assert.equal(kobayashiKawasaki({ ...LOW, ast: '100' }).score, 2);
  assert.equal(kobayashiKawasaki({ ...LOW, neutrophil: '80' }).score, 2);
  assert.equal(kobayashiKawasaki({ ...LOW, crp: '10' }).score, 1);
  assert.equal(kobayashiKawasaki({ ...LOW, ageMonths: '12' }).score, 1);
  assert.equal(kobayashiKawasaki({ ...LOW, platelets: '300' }).score, 1);
});

test('thresholds are exact (just-below values do not score)', () => {
  assert.equal(kobayashiKawasaki({ ...LOW, sodium: '134' }).score, 0); // > 133
  assert.equal(kobayashiKawasaki({ ...LOW, illnessDay: '5' }).score, 0); // > 4
  assert.equal(kobayashiKawasaki({ ...LOW, ast: '99' }).score, 0); // < 100
  assert.equal(kobayashiKawasaki({ ...LOW, neutrophil: '79' }).score, 0); // < 80
  assert.equal(kobayashiKawasaki({ ...LOW, crp: '9.9' }).score, 0); // < 10
  assert.equal(kobayashiKawasaki({ ...LOW, ageMonths: '13' }).score, 0); // > 12
  assert.equal(kobayashiKawasaki({ ...LOW, platelets: '301' }).score, 0); // > 300
});

test('high-risk cutoff is >= 4', () => {
  // sodium(2) + CRP(1) + age(1) = 4 -> high
  const four = kobayashiKawasaki({ ...LOW, sodium: '130', crp: '12', ageMonths: '6' });
  assert.equal(four.score, 4);
  assert.equal(four.tier, 'high');
  assert.equal(four.abnormal, true);
  // sodium(2) + CRP(1) = 3 -> low
  const three = kobayashiKawasaki({ ...LOW, sodium: '130', crp: '12' });
  assert.equal(three.score, 3);
  assert.equal(three.abnormal, false);
});

test('META example: Na 131, day 4, AST 150, neut 84, CRP 11, age 8mo, plt 350 -> 10', () => {
  const r = kobayashiKawasaki({ sodium: '131', illnessDay: '4', ast: '150', neutrophil: '84', crp: '11', ageMonths: '8', platelets: '350' });
  // 2 + 2 + 2 + 2 + 1 + 1 + 0 = 10
  assert.equal(r.score, 10);
  assert.equal(r.tier, 'high');
  assert.match(r.band, /Kobayashi 10 of 11/);
});

test('all seven criteria met -> 11 (max)', () => {
  const r = kobayashiKawasaki({ sodium: '128', illnessDay: '3', ast: '200', neutrophil: '90', crp: '15', ageMonths: '5', platelets: '200' });
  assert.equal(r.score, 11);
});

test('inputs are validated', () => {
  assert.equal(kobayashiKawasaki({}).valid, false);
  assert.equal(kobayashiKawasaki({}).code, 'MISSING_INPUT');
  assert.equal(kobayashiKawasaki({ ...LOW, platelets: '' }).field, 'platelets');
  assert.equal(kobayashiKawasaki({ ...LOW, neutrophil: '120' }).field, 'neutrophil');
});
