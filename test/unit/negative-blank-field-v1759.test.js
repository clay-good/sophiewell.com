// spec-v1759: a negative in a field the worked example leaves blank was answered exactly as 0.
// Each fixed field: the negative is refused by name, and a positive in-range value still answers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toxicAlcohol } from '../../lib/tox-v86.js';
import { predictedSpirometry } from '../../lib/pulm-v91.js';
import { hietDosing } from '../../lib/tox-v110.js';
import { tlsCairoBishop } from '../../lib/metabolic-onc-v88.js';
import { pkSuite } from '../../lib/pk-v166.js';
import { insulinCorrection, crrtDose } from '../../lib/scoring-v4.js';
import { computeCalculator } from '../../mcp/tools.js';

test('toxic-alcohol: a negative ethanol is refused; a positive one answers', () => {
  const base = { measuredOsm: 320, sodium: 140, glucose: 90, bun: 14, recentIngestion: true };
  const neg = toxicAlcohol({ ...base, ethanol: -50 });
  assert.equal(neg.valid, false);
  assert.match(neg.band, /ethanol/);
  const pos = toxicAlcohol({ ...base, ethanol: 50 });
  assert.notEqual(pos.valid, false);
  assert.equal(typeof pos.osmolarGap, 'number');
  assert.notEqual(toxicAlcohol(base).valid, false); // blank stays optional
});

test('predicted-spirometry: a negative measured FEV1 or FVC is refused; positives answer', () => {
  const base = { age: 40, heightCm: 175, sex: 'male', ethnicity: 'caucasian' };
  for (const k of ['measuredFev1', 'measuredFvc']) {
    const neg = predictedSpirometry({ ...base, [k]: -1 });
    assert.equal(neg.valid, false, k);
    assert.match(neg.band, /measured FEV1|measured FVC/);
  }
  const pos = predictedSpirometry({ ...base, measuredFev1: 3.5, measuredFvc: 4.5 });
  assert.equal(pos.valid, true);
  assert.equal(typeof pos.fev1Pct, 'number');
  assert.equal(typeof pos.fvcPct, 'number');
});

test('hiet-dosing: a negative bolus or rate override is refused; positives answer', () => {
  assert.equal(hietDosing({ weight: 80, bolus: -1 }).valid, false);
  assert.match(hietDosing({ weight: 80, bolus: -1 }).band, /bolus/);
  assert.equal(hietDosing({ weight: 80, rate: -1 }).valid, false);
  assert.match(hietDosing({ weight: 80, rate: -1 }).band, /infusion/);
  const pos = hietDosing({ weight: 80, bolus: 0.5, rate: 2 });
  assert.equal(pos.valid, true);
  assert.equal(pos.bolus, 40);
  assert.equal(pos.startRate, 160);
  assert.equal(hietDosing({ weight: 80 }).bolus, 80); // blank keeps the 1 unit/kg default
});

test('tls-cairo-bishop: a negative uric acid baseline is refused; a positive one answers', () => {
  const neg = tlsCairoBishop({ uricAcid: 7, uricBaseline: -1, potassium: 4 });
  assert.equal(neg.valid, false);
  assert.match(neg.band, /uric acid baseline/);
  const pos = tlsCairoBishop({ uricAcid: 7, uricBaseline: 5, potassium: 4 });
  assert.notEqual(pos.valid, false);
});

test('pk-suite: a negative measured level or dose is refused; positives answer', () => {
  const base = { vd: 50, cl: 5, cp: 10, dose: 500 };
  const neg = pkSuite({ ...base, measured: -1 });
  assert.equal(neg.valid, false);
  assert.match(neg.message, /measured concentration/);
  assert.equal(pkSuite({ ...base, measured: 5, dose: -1 }).valid, false);
  const pos = pkSuite({ ...base, measured: 5 });
  assert.equal(pos.valid, true);
  assert.equal(pos.adjusted, 1000);
});

test('cockcroft-gault and egfr-suite: a negative height is refused; a positive one answers', () => {
  const cg = { age: '60', w: '80', scr: '1', sex: 'M' };
  const negCg = computeCalculator({ id: 'cockcroft-gault', inputs: { ...cg, 'cg-h': '-170' } });
  assert.equal(negCg.valid, false);
  assert.match(negCg.message, /height/);
  const posCg = computeCalculator({ id: 'cockcroft-gault', inputs: { ...cg, 'cg-h': '170' } });
  assert.equal(posCg.valid, true);
  assert.equal(typeof posCg.result.byWeight.ideal, 'number');

  const es = { 'es-scr': '1', 'es-age': '60', 'es-sex': 'M', 'es-w': '80' };
  const negEs = computeCalculator({ id: 'egfr-suite', inputs: { ...es, 'es-h': '-170' } });
  assert.equal(negEs.valid, false);
  assert.match(negEs.message, /height/);
  const posEs = computeCalculator({ id: 'egfr-suite', inputs: { ...es, 'es-h': '170' } });
  assert.equal(posEs.valid, true);
  assert.equal(typeof posEs.result.ckdEpi2021MlMin, 'number');
});

test('insulin-correction: a negative ISF is refused; a positive one answers and a blank derives', () => {
  const base = { currentBG: 250, targetBG: 150, totalDailyDose: 50, isfRule: 'rapid' };
  assert.throws(() => insulinCorrection({ ...base, isf: -50 }), /ISF/);
  const pos = insulinCorrection({ ...base, isf: 50 });
  assert.equal(pos.correctionUnits, 2);
  assert.equal(pos.isfDerivedFromTdd, false);
  assert.equal(insulinCorrection({ ...base, isf: '' }).isfDerivedFromTdd, true);
  assert.equal(insulinCorrection({ ...base, isf: 0 }).isfDerivedFromTdd, true);
});

test('crrt-dose: a negative post-filter ionized calcium is refused; a positive one answers', () => {
  const base = { weightKg: 80, effluentRateMlPerHr: 2000, modality: 'CVVHDF' };
  assert.throws(() => crrtDose({ ...base, postFilterIonisedCa: -1 }), /post-filter ionized calcium/);
  const pos = crrtDose({ ...base, postFilterIonisedCa: 0.5 });
  assert.ok(pos.banners.some((b) => /Post-filter ionized Ca 0.5 mmol/.test(b)));
  assert.equal(typeof crrtDose(base).effluentDoseMlPerKgPerHr, 'number');
});
