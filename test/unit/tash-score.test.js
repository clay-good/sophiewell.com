// spec-v108 2.3: TASH (Yucel 2006). Logistic P of mass transfusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tashScore } from '../../lib/trauma-v108.js';

test('no inputs -> score 0, low probability, valid', () => {
  const r = tashScore({});
  assert.equal(r.total, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.pct < 1); // ~0.7%
});

test('tile example: Hb 9.5 (4) + BE -7 (3) + SBP 95 (4) + HR 130 (2) + FAST (3) = 16, ~47.5%', () => {
  const r = tashScore({ hb: 9.5, baseExcess: -7, sbp: 95, hr: 130, fast: true });
  assert.equal(r.total, 16);
  assert.equal(r.pct, 47.5);
  assert.match(r.band, /TASH score 16: ~47\.5% probability/);
});

test('band flip: probability crossing 50% (>= 50%) high flag', () => {
  const below = tashScore({ hb: 9.5, baseExcess: -7, sbp: 95, hr: 130, fast: true }); // 16 -> 47.5%
  assert.equal(below.high, false);
  const above = tashScore({ hb: 9.5, baseExcess: -7, sbp: 95, hr: 130, fast: true, male: true, pelvis: true }); // +7 = 23
  assert.equal(above.total, 23);
  assert.equal(above.high, true);
  assert.equal(above.abnormal, true);
});

test('hemoglobin bands: < 7 = 8 points', () => {
  assert.equal(tashScore({ hb: 6 }).total, 8);
  assert.equal(tashScore({ hb: 12 }).total, 0);
});

test('all variables clamp to the published 0-31 maximum', () => {
  const r = tashScore({ hb: 5, baseExcess: -20, sbp: 80, hr: 140, fast: true, pelvis: true, femur: true, male: true });
  assert.equal(r.total, 31); // 8+4+4+2+3+6+3+1
});

test('overflow-safe: extreme inputs do not leak non-finite', () => {
  const r = tashScore({ hb: 1e9, baseExcess: -1e9, sbp: -1e9, hr: 1e9 });
  assert.ok(Number.isFinite(r.pct));
  assert.ok(Number.isFinite(r.total));
});
