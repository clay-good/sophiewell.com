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
  const r = score2Op({ age: 1e9, male: true, smoker: true, sbp: 1e9, totalChol: 1e9, hdl: 0, region: 'very-high' });
  assert.ok(r.risk >= 0 && r.risk <= 100 && Number.isFinite(r.risk));
});
