// spec-v55 §2.8: Oxygenation Index (OI) + Oxygen Saturation Index (OSI).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oxygenationIndex } from '../../lib/clinical-v6.js';

test('oi+osi moderate: FiO2 0.6, MAP 15, PaO2 80, SpO2 92 -> OI 11.3, OSI 9.8', () => {
  const r = oxygenationIndex({ fio2: 0.6, map: 15, pao2: 80, spo2: 92 });
  assert.equal(r.oi, 11.3);
  assert.match(r.oiBand, /moderate/);
  assert.equal(r.osi, 9.8);
  assert.match(r.osiBand, /moderate/);
});

test('oi mild: FiO2 0.5, MAP 12, PaO2 100 -> OI 6.0, no OSI', () => {
  const r = oxygenationIndex({ fio2: 0.5, map: 12, pao2: 100 });
  assert.equal(r.oi, 6);
  assert.match(r.oiBand, /mild/);
  assert.equal(r.osi, null);
});

test('oi severe: FiO2 1.0, MAP 20, PaO2 50 -> OI 40.0', () => {
  const r = oxygenationIndex({ fio2: 1.0, map: 20, pao2: 50 });
  assert.equal(r.oi, 40);
  assert.match(r.oiBand, /severe/);
});

test('osi only (no ABG): FiO2 0.5, MAP 12, SpO2 90 -> OSI 6.7 mild, OI null', () => {
  const r = oxygenationIndex({ fio2: 0.5, map: 12, spo2: 90 });
  assert.equal(r.osi, 6.7);
  assert.match(r.osiBand, /mild/);
  assert.equal(r.oi, null);
});

test('oxygenation-index rejects impossible input', () => {
  assert.throws(() => oxygenationIndex({ fio2: 0, map: 15, pao2: 80 }), /fio2/);
});
