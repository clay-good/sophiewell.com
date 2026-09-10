// spec-v1227: the same defect, in the ten remaining files that share the helper.
//
// spec-v1226 fixed three files by hand. This is the rest of the shape: every
// library file whose local `pos(v, max = Infinity)` returns one `null` for a
// blank field, a non-number AND a value past `max`, with a caller that reads
// `null` as absent and builds a `missing` list from it.
//
// The bounds and the labels are the callers' own, taken from the `pos` / `real`
// / `inRange` call and the `missing.push` string that already sat beside each
// other. No bound moves. The one edit made to a label is that a range printed
// inside it -- "SpO₂ (%, 1-100)" -- is dropped for the range sentence, because
// "SpO₂ (%, 1-100) must be between 1 and 100" says it twice, and where the
// printed range and the enforced one disagree (FiO₂ says 0.21 and enforces
// 0.18) it would say it twice and differently.
import test from 'node:test';
import assert from 'node:assert/strict';

import { sfRatio, osi, ventilatoryRatio, ventilationIndex } from '../../lib/vent-v195.js';
import { ocularPerfusionPressure, iolPower } from '../../lib/ophtho-v164.js';
import { crusade, timiRiskIndex, cadillacRisk } from '../../lib/acs-v193.js';
import { toeBrachialIndex, meanAirwayPressure } from '../../lib/oneformula-v167.js';
import { dlcoCorrection, pisaEroa } from '../../lib/specialtymath-v186.js';
import { oralDispositionIndex, homaBeta } from '../../lib/endo-quant-v197.js';
import { hasfordCml } from '../../lib/heme-staging-v188.js';
import { glasgowPrognosticScore } from '../../lib/onc-staging-v187.js';
import { ctEffectiveDose } from '../../lib/radiology-v165.js';

const CHECK = /must be .* Check the value entered\.$/;

test('an out-of-range value is named and ranged, on every file in this wave', () => {
  const cases = [
    [() => sfRatio({ spo2: 950, fio2: 0.4 }), /SpO₂ \(%\) must be between 1 and 100/],
    [() => osi({ fio2: 4, map: 12, spo2: 95 }), /FiO₂ \(fraction\) must be between 0.18 and 1/],
    [() => ocularPerfusionPressure({ sbp: 3000, dbp: 80, iop: 15 }), /Systolic BP \(mmHg\) must be/],
    [() => crusade({ hct: 700, crcl: 60, hr: 80, sbp: 120, sex: 'male' }), /hematocrit \(%\) must be/i],
    [() => toeBrachialIndex({ toe: 60, brachial: 3000 }), /rachial systolic pressure \(mmHg\) must be/],
    [() => dlcoCorrection({ dlco: 20, hb: 300, va: 6, sex: 'male' }), /[Hh]emoglobin \(g\/dL\) must be/],
    [() => oralDispositionIndex({ g0: 20000, g30: 160, i0: 10, i30: 60 }), /glucose \(mg\/dL\) must be/],
    [() => hasfordCml({ age: 900, spleen: 2, platelets: 300, blasts: 2, eos: 1, baso: 1 }), CHECK],
    [() => ctEffectiveDose({ dlp: 1e9, region: 'chest' }), CHECK],
  ];
  for (const [run, re] of cases) {
    const r = run();
    assert.equal(r.valid, false);
    assert.match(r.message, re);
    assert.match(r.message, CHECK);
  }
});

test('a blank field is still asked for, in the tile\'s own words', () => {
  assert.match(sfRatio({ fio2: 0.4 }).message, /^Enter the SpO₂/);
  assert.match(ocularPerfusionPressure({ dbp: 80, iop: 15 }).message, /^Enter the /);
  assert.match(toeBrachialIndex({ toe: 60 }).message, /^Enter the /);
  assert.match(glasgowPrognosticScore({ crp: 12 }).message, /^Enter the /);
});

test('and each tile still answers at a plausible reading', () => {
  assert.equal(sfRatio({ spo2: 95, fio2: 0.4 }).valid, true);
  assert.equal(osi({ fio2: 0.6, map: 12, spo2: 95 }).valid, true);
  assert.equal(ocularPerfusionPressure({ sbp: 120, dbp: 80, iop: 15 }).valid, true);
  assert.equal(toeBrachialIndex({ toe: 60, brachial: 120 }).valid, true);
  assert.equal(dlcoCorrection({ dlco: 20, hb: 10, va: 6, sex: 'male' }).valid, true);
  assert.equal(homaBeta({ glucose: 5.5, insulin: 10 }).valid, true);
  assert.equal(meanAirwayPressure({ pip: 25, peep: 5, ti: 1, te: 2 }).valid, true);
  assert.equal(iolPower({ al: 23.5, k: 44, aConst: 118.4 }).valid, true);
  assert.equal(timiRiskIndex({ hr: 80, age: 60, sbp: 120 }).valid, true);
  assert.equal(cadillacRisk({ lvef: 50, crcl: 70, age: 60, killip: '1', anemia: false, vessels: '1', timi: '3' }).valid, true);
  assert.equal(ventilatoryRatio({ ve: 8000, paco2: 45, height: 175, sex: 'male' }).valid, true);
  assert.equal(ventilationIndex({ rr: 20, pip: 25, peep: 5, paco2: 45 }).valid, true);
  assert.equal(pisaEroa({ r: 0.8, va: 40, vpeak: 500, vti: 100 }).valid, true);
});
