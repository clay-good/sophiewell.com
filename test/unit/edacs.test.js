// spec-v57 §2.9: EDACS / EDACS-ADP.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { edacs } from '../../lib/scoring-v5.js';

test('age 50 male, CAD/risk, diaphoresis -> 17, not low risk', () => {
  const r = edacs({ age: 50, male: true, riskOrCad: true, diaphoresis: true });
  assert.equal(r.score, 17); assert.equal(r.lowRisk, false);
});
test('young low-symptom + negative gate -> low risk (<16)', () => {
  const r = edacs({ age: 30, male: false });
  assert.ok(r.score < 16); assert.equal(r.lowRisk, true);
});
test('low score but positive troponin -> NOT low risk', () => {
  const r = edacs({ age: 30, male: false, trop0Pos: true });
  assert.ok(r.score < 16); assert.equal(r.lowRisk, false);
});
test('palpation/inspiration subtract points', () => {
  const r = edacs({ age: 40, male: true, painInspiration: true, painPalpation: true });
  // age 40 ->2, male +6, -4, -6 = -2
  assert.equal(r.score, -2);
});
test('rejects bad age', () => {
  assert.throws(() => edacs({ age: 10, male: true }), /age/);
});
