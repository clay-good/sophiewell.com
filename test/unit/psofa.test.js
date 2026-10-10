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

test('1-11 months: creatinine 0.7 is 2 points, 0.8 is 3 (Matics 2017 Table 1)', () => {
  const renal = (c) => psofa({ ...base, ageMonths: 6, creatinine: c }).parts.find((p) => p[0] === 'Renal')[1];
  assert.equal(renal(0.7), 2);
  assert.equal(renal(0.8), 3);
});
test('over 216 months uses the adult row: MAP 70, creatinine 1.2 / 2.0 / 3.5 / 5.0', () => {
  const r = psofa({ ...base, ageMonths: 240, map: 68, creatinine: 1.1 });
  assert.match(r.activeBand, />216 mo/);
  assert.equal(r.parts.find((p) => p[0] === 'Cardiovascular')[1], 1);
  assert.equal(r.parts.find((p) => p[0] === 'Renal')[1], 0);
  assert.equal(psofa({ ...base, ageMonths: 216, map: 68 }).parts.find((p) => p[0] === 'Cardiovascular')[1], 0);
});
