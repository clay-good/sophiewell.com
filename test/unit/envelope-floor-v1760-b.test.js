// spec-v1760: a value below the floor lib/bounds.js declares used to answer, because no finder
// had driven a floor. Per fixed field: half the floor is refused, an in-range value still answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  urineOutput, gir, ebvMabl, potassiumDeficit, magnesiumReplacement, burnUopTarget, fluidBalance,
} from '../../lib/clinical-v7.js';
import { rsbi, correctedAnionGap } from '../../lib/clinical-v5.js';
import { cao2Do2, oxygenationIndex, acidBaseDeficit } from '../../lib/clinical-v6.js';
import { oasis, lods, deltaGap } from '../../lib/critcare-severity-v200.js';
import { scorten } from '../../lib/dermuro-v191.js';
import { efwClearance } from '../../lib/nephro-fluids-v204.js';
import { psi } from '../../lib/scoring-v4.js';
import { sapsII } from '../../lib/idcrit-v99.js';
import { meld3 } from '../../lib/meld3-v678.js';
import { sbpAsciticFluid } from '../../lib/sbp-ascitic-fluid-v852.js';
import ADAPTERS from '../../mcp/adapters/clinical-v4.js';

const PLAUSIBLE = /plausible range/;

test('clinical-v7 weight floor (0.3 kg): half refused, 0 keeps its meaning, in range answers', () => {
  assert.throws(() => urineOutput({ volumeMl: 100, intervalHr: 4, weightKg: 0.15 }), PLAUSIBLE);
  assert.equal(urineOutput({ volumeMl: 100, intervalHr: 4, weightKg: 0 }), null);
  assert.ok(urineOutput({ volumeMl: 100, intervalHr: 4, weightKg: 60 }).rate > 0);
  assert.throws(() => gir({ dextrosePct: 10, rateMlHr: 12, weightKg: 0.15 }), PLAUSIBLE);
  assert.equal(gir({ dextrosePct: 10, rateMlHr: 12, weightKg: 0 }), null);
  assert.ok(gir({ dextrosePct: 10, rateMlHr: 12, weightKg: 3 }).gir > 0);
  assert.throws(() => ebvMabl({ weightKg: 0.15, ebvFactor: 75, startHct: 45, minHct: 30 }), PLAUSIBLE);
  assert.equal(ebvMabl({ weightKg: 0, ebvFactor: 75, startHct: 45, minHct: 30 }), null);
  assert.equal(ebvMabl({ weightKg: 70, ebvFactor: 75, startHct: 45, minHct: 30 }).ebv, 5250);
  assert.throws(() => burnUopTarget({ weightKg: 0.15 }), PLAUSIBLE);
  assert.equal(burnUopTarget({ weightKg: 70 }).targetLowMlHr, 35);
  assert.throws(() => fluidBalance({ intakeMl: 1000, outputMl: 200, weightKg: 0.15 }), PLAUSIBLE);
  assert.equal(fluidBalance({ intakeMl: 1000, outputMl: 200, weightKg: 0 }).pctBodyWeight, null);
  assert.equal(fluidBalance({ intakeMl: 1000, outputMl: 200, weightKg: 80 }).pctBodyWeight, 1);
});

test('potassium-deficit: serum K floor (1) and weight floor (0.3 kg)', () => {
  assert.throws(() => potassiumDeficit({ serumK: 0.5, weightKg: 70, targetK: 4 }), PLAUSIBLE);
  assert.throws(() => potassiumDeficit({ serumK: 3, weightKg: 0.15, targetK: 4 }), PLAUSIBLE);
  assert.equal(potassiumDeficit({ serumK: 3, weightKg: 70, targetK: 4 }).deficit, 100);
});

test('magnesium-replacement: serum Mg floor (0.3 mg/dL)', () => {
  assert.throws(() => magnesiumReplacement({ serumMg: 0.15, severity: 2 }), PLAUSIBLE);
  assert.equal(magnesiumReplacement({ serumMg: 1.2, severity: 2 }).doseLow, 2);
});

test('rsbi rr floor (3) and corrected-anion-gap bicarbonate floor (2)', () => {
  assert.throws(() => rsbi({ respiratoryRate: 1.5, tidalVolumeMl: 400 }), PLAUSIBLE);
  assert.equal(rsbi({ respiratoryRate: 20, tidalVolumeMl: 400 }).rsbi, 50);
  assert.throws(() => correctedAnionGap({ na: 140, cl: 104, hco3: 1, albuminGdl: 4 }), PLAUSIBLE);
  assert.equal(correctedAnionGap({ na: 140, cl: 104, hco3: 24, albuminGdl: 4 }).correctedAg, 12);
});

test('cao2-do2 and oxygenation-index PaO2 floor (10); acid-base-deficit bicarbonate floor (2)', () => {
  assert.throws(() => cao2Do2({ hb: 15, sao2: 98, pao2: 5 }), PLAUSIBLE);
  assert.ok(cao2Do2({ hb: 15, sao2: 98, pao2: 100 }).cao2 > 0);
  assert.throws(() => oxygenationIndex({ fio2: 0.6, map: 15, pao2: 5 }), PLAUSIBLE);
  assert.equal(oxygenationIndex({ fio2: 0.6, map: 15, pao2: 60 }).oi, 15);
  const abd = { weightKg: 70, sex: 'M', targetHco3: 24, measuredNa: 140, targetNa: 140 };
  assert.throws(() => acidBaseDeficit({ ...abd, measuredHco3: 1 }), PLAUSIBLE);
  assert.equal(acidBaseDeficit({ ...abd, measuredHco3: 14 }).hco3DeficitMeq, 350);
});

