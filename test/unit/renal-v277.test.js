// spec-v277: worked examples for measured (timed-urine) creatinine clearance. Formula
// spec-v97 verified against the C = (U x V) / P clearance identity (standard renal physiology):
// CrCl (mL/min) = (urine Cr x urine volume mL) / (serum Cr x collection time min).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measuredCrcl } from '../../lib/renal-v277.js';

test('measured-crcl: a normal 24-hour worked example', () => {
  const r = measuredCrcl({ urineCr: 100, urineVolume: 1440, serumCr: 1.0, hours: 24 });
  // (100 x 1440) / (1.0 x 1440 min) = 100 mL/min.
  assert.equal(r.valid, true);
  assert.equal(r.score, 100);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Measured creatinine clearance 100 mL/min'));
  assert.ok(r.band.includes('24-hour'));
});

test('measured-crcl: a reduced clearance (< 60) is flagged', () => {
  const r = measuredCrcl({ urineCr: 60, urineVolume: 1000, serumCr: 2.0, hours: 24 });
  // (60 x 1000) / (2.0 x 1440) = 60000 / 2880 = 20.833 -> r1 20.8.
  assert.equal(r.score, 20.8);
  assert.equal(r.abnormal, true);
});

test('measured-crcl: units cancel so only the Cr ratio matters', () => {
  const a = measuredCrcl({ urineCr: 120, urineVolume: 1440, serumCr: 1.2, hours: 24 });
  const b = measuredCrcl({ urineCr: 100, urineVolume: 1440, serumCr: 1.0, hours: 24 });
  assert.equal(a.score, b.score); // both 100 mL/min
});

test('measured-crcl: missing / out-of-range inputs are invalid', () => {
  assert.equal(measuredCrcl({ urineCr: 100, urineVolume: 1440, serumCr: 1.0 }).valid, false);
  assert.equal(measuredCrcl({}).valid, false);
  assert.equal(measuredCrcl().valid, false);
  assert.equal(measuredCrcl({ urineCr: 100, urineVolume: 1440, serumCr: 0, hours: 24 }).valid, false);
});
