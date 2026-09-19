// spec-v103 2.2: SCORE2-OP (ESC 2021, age >= 70).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score2Op } from '../../lib/cvrisk-v103.js';

test('missing inputs -> invalid', () => {
  assert.equal(score2Op({ age: 75, region: 'high' }).valid, false);
});

test('unrecognized region -> surfaced fallback', () => {
  const r = score2Op({ age: 75, male: false, sbp: 150, totalChol: 5.5, hdl: 1.4, region: 'xx' });
  assert.equal(r.valid, false);
});

test('age >= 70 worked risk (75yo woman, high region, SBP 150, TC 5.5, HDL 1.4) -> 21.6%', () => {
  const r = score2Op({ age: 75, male: false, smoker: false, diabetes: false, sbp: 150, totalChol: 5.5, hdl: 1.4, region: 'high' });
  assert.equal(r.risk, 21.6);
  assert.equal(r.category, 'very-high'); // age >= 70: high >= 15
});

test('region calibration changes the risk (low < high)', () => {
  const lo = score2Op({ age: 75, male: true, sbp: 150, totalChol: 5.5, hdl: 1.4, region: 'low' }).risk;
  const hi = score2Op({ age: 75, male: true, sbp: 150, totalChol: 5.5, hdl: 1.4, region: 'high' }).risk;
  assert.ok(hi > lo);
});

test('diabetes raises the estimate', () => {
  const noDm = score2Op({ age: 75, male: true, sbp: 150, totalChol: 5.5, hdl: 1.4, diabetes: false, region: 'moderate' }).risk;
  const dm = score2Op({ age: 75, male: true, sbp: 150, totalChol: 5.5, hdl: 1.4, diabetes: true, region: 'moderate' }).risk;
  assert.ok(dm > noDm);
});

test('extreme fuzzed inputs clamp to [0,100]', () => {
  // spec-v1224/v1406: see score2.test.js -- SBP and age at the top of their envelopes, the rest fuzzed.
  const r = score2Op({ age: 130, male: true, smoker: true, sbp: 300, totalChol: 1e9, hdl: 0, region: 'very-high' });
  assert.ok(r.risk >= 0 && r.risk <= 100 && Number.isFinite(r.risk));
});

// spec-v1409: SCORE2-OP is "intended for use in people aged over 70" (Eur Heart J 2021;42:2455-2467;
// the 2021 ESC prevention guideline repeats it). Below that it used to clamp the age to 70 and answer.
test('an age under the 70 the model is intended for is refused, not clamped', () => {
  const r = score2Op({ age: 65, male: true, smoker: false, sbp: 150, totalChol: 6, hdl: 1.4, diabetes: false, region: 'low' });
  assert.equal(r.valid, false);
  assert.match(r.band, /fitted on ages 70 and over/);
  assert.equal(score2Op({ age: 70, male: true, smoker: false, sbp: 150, totalChol: 6, hdl: 1.4, diabetes: false, region: 'low' }).valid, true);
});