test('oasis heart rate floor (10)', () => {
  const base = { preIcuHours: 10, age: 60, gcs: 15, hr: 80, map: 80, rr: 16, temp: 37, urine: 2000, mechVent: false, elective: false };
  const low = oasis({ ...base, hr: 5 });
  assert.equal(low.valid, false);
  assert.match(low.message, PLAUSIBLE);
  assert.equal(oasis(base).valid, true);
});

test('lods heart rate (10), systolic BP (20) and BUN (1) floors', () => {
  const base = { gcs: 15, hr: 80, sbp: 120, bun: 14, creatinine: 1, urineL: 2, wbc: 8, platelets: 200, bilirubin: 1 };
  for (const [k, v] of [['hr', 5], ['sbp', 10], ['bun', 0.5]]) {
    const r = lods({ ...base, [k]: v });
    assert.equal(r.valid, false, k);
    assert.match(r.message, PLAUSIBLE, k);
  }
  assert.equal(lods(base).valid, true);
});

test('delta-gap bicarbonate (2) and sodium (85) floors', () => {
  assert.match(deltaGap({ na: 140, cl: 100, hco3: 1 }).message, PLAUSIBLE);
  // spec-v1763: bound widened (source in lib/bounds.js)
  assert.match(deltaGap({ na: 84, cl: 60, hco3: 12 }).message, PLAUSIBLE);
  assert.equal(deltaGap({ na: 140, cl: 100, hco3: 12 }).valid, true);
});

test('scorten heart rate (10), BUN (1) and bicarbonate (2) floors; blank stays allowed', () => {
  const base = { age: 50, heartRate: 90, bsaDetached: 5, bun: 20, bicarbonate: 24, glucose: 120, malignancy: false };
  for (const [k, v] of [['heartRate', 5], ['bun', 0.5], ['bicarbonate', 1]]) {
    const r = scorten({ ...base, [k]: v });
    assert.equal(r.valid, false, k);
    assert.match(r.message, PLAUSIBLE, k);
  }
  assert.notEqual(scorten(base).valid, false);
  assert.doesNotMatch(String(scorten({ ...base, bun: '' }).message ?? ''), PLAUSIBLE);
});

test('efw-clearance plasma sodium floor (90)', () => {
  const base = { urineNa: 40, urineK: 20, urineVolume: 1000 };
  assert.match(efwClearance({ ...base, plasmaNa: 45 }).message, PLAUSIBLE);
  assert.equal(efwClearance({ ...base, plasmaNa: 120 }).valid, true);
});

test('meld3 sodium floor (90)', () => {
  const base = { sex: 'male', bilirubin: 2, inr: 1.5, creatinine: 1.2, albumin: 3 };
  const r = meld3({ ...base, sodium: 45 });
  assert.equal(r.valid, false);
  assert.match(r.message, PLAUSIBLE);
  assert.equal(meld3({ ...base, sodium: 130 }).valid, true);
});

test('psi arterial pH: refused below 6.5 and above 8, blank allowed', () => {
  const base = { age: 70, sex: 'M' };
  for (const ph of [3.25, 8.5, -999999]) {
    const r = psi({ ...base, ph });
    assert.equal(r.valid, false, String(ph));
    assert.match(r.message, PLAUSIBLE);
  }
  assert.equal(psi({ ...base, ph: 7.2 }).score, 100);
  assert.equal(psi({ ...base, ph: null }).score, 70);
});

test('saps-ii FiO2 floor (0.21); 0 keeps its meaning (not entered)', () => {
  const base = {
    age: 60, heartRate: 90, sbp: 120, temperature: 37, ventilated: true, paO2: 80, urineOutput: 1500,
    bun: 20, sodium: 140, potassium: 4, bicarbonate: 24, bilirubin: 1, wbc: 8, gcs: 15,
    chronicDisease: 'none', admissionType: 'scheduled-surgical',
  };
  const low = sapsII({ ...base, fio2: 0.105 });
  assert.equal(low.valid, false);
  assert.match(low.band, PLAUSIBLE);
  assert.notEqual(sapsII({ ...base, fio2: 0 }).valid, false);
  assert.notEqual(sapsII({ ...base, fio2: 0.5 }).valid, false);
});

test('sbp-ascitic-fluid creatinine (0.1) and BUN (1) floors; blank allowed', () => {
  const base = { pmnCount: 300, culture: 'pending' };
  assert.match(sbpAsciticFluid({ ...base, creatinine: 0.05 }).message, PLAUSIBLE);
  assert.match(sbpAsciticFluid({ ...base, bun: 0.5 }).message, PLAUSIBLE);
  assert.notEqual(sbpAsciticFluid({ ...base, creatinine: 1.2, bun: 20 }).valid, false);
  assert.notEqual(sbpAsciticFluid({ ...base, creatinine: '', bun: '' }).valid, false);
});

test('bw-bsa-suite adapter weight floor (0.3 kg)', () => {
  const t = ADAPTERS.find((a) => a.id === 'bw-bsa-suite');
  assert.throws(() => t.compute({ heightInches: 70, sex: 'M', actualKg: 0.15 }), PLAUSIBLE);
  assert.ok(t.compute({ heightInches: 70, sex: 'M', actualKg: 80 }).bsaMosteller > 0);
});
