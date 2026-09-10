// spec-v1228: past a threshold, the size of the number stops mattering.
//
// These four tiles do not compute with their inputs; they compare each one
// against a cutoff. That makes the defect invisible from inside the formula --
// a glucose of 20000 mg/dL is over the 92 mg/dL cutoff in exactly the way 95 is,
// and the answer that comes out is a real diagnostic band:
//
//   iadpsg             fasting 20000 -> "GDM diagnosed per IADPSG 2010"
//   carpenter-coustan  fasting 20000 -> "impaired glucose tolerance"
//   dka-hhs            glucose 20000 -> "Mixed DKA/HHS picture ... hyperosmolality"
//   dka-hhs            pH 80         -> "Criteria ... are not met"  (the reassuring side)
//   tls-cairo-bishop   potassium 100 -> "Clinical tumor lysis syndrome (grade II)"
//
// IADPSG is the sharpest: one value over cutoff diagnoses, so an impossible draw
// did not merely score -- it diagnosed gestational diabetes on its own.
//
// Every envelope and every sentence is BOUNDS / boundsAdvisory. Each check runs
// where a value that was never entered is skipped, so the tile's own
// missing-value message still runs (spec-v1207).
import test from 'node:test';
import assert from 'node:assert/strict';

import { carpenterCoustan, iadpsg } from '../../lib/scoring-v4.js';
import { dkaHhs, tlsCairoBishop } from '../../lib/metabolic-onc-v88.js';

const GLUCOSE = /plausible range for serum glucose/i;

test('iadpsg refuses an impossible draw instead of diagnosing from it', () => {
  const bad = iadpsg({ fasting: 20000, oneHour: 160, twoHour: 140 });
  assert.equal(bad.valid, false);
  assert.equal(bad.gdm, null);
  assert.match(bad.band, GLUCOSE);
  const ok = iadpsg({ fasting: 85, oneHour: 160, twoHour: 140 });
  assert.equal(ok.gdm, false);
  // A draw that was never taken is still reported as missing, not out of range.
  assert.match(iadpsg({ oneHour: 160, twoHour: 140 }).band, /^Enter all three/);
});

test('carpenter-coustan refuses an impossible draw at any of the four', () => {
  const base = { fasting: 85, oneHour: 160, twoHour: 140, threeHour: 120 };
  for (const k of Object.keys(base)) {
    const bad = carpenterCoustan({ ...base, [k]: 20000 });
    assert.equal(bad.valid, false, k);
    assert.match(bad.band, GLUCOSE, k);
  }
  assert.equal(carpenterCoustan(base).exceeded, 0);
  assert.match(carpenterCoustan({ oneHour: 160, twoHour: 140, threeHour: 120 }).band, /^Enter all four/);
});

test('dka-hhs refuses each of the values its ADA criteria compare', () => {
  const base = { glucose: 520, ph: 6.95, bicarbonate: 6, sodium: 130, chloride: 95, betaHydroxybutyrate: 5 };
  assert.match(dkaHhs({ ...base, glucose: 20000 }).band, GLUCOSE);
  assert.match(dkaHhs({ ...base, ph: 80 }).band, /plausible range for arterial pH/i);
  assert.match(dkaHhs({ ...base, bicarbonate: 600 }).band, /plausible range for serum bicarbonate/i);
  assert.match(dkaHhs({ ...base, sodium: 2000 }).band, /plausible range for serum sodium/i);
  assert.equal(dkaHhs({ ...base, glucose: 20000 }).valid, false);
  // Still classifies at a real crisis, and still asks for a blank field.
  assert.match(dkaHhs(base).band, /Diabetic ketoacidosis/);
  assert.match(dkaHhs({ ph: 6.95, bicarbonate: 6 }).band, /^Enter glucose, pH, and bicarbonate/);
});

test('tls-cairo-bishop refuses the lab that met the criterion', () => {
  assert.match(tlsCairoBishop({ potassium: 100, uricAcid: 9 }).band, /plausible range for serum potassium/i);
  assert.match(tlsCairoBishop({ potassium: 6.5, uricAcid: 9, creatinine: 250 }).band, /plausible range for serum creatinine/i);
  assert.equal(tlsCairoBishop({ potassium: 100, uricAcid: 9 }).valid, false);
  // Every lab here is optional by design; a blank one is not out of range.
  assert.match(tlsCairoBishop({ potassium: 6.5, uricAcid: 9, creatinine: 2.4, creatinineUln: 1.2 }).band, /tumor lysis syndrome/i);
  assert.match(tlsCairoBishop({}).band, /^Enter at least the metabolic labs/);
});
