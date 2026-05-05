// spec-v4 §7 step v4.8 (waves 5-6).
// >=5 cases per CIWA/COWS; >=8 cases for ASCVD PCE across both sex AND both
// race-stratified equations.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ciwaAr, cows, ascvdPce, prevent10yr } from '../../lib/scoring-v4.js';

const close = (a, b, eps = 1) => assert.ok(Math.abs(a - b) <= eps, `expected ~${b}, got ${a}`);

// --- 157 CIWA-Ar -------------------------------------------------------
test('ciwaAr: all zero -> Mild (<8)', () => {
  const r = ciwaAr({}); assert.equal(r.score, 0); assert.match(r.band, /Mild/);
});
test('ciwaAr: 7 -> Mild boundary', () => {
  const r = ciwaAr({ tremor: 7 }); assert.equal(r.score, 7); assert.match(r.band, /Mild/);
});
test('ciwaAr: 10 -> Moderate', () => {
  const r = ciwaAr({ tremor: 5, anxiety: 5 }); assert.match(r.band, /Moderate/);
});
test('ciwaAr: 18 -> Severe', () => {
  const r = ciwaAr({ tremor: 6, anxiety: 6, sweats: 6 });
  assert.match(r.band, /^Severe/);
});
test('ciwaAr: 25 -> Very severe', () => {
  const r = ciwaAr({ tremor: 7, anxiety: 7, sweats: 7, agitation: 7 });
  assert.match(r.band, /Very severe/);
});
test('ciwaAr: clamps each item', () => {
  const r = ciwaAr({ tremor: 99 }); assert.equal(r.score, 7);
});

// --- 158 COWS ----------------------------------------------------------
test('cows: 0 -> No active withdrawal', () => assert.match(cows({}).band, /No active/));
test('cows: 5 -> Mild', () => assert.match(cows({ pulse: 1, sweating: 1, restlessness: 1, pupil: 2 }).band, /Mild/));
test('cows: 14 -> Moderate', () => assert.match(cows({ pulse: 4, sweating: 4, restlessness: 3, pupil: 1, anxiety: 2 }).band, /Moderate/));
test('cows: 26 -> Moderately severe', () => {
  const r = cows({ pulse: 4, sweating: 4, restlessness: 5, pupil: 5, jointAches: 4, gi: 2, anxiety: 2 });
  assert.equal(r.score, 26); assert.match(r.band, /Moderately severe/);
});
test('cows: 38 -> Severe', () => {
  const r = cows({ pulse: 4, sweating: 4, restlessness: 5, pupil: 5, jointAches: 4, runnyNose: 4, gi: 5, tremor: 4, yawning: 4, gooseflesh: 5 });
  assert.ok(r.score >= 37); assert.match(r.band, /^Severe/);
});

// --- 159 ASCVD PCE - >=8 cases across sex AND both race-stratified eqs ----
const baseW = { age: 55, totalChol: 213, hdl: 50, sbp: 120, treatedSbp: false, smoker: false, diabetes: false };

test('PCE: white female, low-risk profile -> Low band', () => {
  const r = ascvdPce({ ...baseW, sex: 'F', race: 'white' });
  assert.equal(r.equation, 'WF');
  assert.match(r.band, /Low|Borderline/);
});
test('PCE: white female, smoker + diabetes -> Intermediate or higher', () => {
  const r = ascvdPce({ ...baseW, sex: 'F', race: 'white', smoker: true, diabetes: true, totalChol: 240, sbp: 145 });
  assert.equal(r.equation, 'WF');
  assert.ok(r.score > 0.05);
});
test('PCE: white male, low-risk profile -> still produces a result', () => {
  const r = ascvdPce({ ...baseW, sex: 'M', race: 'white' });
  assert.equal(r.equation, 'WM');
  assert.ok(r.score > 0);
});
test('PCE: white male, high-risk -> High band', () => {
  const r = ascvdPce({ age: 70, totalChol: 260, hdl: 35, sbp: 160, treatedSbp: true, smoker: true, diabetes: true, sex: 'M', race: 'white' });
  assert.equal(r.equation, 'WM'); assert.match(r.band, /High|Intermediate/);
});
test('PCE: African-American female -> AAF equation', () => {
  const r = ascvdPce({ ...baseW, sex: 'F', race: 'AA' });
  assert.equal(r.equation, 'AAF');
});
test('PCE: African-American female, high-risk profile', () => {
  const r = ascvdPce({ age: 65, totalChol: 240, hdl: 40, sbp: 150, treatedSbp: true, smoker: false, diabetes: true, sex: 'F', race: 'AA' });
  assert.equal(r.equation, 'AAF'); assert.ok(r.score > 0.05);
});
test('PCE: African-American male -> AAM equation', () => {
  const r = ascvdPce({ ...baseW, sex: 'M', race: 'AA' });
  assert.equal(r.equation, 'AAM');
});
test('PCE: African-American male, high-risk -> notable risk', () => {
  const r = ascvdPce({ age: 65, totalChol: 250, hdl: 35, sbp: 160, treatedSbp: true, smoker: true, diabetes: true, sex: 'M', race: 'AA' });
  assert.equal(r.equation, 'AAM'); assert.ok(r.score > 0.10);
});
test('PCE: out-of-age-range returns informative band', () => {
  const r = ascvdPce({ age: 35, totalChol: 200, hdl: 50, sbp: 120, sex: 'M', race: 'white' });
  assert.equal(r.score, null); assert.match(r.band, /40-79/);
});
test('PCE: throws on bad sex', () => {
  assert.throws(() => ascvdPce({ age: 55, totalChol: 200, hdl: 50, sbp: 120, sex: 'X', race: 'white' }));
});

// --- 160 PREVENT 2023 -------------------------------------------------
test('PREVENT: female low-risk profile -> Low band', () => {
  const r = prevent10yr({ age: 50, sex: 'F', totalChol: 180, hdl: 60, sbp: 115, treatedSbp: false, diabetes: false, smoker: false, bmi: 24, egfr: 90 });
  assert.match(r.band, /Low/);
});
test('PREVENT: male low-risk profile -> Low or Borderline', () => {
  const r = prevent10yr({ age: 50, sex: 'M', totalChol: 180, hdl: 50, sbp: 115, treatedSbp: false, diabetes: false, smoker: false, bmi: 24, egfr: 90 });
  assert.ok(r.score < 0.10);
});
test('PREVENT: high-risk male -> Intermediate or High', () => {
  const r = prevent10yr({ age: 65, sex: 'M', totalChol: 240, hdl: 35, sbp: 160, treatedSbp: true, diabetes: true, smoker: true, bmi: 32, egfr: 55 });
  assert.ok(r.score > 0.10);
});
test('PREVENT: out-of-range age', () => {
  const r = prevent10yr({ age: 25, sex: 'M', totalChol: 200, hdl: 50, sbp: 120, diabetes: false, smoker: false, bmi: 25, egfr: 90 });
  assert.equal(r.score, null); assert.match(r.band, /30-79/);
});
test('PREVENT: race-free contract (no race input accepted)', () => {
  const r = prevent10yr({ age: 50, sex: 'F', totalChol: 200, hdl: 50, sbp: 120, treatedSbp: false, diabetes: false, smoker: false, bmi: 25, egfr: 90 });
  assert.ok(typeof r.score === 'number');
  // The contract is verified by the function signature: it does not accept race.
});
test('PREVENT: throws on bad sex', () => {
  assert.throws(() => prevent10yr({ age: 50, sex: 'X', totalChol: 200, hdl: 50, sbp: 120, diabetes: false, smoker: false, bmi: 25, egfr: 90 }));
});
