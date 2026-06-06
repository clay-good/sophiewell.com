// spec-v55 §2.12: bicarbonate deficit + sodium deficit (deficit estimates).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acidBaseDeficit } from '../../lib/clinical-v6.js';

test('male: wt 70, HCO3 14->24, Na 120->135 -> HCO3 deficit 350, Na deficit 630, warn', () => {
  const r = acidBaseDeficit({ weightKg: 70, sex: 'M', measuredHco3: 14, targetHco3: 24, measuredNa: 120, targetNa: 135 });
  assert.equal(r.tbwLiters, 42);
  assert.equal(r.hco3DeficitMeq, 350);
  assert.equal(r.naDeficitMeq, 630);
  assert.match(r.hyponatremiaWarn, /osmotic demyelination/);
});

test('female: wt 60, HCO3 18->24, Na 125->135 -> HCO3 deficit 180, Na deficit 300', () => {
  const r = acidBaseDeficit({ weightKg: 60, sex: 'F', measuredHco3: 18, targetHco3: 24, measuredNa: 125, targetNa: 135 });
  assert.equal(r.tbwLiters, 30);
  assert.equal(r.hco3DeficitMeq, 180);
  assert.equal(r.naDeficitMeq, 300);
});

test('no over-rapid warning when Na change <= 8 and not hyponatremic', () => {
  const r = acidBaseDeficit({ weightKg: 80, sex: 'M', measuredHco3: 20, targetHco3: 24, measuredNa: 138, targetNa: 140 });
  assert.equal(r.hco3DeficitMeq, 160);
  assert.equal(r.naDeficitMeq, 96);
  assert.equal(r.hyponatremiaWarn, null);
});

test('acid-base-deficit rejects impossible input', () => {
  assert.throws(() => acidBaseDeficit({ weightKg: 0, sex: 'M', measuredHco3: 14, targetHco3: 24, measuredNa: 120, targetNa: 135 }), /weightKg/);
});
