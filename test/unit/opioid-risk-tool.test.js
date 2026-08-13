// spec-v709: Opioid Risk Tool (ORT).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { opioidRiskTool } from '../../lib/opioid-risk-tool-v709.js';

test('no factors -> 0, low risk', () => {
  const r = opioidRiskTool({ sex: 'female' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('sex-specific weights: family alcohol 1 (F) / 3 (M)', () => {
  assert.equal(opioidRiskTool({ sex: 'female', famAlcohol: true }).score, 1);
  assert.equal(opioidRiskTool({ sex: 'male', famAlcohol: true }).score, 3);
});

test('sex-specific weights: preadolescent sexual abuse 3 (F) / 0 (M)', () => {
  assert.equal(opioidRiskTool({ sex: 'female', sexualAbuse: true }).score, 3);
  assert.equal(opioidRiskTool({ sex: 'male', sexualAbuse: true }).score, 0);
});

test('worked example: female + personal rx (5) + family illegal (2) + age (1) -> 8 (high)', () => {
  const r = opioidRiskTool({ sex: 'female', personalRx: 'true', famIllegal: 'true', age16to45: 'true' });
  assert.equal(r.score, 8);
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /ORT 8/);
});

test('bands: 0-3 low, 4-7 moderate, >=8 high', () => {
  assert.equal(opioidRiskTool({ sex: 'female', personalAlcohol: true }).tier, 'low');        // 3
  assert.equal(opioidRiskTool({ sex: 'female', personalIllegal: true }).tier, 'moderate');   // 4
  assert.equal(opioidRiskTool({ sex: 'female', personalRx: true, personalIllegal: true }).tier, 'high'); // 9
});

test('sex is required', () => {
  assert.equal(opioidRiskTool({}).valid, false);
  assert.equal(opioidRiskTool({}).field, 'sex');
});
