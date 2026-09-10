// spec-v1224: seven 10-year cardiovascular-risk engines answered from a
// systolic blood pressure of 3000 mmHg.
//
// Each centers SBP with a clamp -- `clamp(s, 60, 250)` in SCORE2, `clamp(s, 60,
// 300)` in Framingham and Reynolds, `Math.max(sbp, 110)` in PREVENT, `ln(sbp)`
// in the Pooled Cohort Equations. A clamp is right for the MODEL: the published
// betas are fitted on a range, and centering an SBP of 260 at the edge of that
// range is honest. It is not a plausibility check, and it was standing in for
// one. Before this wave:
//
//   score2          SBP 3000 -> "10-year CVD risk 49.2% -- very-high category."
//   score2-op       SBP 3000 -> "10-year CVD risk 49.2% -- very-high category."
//   mesa-chd        SBP 3000 -> "MESA 10-year CHD risk: 21.5% with CAC 100"
//   framingham-cvd  SBP 3000 -> "risk 47% (vascular age 98.5)"
//   reynolds-risk   SBP 3000 -> "Reynolds 10-year cardiovascular risk 89.8%."
//   ascvd           SBP 3000 -> "High (>=20%)"
//   prevent         SBP 3000 -> "High (>=20%)"
//
// Every one is a number a reader acts on, computed from a pressure ten times the
// highest ever recorded. The envelope and the sentence are `BOUNDS.sbp` and
// `boundsAdvisory` in lib/bounds.js (20-300 mmHg); no clinical number is
// invented here.
//
// Each test also pins the other half: the tile still answers at its worked
// example, and at 300 mmHg -- the top of the envelope, which is a hypertensive
// emergency and not an error.
import test from 'node:test';
import assert from 'node:assert/strict';

import { score2, score2Op, mesaChd, framinghamCvd, reynoldsRisk } from '../../lib/cvrisk-v103.js';
import { ascvdPce, prevent10yr } from '../../lib/scoring-v4.js';
import { BOUNDS } from '../../lib/bounds.js';

const IMPOSSIBLE = 3000;
const REFUSAL = /plausible range for systolic blood pressure/i;

test('the envelope these guards read is the one lib/bounds.js publishes', () => {
  assert.equal(BOUNDS.sbp.min, 20);
  assert.equal(BOUNDS.sbp.max, 300);
});

test('score2 refuses an impossible systolic BP instead of banding it very-high', () => {
  const base = { age: 50, male: true, smoker: true, totalChol: 5.5, hdl: 1.3, region: 'very-high' };
  const bad = score2({ ...base, sbp: IMPOSSIBLE });
  assert.equal(bad.valid, false);
  assert.match(bad.band, REFUSAL);
  assert.equal(score2({ ...base, sbp: 140 }).valid, true);
  assert.equal(score2({ ...base, sbp: BOUNDS.sbp.max }).valid, true);
});

test('score2-op refuses an impossible systolic BP', () => {
  const base = { age: 75, male: true, smoker: true, totalChol: 6, hdl: 1.4, region: 'high' };
  const bad = score2Op({ ...base, sbp: IMPOSSIBLE });
  assert.equal(bad.valid, false);
  assert.match(bad.band, REFUSAL);
  assert.equal(score2Op({ ...base, sbp: 150 }).valid, true);
  assert.equal(score2Op({ ...base, sbp: BOUNDS.sbp.max }).valid, true);
});

test('mesa-chd refuses an impossible systolic BP', () => {
  const base = { age: 60, male: true, race: 'white', totalChol: 200, hdl: 45, cac: 100 };
  const bad = mesaChd({ ...base, sbp: IMPOSSIBLE });
  assert.equal(bad.valid, false);
  assert.match(bad.band, REFUSAL);
  assert.equal(mesaChd({ ...base, sbp: 125 }).valid, true);
  assert.equal(mesaChd({ ...base, sbp: BOUNDS.sbp.max }).valid, true);
});

