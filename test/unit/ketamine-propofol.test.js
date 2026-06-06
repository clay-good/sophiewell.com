// spec-v56 §2.10: procedural sedation weight-based dosing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ketaminePropofol } from '../../lib/medication-v5.js';

test('ketamine 1 mg/kg, 70 kg -> 70 mg, 1.4 mL at 50 mg/mL, redose 35 mg', () => {
  const r = ketaminePropofol({ agent: 'ketamine', weightKg: 70, mgkg: 1 });
  assert.equal(r.doseMg, 70);
  assert.equal(r.volMl, 1.4);
  assert.equal(r.redoseMg, 35);
});

test('propofol 1 mg/kg, 70 kg -> 70 mg, 7 mL at 10 mg/mL', () => {
  const r = ketaminePropofol({ agent: 'propofol', weightKg: 70, mgkg: 1 });
  assert.equal(r.doseMg, 70);
  assert.equal(r.volMl, 7);
});

test('ketofol uses 5 mg/mL each', () => {
  const r = ketaminePropofol({ agent: 'ketofol', weightKg: 50, mgkg: 0.5 });
  assert.equal(r.doseMg, 25);
  assert.equal(r.volMl, 5);
});

test('rejects unknown agent and out-of-range mg/kg', () => {
  assert.throws(() => ketaminePropofol({ agent: 'etomidate', weightKg: 70, mgkg: 1 }), /agent must be/);
  assert.throws(() => ketaminePropofol({ agent: 'ketamine', weightKg: 70, mgkg: 0 }), /mgkg/);
});
