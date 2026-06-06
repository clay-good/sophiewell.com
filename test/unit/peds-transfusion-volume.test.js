// spec-v61 §3.8: pediatric/neonatal PRBC transfusion volume.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsTransfusionVolume } from '../../lib/clinical-v7.js';

test('example: 3 kg, +2 g/dL, Hct 60% -> 30 mL (10 mL/kg)', () => {
  const r = pedsTransfusionVolume({ weightKg: 3, hbRise: 2, productHctPct: 60 });
  assert.equal(r.volumeMl, 30);
  assert.equal(r.mlPerKg, 10);
});
test('zero weight -> null fallback', () => {
  assert.equal(pedsTransfusionVolume({ weightKg: 0, hbRise: 2, productHctPct: 60 }), null);
});
test('impossible product Hct (0%) throws RangeError', () => {
  assert.throws(() => pedsTransfusionVolume({ weightKg: 3, hbRise: 2, productHctPct: 0 }), RangeError);
});
