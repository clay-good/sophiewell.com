// spec-v91 §2.2: BODE multidimensional COPD prognosis (Celli 2004).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bodeIndex } from '../../lib/pulm-v91.js';

test('worked example: BMI 24, FEV1 45%, mMRC 2, 6MWD 300 -> 4 (quartile 3-4)', () => {
  // BMI 0 + obstruction(45->2) + dyspnea(2->1) + exercise(300->1) = 4
  const r = bodeIndex({ bmi: 24, fev1Pct: 45, mmrc: 2, sixMwd: 300 });
  assert.equal(r.total, 4);
  assert.deepEqual([r.bmiPts, r.obsPts, r.dysPts, r.exPts], [0, 2, 1, 1]);
  assert.equal(r.survivalBand, '3-4');
  assert.match(r.survival, /67%/);
});

test('survival-quartile flip 2 -> 3 (band 0-2 to 3-4)', () => {
  // score 2: BMI>21(0) + FEV1 70(0) + mMRC1(0) + 6MWD 200(2) = 2 -> 0-2
  const lo = bodeIndex({ bmi: 24, fev1Pct: 70, mmrc: 1, sixMwd: 200 });
  assert.equal(lo.total, 2);
  assert.equal(lo.survivalBand, '0-2');
  // score 3: add a BMI point (<=21)
  const hi = bodeIndex({ bmi: 20, fev1Pct: 70, mmrc: 1, sixMwd: 200 });
  assert.equal(hi.total, 3);
  assert.equal(hi.survivalBand, '3-4');
});

test('BMI and 6MWD point cut-points', () => {
  assert.equal(bodeIndex({ bmi: 21, fev1Pct: 90, mmrc: 0, sixMwd: 400 }).bmiPts, 1);
  assert.equal(bodeIndex({ bmi: 21.1, fev1Pct: 90, mmrc: 0, sixMwd: 400 }).bmiPts, 0);
  assert.equal(bodeIndex({ bmi: 25, fev1Pct: 90, mmrc: 0, sixMwd: 350 }).exPts, 0);
  assert.equal(bodeIndex({ bmi: 25, fev1Pct: 90, mmrc: 0, sixMwd: 349 }).exPts, 1);
  assert.equal(bodeIndex({ bmi: 25, fev1Pct: 90, mmrc: 0, sixMwd: 149 }).exPts, 3);
});

test('max score 10 (quartile 7-10)', () => {
  const r = bodeIndex({ bmi: 18, fev1Pct: 20, mmrc: 4, sixMwd: 100 });
  assert.equal(r.total, 10);
  assert.equal(r.survivalBand, '7-10');
  assert.match(r.survival, /18%/);
});

test('mMRC clamped to 0-4; partial input refused', () => {
  // a stray mMRC 9 clamps to 4 (3 dyspnea points), never indexes undefined
  assert.equal(bodeIndex({ bmi: 25, fev1Pct: 90, mmrc: 9, sixMwd: 400 }).dysPts, 3);
  assert.equal(bodeIndex({ bmi: 25, fev1Pct: 90, mmrc: 2 }).valid, false);
});