test('framingham-cvd refuses an impossible systolic BP instead of ageing the vessels', () => {
  const base = { age: 55, male: true, totalChol: 200, hdl: 45 };
  const bad = framinghamCvd({ ...base, sbp: IMPOSSIBLE });
  assert.equal(bad.valid, false);
  assert.match(bad.band, REFUSAL);
  assert.equal(bad.vascularAge, undefined);
  assert.equal(framinghamCvd({ ...base, sbp: 120 }).valid, true);
  assert.equal(framinghamCvd({ ...base, sbp: BOUNDS.sbp.max }).valid, true);
});

test('reynolds-risk refuses an impossible systolic BP', () => {
  const base = { age: 55, male: false, totalChol: 200, hdl: 50, hsCrp: 2 };
  const bad = reynoldsRisk({ ...base, sbp: IMPOSSIBLE });
  assert.equal(bad.valid, false);
  assert.match(bad.band, REFUSAL);
  assert.equal(reynoldsRisk({ ...base, sbp: 140 }).valid, true);
  assert.equal(reynoldsRisk({ ...base, sbp: BOUNDS.sbp.max }).valid, true);
});

test('ascvd refuses an impossible systolic BP rather than reporting a risk band', () => {
  const base = { age: 60, sex: 'M', race: 'white', totalChol: 200, hdl: 50 };
  const bad = ascvdPce({ ...base, sbp: IMPOSSIBLE });
  assert.equal(bad.valid, false);
  assert.equal(bad.score, null);
  assert.match(bad.band, REFUSAL);
  assert.notEqual(ascvdPce({ ...base, sbp: 120 }).score, null);
  assert.notEqual(ascvdPce({ ...base, sbp: BOUNDS.sbp.max }).score, null);
});

test('prevent refuses an impossible systolic BP rather than reporting a risk band', () => {
  const base = { age: 60, sex: 'M', totalChol: 200, hdl: 50, bmi: 27, egfr: 80 };
  const bad = prevent10yr({ ...base, sbp: IMPOSSIBLE });
  assert.equal(bad.valid, false);
  assert.equal(bad.score, null);
  assert.match(bad.band, REFUSAL);
  assert.notEqual(prevent10yr({ ...base, sbp: 120 }).score, null);
  assert.notEqual(prevent10yr({ ...base, sbp: BOUNDS.sbp.max }).score, null);
});

// The other half of spec-v1207's rule: a refusal must not ask for a value the
// reader already entered, and must not fire in place of the missing-value
// message. A blank SBP is still asked for by name.
test('a blank systolic BP is still asked for, not called out of range', () => {
  assert.match(score2({ age: 50, male: true, totalChol: 5.5, hdl: 1.3, region: 'low' }).band, /enter/i);
  assert.match(ascvdPce({ age: 60, sex: 'M', race: 'white', totalChol: 200, hdl: 50 }).band, /^Enter /);
  assert.match(prevent10yr({ age: 60, sex: 'M', totalChol: 200, hdl: 50, bmi: 27, egfr: 80 }).band, /^Enter /);
});

// spec-v1176 / the agent surface: a library that refuses in prose but reports
// `valid: true` tells an agent the refusal sentence IS the answer. Both engines
// in lib/scoring-v4.js did exactly that on all three of their refusal paths.
test('every refusal on these two engines says so in the field an agent reads', () => {
  const outOfBand = ascvdPce({ age: 20, sex: 'M', race: 'white', totalChol: 200, hdl: 50, sbp: 120 });
  assert.equal(outOfBand.valid, false);
  assert.equal(prevent10yr({ age: 20, sex: 'M', totalChol: 200, hdl: 50, sbp: 120, bmi: 27, egfr: 80 }).valid, false);
  assert.equal(ascvdPce({ age: 60, sex: 'M', race: 'white', totalChol: 200, hdl: 50 }).valid, false);
});
