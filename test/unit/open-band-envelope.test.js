// spec-v1231: a band table open at one end, with the reassuring band on the
// open side.
//
// Each of these four scores is an if/else chain, and the last `else` catches
// everything. On three of the four that outermost band is the reassuring one, so
// the impossible value did not merely score -- it scored WELL:
//
//   grace       SBP 3000 mmHg  -> "Low (in-hospital mortality < 1%)"
//   oakland     Hb 250 g/dL    -> "safe for outpatient management (95% probability
//                                  of safe discharge)"
//   hacor       pH 80, PaO2 7000 -> "HACOR 0: not in the Duan 2017 high-risk band"
//   lis-murray  PaO2 7000 mmHg -> "Murray LIS 0: no lung injury"
//
// `oakland` is the one to remember: the score's whole purpose is a discharge
// decision, and a haemoglobin no patient has produced one.
//
// Note what the probe's own classifier says about these: `probe-envelope-
// unbounded`'s REASSURING section reads zero, and has since spec-v1211. Four
// discharge-and-rule-out readings sat in "the rest". A gate that reports clean is
// a claim about its reach.
//
// Every envelope and every sentence is BOUNDS / boundsAdvisory, checked after
// each function's own missing-value branch (spec-v1207).
import test from 'node:test';
import assert from 'node:assert/strict';

import { grace, oakland, hacor, lisMurray } from '../../lib/scoring-v4.js';

test('grace refuses the pressure that put it in the lowest-risk band', () => {
  const ok = { age: 65, heartRate: 80, sbp: 115, creatinineMgDl: 1.2, killipClass: 1 };
  const bad = grace({ ...ok, sbp: 3000 });
  assert.equal(bad.valid, false);
  assert.equal(bad.score, null);
  assert.match(bad.band, /systolic blood pressure/);
  assert.match(grace({ ...ok, creatinineMgDl: 250 }).band, /serum creatinine/);
  assert.equal(grace(ok).band, 'Intermediate (1-3%)');
  assert.match(grace({ heartRate: 80, sbp: 115, creatinineMgDl: 1.2, killipClass: 1 }).band, /^Enter age/);
});

test('oakland refuses the haemoglobin that produced a discharge decision', () => {
  const ok = { age: 60, sex: 'M', hr: 80, sbp: 165, hgbGdl: 17 };
  const bad = oakland({ ...ok, hgbGdl: 250 });
  assert.equal(bad.valid, false);
  assert.equal(bad.score, null);
  assert.match(bad.band, /plausible range for hemoglobin/);
  assert.match(oakland({ ...ok, sbp: 3000 }).band, /systolic blood pressure/);
  assert.match(oakland(ok).band, /safe for outpatient management/);
  assert.match(oakland({ age: 60, sex: 'M', hr: 80, sbp: 165 }).band, /^Enter age/);
});

test('hacor refuses each observation it bands', () => {
  const ok = { hr: 80, ph: 7.40, gcs: 15, pao2: 120, fio2: 0.4, rr: 20 };
  assert.match(hacor({ ...ok, ph: 80 }).band, /arterial pH/);
  assert.match(hacor({ ...ok, pao2: 7000 }).band, /arterial PaO2/);
  assert.match(hacor({ ...ok, hr: 3000 }).band, /heart rate/);
  assert.match(hacor({ ...ok, rr: 800 }).band, /respiratory rate/);
  assert.match(hacor({ ...ok, gcs: 150 }).band, /Glasgow Coma Scale/);
  assert.equal(hacor({ ...ok, ph: 80 }).valid, false);
  assert.match(hacor(ok).band, /HACOR 0/);
  assert.match(hacor({}).band, /^Enter all six HACOR inputs/);
});

test('lis-murray refuses the PaO2 that read as no lung injury', () => {
  const ok = { quadrants: 0, pao2: 300, fio2: 0.4, peep: 5, complianceMlPerCmH2O: 80 };
  const bad = lisMurray({ ...ok, pao2: 7000 });
  assert.equal(bad.valid, false);
  assert.match(bad.band, /arterial PaO2/);
  assert.match(lisMurray(ok).band, /no lung injury/);
  assert.match(lisMurray({}).band, /^Enter all five Murray LIS inputs/);
});

// The other half of the agent-surface fix: all four returned a `{ score, band }`
// shape with no `valid` field, so every refusal -- the missing-value ones that
// predate this wave included -- reached an agent as `valid: true` with the
// refusal sentence sitting where the answer goes (spec-v1205).
test('every refusal on these four says so in the field an agent reads', () => {
  assert.equal(grace({}).valid, false);
  assert.equal(oakland({}).valid, false);
  assert.equal(hacor({}).valid, false);
  assert.equal(lisMurray({}).valid, false);
});
