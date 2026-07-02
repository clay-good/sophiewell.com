// spec-v204 2.2: urinary-calcium assessment worked examples. Spot Ca/Cr (adult
// > 0.20 mg/mg; Sargent pediatric bands) and 24-hour excretion (> 250 women /
// > 300 men mg/day, or > 4 mg/kg/day). Thresholds spec-v97 cross-verified
// (StatPearls, Sargent 1993, Medscape).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urineCalcium as uca } from '../../lib/nephro-fluids-v204.js';

test('adult spot ratio above 0.20 -> hypercalciuria (worked example)', () => {
  const r = uca({ mode: 'spot', urineCa: 30, urineCr: 100, ageBand: 'adult' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0.3);
  assert.equal(r.molar, 0.85); // 0.3 * 2.82
  assert.equal(r.abnormal, true);
  assert.match(r.band, /hypercalciuria/);
});

test('adult spot ratio below 0.20 -> within limits', () => {
  const r = uca({ mode: 'spot', urineCa: 15, urineCr: 100, ageBand: 'adult' });
  assert.equal(r.score, 0.15);
  assert.equal(r.abnormal, false);
});

test('pediatric age band uses the Sargent threshold (< 7 mo 0.86)', () => {
  const r = uca({ mode: 'spot', urineCa: 50, urineCr: 100, ageBand: 'infant-lt7mo' });
  assert.equal(r.score, 0.5); // 0.5 < 0.86 -> normal for an infant
  assert.equal(r.abnormal, false);
});

test('24-hour excretion above the sex threshold and per-kg -> hypercalciuria', () => {
  const r = uca({ mode: 'day', calcium24h: 320, weight: 70, sex: 'male' });
  assert.equal(r.score, 320);
  assert.equal(r.perKg, 4.57);
  assert.equal(r.abnormal, true);
});

test('24-hour normal case', () => {
  const r = uca({ mode: 'day', calcium24h: 200, weight: 70, sex: 'female' });
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within normal limits/);
});

test('no mode -> complete-the-fields', () => {
  const r = uca({});
  assert.equal(r.valid, false);
  assert.match(r.message, /mode/);
});
