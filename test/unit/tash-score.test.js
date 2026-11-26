// spec-v108 2.3: TASH (Yucel 2006). Logistic P of mass transfusion.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tashScore } from '../../lib/trauma-v108.js';

// spec-v1007: this test used to assert the defect -- an empty form answering
// "~0.7% probability of mass transfusion". The four unentered measurements carry
// 18 of the 31 points, so a partial TASH cannot rule a massive transfusion out.
test('no inputs -> no probability, and the refusal names what is missing', () => {
  const r = tashScore({});
  assert.equal(r.total, null);
  assert.equal(r.pct, null);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /hemoglobin, base excess, systolic BP, heart rate/);
  assert.match(r.band, /can only add points/);
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
  // The other three measurements are entered at non-scoring values so the score
  // is complete and the hemoglobin band is what is under test (spec-v1007).
  const rest = { baseExcess: 0, sbp: 130, hr: 80 };
  assert.equal(tashScore({ hb: 6, ...rest }).total, 8);
  assert.equal(tashScore({ hb: 12, ...rest }).total, 0);
});

test('all variables clamp to the published 0-31 maximum', () => {
  const r = tashScore({ hb: 5, baseExcess: -20, sbp: 80, hr: 140, fast: true, pelvis: true, femur: true, male: true });
  assert.equal(r.total, 31); // 8+4+4+2+3+6+3+1
});

test('overflow-safe: extreme inputs do not leak non-finite', () => {
  // spec-v1741: hemoglobin now has an envelope (2 to 25 g/dL), so the probe sits at
  // its floor; a hemoglobin of 1e9 is refused.
  // spec-v1742: so does heart rate (10 to 300 bpm); the probe sits at its ceiling.
  // spec-v1747: base excess has an envelope (-60 to 70 mmol/L); the probe sits at its floor.
  // spec-v1800: and so does the systolic pressure (20 to 500 mmHg); the probe sits at its floor too.
  const r = tashScore({ hb: 2, baseExcess: -60, sbp: 20, hr: 300 });
  assert.equal(tashScore({ hb: 2, baseExcess: -1e9, sbp: 20, hr: 300 }).valid, false);
  assert.equal(tashScore({ hb: 2, baseExcess: -60, sbp: -1e9, hr: 300 }).valid, false);
  assert.ok(Number.isFinite(r.pct));
  assert.ok(Number.isFinite(r.total));
  assert.equal(tashScore({ hb: 1e9, baseExcess: -1e9, sbp: -1e9, hr: 1e9 }).valid, false);
});

test('spec-v1741: a hemoglobin past the envelope is refused, a high real one and the example answer', () => {
  const base = { baseExcess: -7, sbp: 95, hr: 130, fast: 1 };
  const tenX = tashScore({ ...base, hb: 250 });
  assert.equal(tenX.valid, false);
  assert.equal(tenX.total, null);
  assert.match(tenX.band, /plausible range for hemoglobin/);
  assert.equal(tashScore({ ...base, hb: 22 }).total, 12);
  assert.equal(tashScore({ ...base, hb: 9.5 }).band, 'TASH score 16: ~47.5% probability of mass transfusion.');
});
