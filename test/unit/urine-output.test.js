// spec-v61 §3.1: KDIGO urine-output rate + oliguria flag.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urineOutput } from '../../lib/clinical-v7.js';

test('example: 120 mL / 4 h / 60 kg = 0.5 mL/kg/hr', () => {
  const r = urineOutput({ volumeMl: 120, intervalHr: 4, weightKg: 60 });
  assert.equal(r.rate, 0.5);
  assert.equal(r.oliguria, false);
});
test('oliguria: 30 mL / 4 h / 60 kg < 0.3 -> Stage 3 band', () => {
  const r = urineOutput({ volumeMl: 30, intervalHr: 4, weightKg: 60 });
  assert.equal(r.oliguria, true);
  assert.match(r.band, /Stage 3/);
});
test('zero-denominator interval/weight -> null fallback', () => {
  assert.equal(urineOutput({ volumeMl: 100, intervalHr: 0, weightKg: 60 }), null);
  assert.equal(urineOutput({ volumeMl: 100, intervalHr: 4, weightKg: 0 }), null);
});
test('impossible (negative volume) throws RangeError', () => {
  assert.throws(() => urineOutput({ volumeMl: -5, intervalHr: 4, weightKg: 60 }), RangeError);
});
