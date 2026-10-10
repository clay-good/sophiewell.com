// spec-v58 §2.7: PELOD-2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pelod2 } from '../../lib/scoring-v6.js';

const base = { ageMonths: 24, gcs: 12, lactate: 6, map: 50, creatinine: 60, pao2fio2: 300, paco2: 40, invasiveVent: true, wbc: 5, platelets: 100 };
test('example: score 9, 24-59 mo band', () => {
  const r = pelod2(base);
  assert.equal(r.score, 9);
  assert.match(r.activeBand, /24-59 mo/);
});
test('healthy inputs -> 0', () => {
  const r = pelod2({ ageMonths: 60, gcs: 15, lactate: 1, map: 90, creatinine: 20, pao2fio2: 400, paco2: 40, invasiveVent: false, wbc: 10, platelets: 300 });
  assert.equal(r.score, 0);
});
test('age band changes the MAP cutoff', () => {
  const neo = pelod2({ ...base, ageMonths: 0, map: 40 });
  assert.match(neo.activeBand, /<1 mo/);
});
test('out-of-range GCS throws', () => {
  assert.throws(() => pelod2({ ...base, gcs: 2 }));
});

test('pupils add to the GCS points: GCS 3 with fixed pupils is 9, GCS 8 is 6', () => {
  const neuro = (gcs) => pelod2({ ...base, gcs, pupilsFixed: true }).parts.find((p) => p[0].startsWith('Neurologic'))[1];
  assert.equal(neuro(3), 9);
  assert.equal(neuro(8), 6);
  assert.equal(neuro(15), 5);
});
test('WBC of exactly 2 scores 2 (0 points only above 2)', () => {
  const wbc = (v) => pelod2({ ...base, wbc: v }).parts.find((p) => p[0] === 'Hematologic (WBC)')[1];
  assert.equal(wbc(2), 2);
  assert.equal(wbc(2.1), 0);
});
