// spec-v56 §2.9: sugammadex reversal dose by depth of block.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sugammadex } from '../../lib/medication-v5.js';

test('T2 reappearance: 2 mg/kg, 70 kg -> 140 mg, 1.4 mL', () => {
  const r = sugammadex({ weightKg: 70, depth: 't2' });
  assert.equal(r.doseMg, 140);
  assert.equal(r.volMl, 1.4);
  assert.equal(r.mgkg, 2);
});

test('1-2 PTC: 4 mg/kg', () => {
  const r = sugammadex({ weightKg: 80, depth: 'ptc' });
  assert.equal(r.doseMg, 320);
  assert.equal(r.volMl, 3.2);
});

test('immediate reversal: 16 mg/kg', () => {
  const r = sugammadex({ weightKg: 70, depth: 'immediate' });
  assert.equal(r.doseMg, 1120);
  assert.equal(r.volMl, 11.2);
});

test('rejects unknown depth and impossible weight', () => {
  assert.throws(() => sugammadex({ weightKg: 70, depth: 'deep' }), /depth/);
  assert.throws(() => sugammadex({ weightKg: 0, depth: 't2' }), /weightKg/);
});
