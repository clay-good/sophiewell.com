// spec-v129 2.6: urine osmolal gap (Halperin 1988). calculated osm =
// 2*(Na+K) + urea nitrogen(mg/dL)/2.8 + glucose(mg/dL)/18; gap = measured -
// calculated; gap/2 ~ urinary NH4+. Wide gap -> extrarenal cause; narrow gap
// -> renal tubular acidosis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urineOsmolalGap } from '../../lib/acidbase-v129.js';

test('wide gap -> intact NH4+ excretion (extrarenal cause)', () => {
  const r = urineOsmolalGap({ measuredOsm: 600, urineNa: 40, urineK: 20, urineUrea: 280, urineGlucose: 0 });
  assert.equal(r.valid, true);
  assert.equal(r.calc, 220); // 2*60 + 280/2.8 + 0 = 120 + 100
  assert.equal(r.gap, 380);
  assert.equal(r.nh4, 190);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /intact urinary ammonium/);
});

test('narrow gap -> impaired acidification (renal tubular acidosis)', () => {
  const r = urineOsmolalGap({ measuredOsm: 350, urineNa: 60, urineK: 40, urineUrea: 196, urineGlucose: 0 });
  assert.equal(r.calc, 270); // 2*100 + 196/2.8 = 200 + 70
  assert.equal(r.gap, 80);
  assert.equal(r.nh4, 40);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /renal tubular acidosis/);
});

test('glucose contributes via /18; threshold at 100 mOsm/kg', () => {
  const r = urineOsmolalGap({ measuredOsm: 400, urineNa: 50, urineK: 30, urineUrea: 140, urineGlucose: 180 });
  // calc = 2*80 + 140/2.8 + 180/18 = 160 + 50 + 10 = 220; gap = 180 -> wide
  assert.equal(r.calc, 220);
  assert.equal(r.gap, 180);
  assert.equal(r.abnormal, false);
});

test('zero solutes allowed; missing measured -> valid:false; scalar -> valid:false', () => {
  assert.equal(urineOsmolalGap({ measuredOsm: 300, urineNa: 0, urineK: 0, urineUrea: 0, urineGlucose: 0 }).gap, 300);
  assert.equal(urineOsmolalGap({ urineNa: 40, urineK: 20, urineUrea: 280, urineGlucose: 0 }).valid, false);
  assert.equal(urineOsmolalGap(9).valid, false);
});

// spec-v1202: half the gap approximates urinary ammonium, and nothing stopped
// that half being NEGATIVE. A urine sodium entered as 2000 gave
//
//   Urine osmolal gap -3767.1 mOsm/kg (~NH4+ -1883.6 mEq/L): a narrow gap,
//   consistent with impaired distal acidification (renal tubular acidosis)
//
// -- a quantity that cannot exist, reported as a measurement with a diagnosis
// attached, and the diagnosis is the wrong way round: EVERY negative gap lands
// in the narrow band, so an entry error reads as renal tubular acidosis.
test('a negative gap is an entry to check, not a narrow one', () => {
  const ok = {
    measuredOsm: 400, urineNa: 40, urineK: 30, urineUrea: 300, urineGlucose: 0,
  };
  assert.equal(urineOsmolalGap(ok).valid, true);

  // spec-v1210 declared urine envelopes for these fields, so each value here has
  // to stay INSIDE its envelope -- otherwise the tile refuses for the range and
  // never reaches the negative-gap path this test is about. A urine sodium of 300
  // is high and real; 2,000 (what this used to use) is not a urine sodium.
  for (const bad of [{ urineNa: 300 }, { urineGlucose: 20000 }, { measuredOsm: 100 }]) {
    const r = urineOsmolalGap({ ...ok, ...bad });
    assert.equal(r.valid, false, JSON.stringify(bad));
    assert.match(r.message, /comes out negative/, JSON.stringify(bad));
    assert.match(r.message, /not an ammonium concentration/, JSON.stringify(bad));
    assert.match(r.message, /entry to check rather than a result to read/, JSON.stringify(bad));
    assert.equal(r.nh4, undefined, 'no ammonium is reported');
    assert.equal(r.band, undefined, 'and no band');
  }
});

test('a gap of exactly nothing is a real reading, not an entry error', () => {
  // The rounded gap is what is tested, because a measured osmolality equal to the
  // calculated one comes out a hair below zero in floating point.
  const equal = {
    measuredOsm: 247.1, urineNa: 40, urineK: 30, urineUrea: 300, urineGlucose: 0,
  };
  const r = urineOsmolalGap(equal);
  assert.equal(r.valid, true);
  assert.equal(r.gap, 0);
  assert.equal(r.nh4, 0);
  assert.match(r.band, /a narrow gap/);
});

// spec-v1210: the envelope guard the sibling gas functions in this module have
// had since spec-v1198.
test('an impossible urine sodium is refused rather than reasoned about', () => {
  const bad = urineOsmolalGap({ measuredOsm: 500, urineNa: 99999, urineK: 30, urineUrea: 300, urineGlucose: 0 });
  assert.equal(bad.valid, false);
  assert.match(bad.message, /urine sodium in mmol\/L must be between 0 and 400/);
});

test('these are URINE envelopes, not lib/bounds.js serum ones', () => {
  // spec-v1205's trap: BOUNDS.sodium is SERUM sodium at 90-200, and a urine
  // sodium of 20 is normal. Applying that table here would refuse it.
  assert.equal(urineOsmolalGap({ measuredOsm: 500, urineNa: 20, urineK: 30, urineUrea: 300, urineGlucose: 0 }).valid, true);
});

test('a blank field is still asked for, not reported out of range', () => {
  const r = urineOsmolalGap({ measuredOsm: 500, urineK: 30, urineUrea: 300, urineGlucose: 0 });
  assert.match(r.message, /Enter measured urine osmolality/);
});
