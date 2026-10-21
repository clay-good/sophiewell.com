// spec-v58 §2.11: APACHE II.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apache2 } from '../../lib/scoring-v6.js';

const base = { temp: 39, map: 60, hr: 120, rr: 30, oxy: 65, ph: 7.3, na: 150, k: 5.6, creatinine: 2, hct: 48, wbc: 18, gcs: 13, age: 60 };
// spec-v1647: 20-24 is about 40% in the Knaus table; five merged bands said ~25%.
test('example: total 23 reads the 20-24 row, about 40%', () => {
  const r = apache2(base);
  assert.equal(r.total, 23);
  assert.equal(r.band, '20-24: about 40% approximate hospital mortality.');
});
test('every band edge prints the row the tile\'s own table gives', async () => {
  const { META } = await import('../../lib/meta.js');
  const rows = META.apache2.interpretation.bands;
  // age points move the total in steps without touching physiology: 0, 2, 3, 5, 6.
  for (const [age, chronic, op] of [[30, false, false], [45, false, false], [55, false, false], [65, false, false], [75, false, false], [75, true, true]]) {
    const r = apache2({ ...base, age, chronicHealth: chronic, nonoperativeOrEmergency: op });
    const row = rows.find((b) => {
      if (b.range.startsWith('>=')) return r.total >= Number(b.range.slice(2));
      const [lo, hi] = b.range.split('-').map(Number);
      return r.total >= lo && r.total <= hi;
    });
    const pct = /(\d+)%/.exec(row.text)[1];
    assert.match(r.band, new RegExp(`about ${pct}% `), `total ${r.total}`);
  }
});
test('normal physiology, young, no chronic -> 0', () => {
  const r = apache2({ temp: 37, map: 90, hr: 80, rr: 16, oxy: 90, ph: 7.4, na: 140, k: 4, creatinine: 1, hct: 40, wbc: 8, gcs: 15, age: 30 });
  assert.equal(r.total, 0);
});
test('GCS contributes 15 - GCS; age and chronic points add', () => {
  const r = apache2({ ...base, gcs: 10, age: 80, chronicHealth: true, nonoperativeOrEmergency: true });
  assert.equal(r.parts.find((p) => p[0].startsWith('Glasgow'))[1], 5);
  assert.equal(r.agePts, 6);
  assert.equal(r.chronicPts, 5);
});
test('out-of-range pH throws', () => {
  assert.throws(() => apache2({ ...base, ph: 5 }));
});
