// spec-v61 §3.10: burn-resuscitation hourly urine-output target.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { burnUopTarget } from '../../lib/clinical-v7.js';

test('example: 70 kg adult -> 0.5 mL/kg/hr = 35 mL/hr', () => {
  const r = burnUopTarget({ weightKg: 70, pediatric: false, electrical: false });
  assert.equal(r.rateLow, 0.5);
  assert.equal(r.targetLowMlHr, 35);
});
test('pediatric -> 1 mL/kg/hr', () => {
  assert.equal(burnUopTarget({ weightKg: 20, pediatric: true, electrical: false }).rateLow, 1.0);
});
test('electrical injury -> 1-1.5 mL/kg/hr (higher target)', () => {
  const r = burnUopTarget({ weightKg: 70, pediatric: false, electrical: true });
  assert.equal(r.rateLow, 1.0);
  assert.equal(r.rateHigh, 1.5);
});
test('impossible (negative weight) throws RangeError', () => {
  assert.throws(() => burnUopTarget({ weightKg: -1, pediatric: false, electrical: false }), RangeError);
});
