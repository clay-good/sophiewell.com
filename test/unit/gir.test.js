// spec-v61 §3.2: glucose infusion rate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gir } from '../../lib/clinical-v7.js';

test('example: D10 at 15 mL/hr, 3 kg = 8.33 mg/kg/min', () => {
  assert.equal(gir({ dextrosePct: 10, rateMlHr: 15, weightKg: 3 }).gir, 8.33);
});
test('target band: D10 at 12 mL/hr, 3 kg = 6.67 within 4-8', () => {
  const r = gir({ dextrosePct: 10, rateMlHr: 12, weightKg: 3 });
  assert.equal(r.gir, 6.67);
  assert.match(r.band, /target range/);
});
test('zero-denominator weight -> null', () => {
  assert.equal(gir({ dextrosePct: 10, rateMlHr: 12, weightKg: 0 }), null);
});
test('impossible dextrose >100% throws RangeError', () => {
  assert.throws(() => gir({ dextrosePct: 150, rateMlHr: 12, weightKg: 3 }), RangeError);
});
