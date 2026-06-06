// spec-v58 §2.8: pediatric SOFA.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { psofa } from '../../lib/scoring-v6.js';

const base = { ageMonths: 24, pao2fio2: 250, vent: true, platelets: 120, bilirubin: 1.5, map: 50, gcs: 13, creatinine: 0.7 };
test('example: pSOFA 7, 24-59 mo band', () => {
  const r = psofa(base);
  assert.equal(r.score, 7);
  assert.match(r.activeBand, /24-59 mo/);
});
test('healthy inputs -> 0', () => {
  assert.equal(psofa({ ageMonths: 60, pao2fio2: 450, vent: false, platelets: 200, bilirubin: 0.5, map: 90, gcs: 15, creatinine: 0.3 }).score, 0);
});
test('respiration: <100 PaO2/FiO2 without vent caps at 2', () => {
  const r = psofa({ ...base, pao2fio2: 80, vent: false });
  assert.equal(r.parts.find((p) => p[0] === 'Respiration')[1], 2);
});
test('out-of-range age throws', () => {
  assert.throws(() => psofa({ ...base, ageMonths: 400 }));
});
