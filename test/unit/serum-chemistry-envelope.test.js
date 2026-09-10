// spec-v1225: arithmetic has no opinion about physiology.
//
// The serum-chemistry identities in lib/clinical.js and lib/clinical-v4.js take
// two or three numbers and subtract them. `num(name, v)` was called on each with
// no ceiling, so the formula ran on whatever arrived:
//
//   anion-gap          sodium 2000 mEq/L -> "Anion gap 1876"
//   corrected-calcium  albumin 70 g/dL   -> "-44.8 mg/dL"
//   corrected-sodium   glucose 20000     -> "sodium 448.4 / 607.6 mEq/L"
//   osmolal-gap        sodium 2000       -> a calculated osmolality over 4000
//   winters            HCO3 600 mEq/L    -> "expected PaCO2 906-910 mmHg"
//   abg                HCO3 600 mEq/L    -> a primary disorder and a compensation note
//
// `corrected-calcium` is the one to remember: a NEGATIVE serum calcium, printed
// as the answer. An impossible input produced an impossible output, which is the
// shape spec-v1181 recorded on `cdai-crohns`.
//
// The browser already advised on several of these -- `adviseAll` in
// views/group-e.js calls the same `boundsAdvisory` -- and the library did not,
// so an agent received the number with nothing beside it. Every bound here is
// BOUNDS'; no clinical number is invented in this wave.
import test from 'node:test';
import assert from 'node:assert/strict';

import { anionGap, correctedCalcium, correctedSodium, abgInterpret } from '../../lib/clinical.js';
import { osmolalGap, wintersFormula } from '../../lib/clinical-v4.js';
import { BOUNDS } from '../../lib/bounds.js';

test('anion-gap refuses an impossible sodium or bicarbonate', () => {
  assert.throws(() => anionGap({ sodium: 2000, chloride: 100, bicarbonate: 24 }), /sodium must be between 90 and 200/);
  assert.throws(() => anionGap({ sodium: 140, chloride: 100, bicarbonate: 600 }), /bicarbonate must be between 2 and 60/);
  assert.throws(() => anionGap({ sodium: 140, chloride: 1600, bicarbonate: 24 }), /chloride must be between 50 and 160/);
  assert.equal(anionGap({ sodium: 140, chloride: 100, bicarbonate: 24 }).anionGap, 16);
  // The envelope's own edges are legitimate readings, not errors.
  assert.equal(typeof anionGap({ sodium: BOUNDS.sodium.max, chloride: 100, bicarbonate: 24 }).anionGap, 'number');
});

test('the optional albumin correction on anion-gap carries the same envelope', () => {
  assert.throws(() => anionGap({ sodium: 140, chloride: 100, bicarbonate: 24, albuminGdl: 70 }), /albumin must be between 0.5 and 7/);
  assert.equal(anionGap({ sodium: 140, chloride: 100, bicarbonate: 24, albuminGdl: 2.0 }).correctedAnionGap, 21);
});

test('corrected-calcium refuses the albumin that made the calcium negative', () => {
  assert.throws(() => correctedCalcium({ measuredCa: 8.0, albuminGdl: 70 }), /albumin must be between 0.5 and 7/);
  assert.throws(() => correctedCalcium({ measuredCa: 80, albuminGdl: 2.0 }), /calcium must be between 3 and 20/);
  assert.equal(correctedCalcium({ measuredCa: 8.0, albuminGdl: 2.0 }), 9.6);
});

test('corrected-sodium refuses an impossible sodium or glucose', () => {
  assert.throws(() => correctedSodium({ measuredNa: 130, glucose: 20000 }), /glucose must be between 5 and 2000/);
  assert.throws(() => correctedSodium({ measuredNa: 2000, glucose: 600 }), /sodium must be between 90 and 200/);
  assert.equal(correctedSodium({ measuredNa: 130, glucose: 600 }).naBy1_6, 138);
});

test('osmolal-gap refuses the sodium that doubled into the calculated osmolality', () => {
  const ok = { measuredOsm: 300, sodium: 140, glucoseMgDl: 90, bunMgDl: 14 };
  assert.throws(() => osmolalGap({ ...ok, sodium: 2000 }), /sodium must be between 90 and 200/);
  assert.throws(() => osmolalGap({ ...ok, glucoseMgDl: 20000 }), /glucose must be between 5 and 2000/);
  assert.throws(() => osmolalGap({ ...ok, bunMgDl: 3000 }), /BUN must be between 1 and 300/);
  assert.equal(Math.round(osmolalGap(ok).calculatedOsm), 290);
});

test('winters refuses a bicarbonate that predicts a PaCO2 nobody has', () => {
  assert.throws(() => wintersFormula({ hco3: 600 }), /HCO3 must be between 2 and 60/);
  assert.equal(wintersFormula({ hco3: 14 }).expectedPaco2Low, 27);
});

test('abg refuses an impossible bicarbonate or PaCO2', () => {
  assert.throws(() => abgInterpret({ pH: 7.2, paco2: 30, hco3: 600 }), /hco3 must be between 2 and 60/);
  assert.throws(() => abgInterpret({ pH: 7.2, paco2: 2000, hco3: 14 }), /paco2 must be between 5 and 200/);
  assert.equal(abgInterpret({ pH: 7.2, paco2: 30, hco3: 14 }).primary, 'Metabolic acidosis');
});

// spec-v1207's rule from the other side: the range check must not swallow the
// missing-value message, so a blank field is still reported as blank.
test('a blank field is still called blank, not out of range', () => {
  assert.throws(() => anionGap({ chloride: 100, bicarbonate: 24 }), /must be a number/);
  assert.throws(() => wintersFormula({ measuredPaco2: 30 }), /HCO3 must be a number/);
  assert.throws(() => correctedCalcium({ measuredCa: 8.0 }), /must be a number/);
});
