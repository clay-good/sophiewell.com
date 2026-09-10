// spec-v1230: five derivations in lib/clinical.js, and three different ways an
// impossible number stayed invisible.
//
//   map      3000/80 mmHg -> "MAP: 1053.3 mmHg"
//            An average of two pressures. Impossible in, impossible out, and no
//            band beside it for the number to look wrong against.
//
//   aa-gradient / pf-ratio   PaO2 7000 mmHg
//            The A-a gradient came out NEGATIVE (-6900) and the P/F ratio read
//            "Normal" -- the reassuring end of an ARDS severity scale, because
//            the Berlin categories are open at the top.
//
//   egfr / cockcroft-gault   SCr 250 mg/dL
//            A power law compresses. An eGFR from 250 mg/dL lands at ~0,
//            indistinguishable from the dialysis-range value a real 8 gives.
//
// `cockcroftGault` carried the diagnosis in a comment three lines above the
// defect -- "the renderer shows boundsAdvisory('scr', scr) next to the result".
// It does. The library said nothing, so an agent got the clearance with nothing
// beside it (spec-v1205).
//
// The hard floors stay where spec-v53 §3.3 put them: `scr` keeps its 0.01
// denominator floor in the compute function, and BOUNDS.scr.min (0.1) is the
// softer clinical one layered over it.
import test from 'node:test';
import assert from 'node:assert/strict';

import { map, aaGradient, pfRatio, egfrCkdEpi2021, cockcroftGault } from '../../lib/clinical.js';
import { BOUNDS } from '../../lib/bounds.js';

test('map refuses a pressure no patient has', () => {
  assert.throws(() => map({ sbp: 3000, dbp: 80 }), /sbp must be between 20 and 300/);
  assert.throws(() => map({ sbp: 120, dbp: 2000 }), /dbp must be between 5 and 200/);
  assert.equal(map({ sbp: 120, dbp: 80 }), 93.3);
  assert.equal(typeof map({ sbp: BOUNDS.sbp.max, dbp: BOUNDS.dbp.max }), 'number');
});

test('aa-gradient refuses the tension that made the gradient negative', () => {
  assert.throws(() => aaGradient({ fio2: 0.21, paco2: 40, pao2: 7000 }), /pao2 must be between 10 and 700/);
  assert.throws(() => aaGradient({ fio2: 0.21, paco2: 2000, pao2: 90 }), /paco2 must be between 5 and 200/);
  assert.equal(aaGradient({ fio2: 0.21, paco2: 40, pao2: 90 }).aaGradient, 9.73);
});

test('pf-ratio refuses the PaO2 that read as Normal', () => {
  assert.throws(() => pfRatio({ pao2: 7000, fio2: 0.5 }), /pao2 must be between 10 and 700/);
  assert.equal(pfRatio({ pao2: 90, fio2: 0.5 }).category, 'Moderate ARDS (Berlin)');
  // The FiO2 floor of 0.01 is the caller's own and is deliberately not moved to
  // BOUNDS.fio2.min (0.21): spec-v1146 relies on it to reject a blank field.
  assert.throws(() => pfRatio({ pao2: 90, fio2: 0 }), /fio2/);
  assert.equal(pfRatio({ pao2: 90, fio2: 0.15 }).ratio, 600);
});

test('the two clearance estimates refuse a creatinine that compresses to zero', () => {
  assert.throws(() => egfrCkdEpi2021({ scr: 250, age: 60, sex: 'M' }), /scr must be between 0.1 and 25/);
  assert.throws(() => egfrCkdEpi2021({ scr: 1.0, age: 900, sex: 'M' }), /age must be between 0 and 130/);
  assert.equal(egfrCkdEpi2021({ scr: 1.0, age: 60, sex: 'M' }), 86.2);
  assert.throws(() => cockcroftGault({ age: 60, weightKg: 80, scr: 250, sex: 'M' }), /scr must be between 0.1 and 25/);
  assert.throws(() => cockcroftGault({ age: 60, weightKg: 9000, scr: 1.0, sex: 'M' }), /weight kg must be between 0.3 and 500/);
  assert.equal(cockcroftGault({ age: 60, weightKg: 80, scr: 1.0, sex: 'M' }), 88.89);
  // The hard denominator floor is still the compute function's own.
  assert.throws(() => cockcroftGault({ age: 60, weightKg: 80, scr: 0, sex: 'M' }), /scr/);
});
