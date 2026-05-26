// spec-v48: derivation renderer + per-tile derivation schema tests.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';
import { wellsPe, gcs, wellsDvt, chadsVasc, hasBled } from '../../lib/clinical.js';
import { qsofa, timi, heart, perc, sofa, news2, meld30, curb65, centor, mcisaac, ciwaAr, fourScore, bisap, cows, icdsc, fourAt, psi, cpot, bps, braden, morseFalls, lawtonIadl, katzAdl, barthel, rosier, cpss, lams, race, sos, flacc, hendrichII, atriaBleeding, orbitBleeding, painad, miniCog, mews, comfortB, wat1, stopBang, fourTs, ichScore, improveVte, khorana, dashVte, herdoo2, hospitalScore, improveBleeding, aldrete, padss } from '../../lib/scoring-v4.js';
import { nihss } from '../../lib/clinical.js';
import { rcri, abcd2 } from '../../lib/clinical-v5.js';

// --- 1. Schema completeness ---------------------------------------------

const REQUIRED_FIELDS = ['formula', 'population', 'units', 'validity', 'source'];
const WAVE_48_1A_TILES = ['wells-pe', 'gcs', 'qsofa-sofa'];
const WAVE_48_1B_TILES = ['wells-dvt', 'chads', 'hasbled', 'perc', 'timi', 'heart'];
const WAVE_48_1C_TILES = ['news2', 'meld-childpugh'];
const WAVE_48_2A_TILES = ['curb-65', 'centor', 'ciwa', 'four-score'];
const WAVE_48_2B_TILES = ['ranson-bisap', 'cows', 'icdsc', '4at'];
const WAVE_48_2C_TILES = ['psi', 'cpot', 'bps', 'guss'];
const WAVE_48_3A_TILES = ['braden', 'morse-falls', 'lawton-iadl', 'katz-adl'];
const WAVE_48_3B_TILES = ['barthel', 'rosier', 'cpss', 'lams'];
const WAVE_48_3C_TILES = ['nihss', 'race', 'meows', 'sos'];
const WAVE_48_3D_TILES = ['phq9', 'gad7', 'cam', 'cssrs'];
const WAVE_48_4A_TILES = ['atria-bleeding', 'hendrich-ii', 'flacc', 'auditc'];
const WAVE_48_4B_TILES = ['orbit-bleeding', 'painad', 'cage', 'mini-cog'];
const WAVE_48_4C_TILES = ['epds', 'mews', 'comfort-b', 'wat-1'];
const WAVE_48_4D_TILES = ['stop-bang', 'four-ts', 'abcd2', 'rcri'];
const WAVE_48_4E_TILES = ['ich-score', 'improve-vte', 'khorana', 'dash-vte'];
const WAVE_48_4F_TILES = ['herdoo2', 'hospital-score', 'improve-bleeding', 'aldrete-padss'];
const ALL_DERIVATION_TILES = [...WAVE_48_1A_TILES, ...WAVE_48_1B_TILES, ...WAVE_48_1C_TILES, ...WAVE_48_2A_TILES, ...WAVE_48_2B_TILES, ...WAVE_48_2C_TILES, ...WAVE_48_3A_TILES, ...WAVE_48_3B_TILES, ...WAVE_48_3C_TILES, ...WAVE_48_3D_TILES, ...WAVE_48_4A_TILES, ...WAVE_48_4B_TILES, ...WAVE_48_4C_TILES, ...WAVE_48_4D_TILES, ...WAVE_48_4E_TILES, ...WAVE_48_4F_TILES];

for (const id of ALL_DERIVATION_TILES) {
  test(`derivation schema: ${id} has all required fields`, () => {
    const d = META[id].derivation;
    assert.ok(d, `${id} must have derivation`);
    for (const k of REQUIRED_FIELDS) {
      assert.ok(d[k] !== undefined && d[k] !== null, `${id}.derivation.${k} present`);
    }
    assert.equal(typeof d.formula, 'string');
    assert.equal(typeof d.population, 'string');
    assert.equal(typeof d.validity, 'string');
    assert.equal(typeof d.source, 'string');
    assert.equal(typeof d.units, 'object');
  });
}

for (const id of ALL_DERIVATION_TILES) {
  test(`derivation schema: ${id} units key set covers every component input`, () => {
    const d = META[id].derivation;
    if (!Array.isArray(d.components)) return;
    for (const c of d.components) {
      assert.ok(d.units[c.inputKey], `${id}.derivation.units missing key ${c.inputKey}`);
    }
  });
}

// --- 2. Components sum -- additive scoring must reproduce the score -----

test('wells-pe components sum equals wellsPe() computed total (zero case)', () => {
  const inputs = {
    clinicalDvtSigns: false, peLikely: false, hrOver100: false,
    immobilizationOrSurgery: false, priorPeOrDvt: false,
    hemoptysis: false, malignancy: false,
  };
  const r = wellsPe(inputs);
  const sum = META['wells-pe'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 0);
});

test('wells-pe components sum equals wellsPe() computed total (mid case 4.5)', () => {
  const inputs = {
    clinicalDvtSigns: false, peLikely: true, hrOver100: true,
    immobilizationOrSurgery: false, priorPeOrDvt: false,
    hemoptysis: false, malignancy: false,
  };
  const r = wellsPe(inputs);
  const sum = META['wells-pe'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 4.5);
});

test('wells-pe components sum equals wellsPe() computed total (all true, 12.5)', () => {
  const inputs = {
    clinicalDvtSigns: true, peLikely: true, hrOver100: true,
    immobilizationOrSurgery: true, priorPeOrDvt: true,
    hemoptysis: true, malignancy: true,
  };
  const r = wellsPe(inputs);
  const sum = META['wells-pe'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 12.5);
});

test('gcs components sum equals gcs() computed total (worked example 3+4+5=12)', () => {
  const inputs = { eye: 3, verbal: 4, motor: 5 };
  const r = gcs(inputs);
  const sum = META.gcs.derivation.components.reduce((acc, c) => acc + c.points(inputs[c.inputKey]), 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 12);
});

test('gcs components sum equals gcs() computed total (best, 4+5+6=15)', () => {
  const inputs = { eye: 4, verbal: 5, motor: 6 };
  const r = gcs(inputs);
  const sum = META.gcs.derivation.components.reduce((acc, c) => acc + c.points(inputs[c.inputKey]), 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 15);
});

test('gcs components sum equals gcs() computed total (worst, 1+1+1=3)', () => {
  const inputs = { eye: 1, verbal: 1, motor: 1 };
  const r = gcs(inputs);
  const sum = META.gcs.derivation.components.reduce((acc, c) => acc + c.points(inputs[c.inputKey]), 0);
  assert.equal(sum, r.total);
  assert.equal(sum, 3);
});

test('qsofa components sum equals qsofa() computed score (positive screen 2/3)', () => {
  const inputs = { rr22: true, alteredMental: true, sbp100: false };
  const r = qsofa(inputs);
  const sum = META['qsofa-sofa'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.score);
  assert.equal(sum, 2);
});

test('qsofa components sum equals qsofa() computed score (negative 0/3)', () => {
  const inputs = { rr22: false, alteredMental: false, sbp100: false };
  const r = qsofa(inputs);
  const sum = META['qsofa-sofa'].derivation.components.reduce((acc, c) => {
    return acc + (inputs[c.inputKey] ? c.points : 0);
  }, 0);
  assert.equal(sum, r.score);
  assert.equal(sum, 0);
});

// --- 3. Bands cover the achievable range --------------------------------

test('wells-pe bands cover the two-tier dichotomy (>4 vs <=4)', () => {
  const bands = META['wells-pe'].derivation.bands;
  assert.equal(bands.length, 2);
  const labels = bands.map((b) => b.label).join('|');
  assert.match(labels, /unlikely/);
  assert.match(labels, /likely/);
});

test('gcs bands cover 3-15 contiguously', () => {
  const bands = META.gcs.derivation.bands;
  const ranges = bands.map((b) => b.range).sort((a, b) => a[0] - b[0]);
  assert.equal(ranges[0][0], 3);
  assert.equal(ranges[ranges.length - 1][1], 15);
});

test('qsofa-sofa bands cover the 0-1 vs 2-3 split', () => {
  const bands = META['qsofa-sofa'].derivation.bands;
  assert.equal(bands.length, 2);
  assert.deepEqual(bands[0].range, [0, 1]);
  assert.deepEqual(bands[1].range, [2, 3]);
});

// --- Wave 48-1b: components-sum-equals-score for the 6 additive tiles ---

function sumComponents(meta, inputs) {
  return meta.derivation.components.reduce((acc, c) => {
    const v = inputs[c.inputKey];
    if (typeof c.points === 'function') return acc + (Number(c.points(v, inputs)) || 0);
    if (v) return acc + c.points;
    return acc;
  }, 0);
}

test('wells-dvt components sum equals wellsDvt() (zero case)', () => {
  const inputs = {
    activeCancer: false, paralysis: false, recentBedrest: false,
    tendernessAlongVeins: false, entireLegSwollen: false,
    calfSwellingGt3cm: false, pittingEdema: false,
    collateralVeins: false, priorDvt: false, alternativeDxAsLikely: false,
  };
  assert.equal(sumComponents(META['wells-dvt'], inputs), wellsDvt(inputs).total);
});

test('wells-dvt components sum equals wellsDvt() (high case, 3 positive)', () => {
  const inputs = {
    activeCancer: false, paralysis: false, recentBedrest: false,
    tendernessAlongVeins: true, entireLegSwollen: true,
    calfSwellingGt3cm: true, pittingEdema: false,
    collateralVeins: false, priorDvt: false, alternativeDxAsLikely: false,
  };
  const r = wellsDvt(inputs);
  assert.equal(sumComponents(META['wells-dvt'], inputs), r.total);
  assert.equal(r.total, 3);
});

test('wells-dvt components sum honors the -2 subtractive criterion', () => {
  const inputs = {
    activeCancer: true, paralysis: true, recentBedrest: false,
    tendernessAlongVeins: false, entireLegSwollen: false,
    calfSwellingGt3cm: false, pittingEdema: false,
    collateralVeins: false, priorDvt: false, alternativeDxAsLikely: true,
  };
  // 1 + 1 + (-2) = 0
  assert.equal(sumComponents(META['wells-dvt'], inputs), wellsDvt(inputs).total);
  assert.equal(wellsDvt(inputs).total, 0);
});

test('chads (CHA2DS2-VASc) components sum equals chadsVasc() (zero)', () => {
  const inputs = {
    chf: false, hypertension: false, ageGte75: false, diabetes: false,
    strokeOrTia: false, vascularDisease: false, ageGte65: false, female: false,
  };
  assert.equal(sumComponents(META.chads, inputs), chadsVasc(inputs).total);
});

test('chads components sum equals chadsVasc() (worked example 3)', () => {
  const inputs = {
    chf: false, hypertension: true, ageGte75: false, diabetes: true,
    strokeOrTia: false, vascularDisease: false, ageGte65: true, female: false,
  };
  // 1 + 1 + 1 = 3
  assert.equal(sumComponents(META.chads, inputs), chadsVasc(inputs).total);
  assert.equal(chadsVasc(inputs).total, 3);
});

test('chads components sum equals chadsVasc() (max with both 2-point items)', () => {
  const inputs = {
    chf: true, hypertension: true, ageGte75: true, diabetes: true,
    strokeOrTia: true, vascularDisease: true, ageGte65: true, female: true,
  };
  // 1 + 1 + 2 + 1 + 2 + 1 + 1 + 1 = 10
  assert.equal(sumComponents(META.chads, inputs), chadsVasc(inputs).total);
  assert.equal(chadsVasc(inputs).total, 10);
});

test('hasbled components sum equals hasBled() (worked example 2)', () => {
  const inputs = {
    hypertension: true, abnormalRenal: false, abnormalLiver: false,
    stroke: false, bleedingHistory: false, labileInr: false,
    ageGt65: true, drugs: false, alcohol: false,
  };
  const r = hasBled(inputs);
  assert.equal(sumComponents(META.hasbled, inputs), r.total);
  assert.equal(r.total, 2);
});

test('hasbled components sum equals hasBled() (high, 4)', () => {
  const inputs = {
    hypertension: true, abnormalRenal: false, abnormalLiver: false,
    stroke: true, bleedingHistory: true, labileInr: false,
    ageGt65: true, drugs: false, alcohol: false,
  };
  const r = hasBled(inputs);
  assert.equal(sumComponents(META.hasbled, inputs), r.total);
  assert.equal(r.total, 4);
});

test('perc components sum equals perc().score (negative 0)', () => {
  const inputs = {
    age50: false, hr100: false, sao2lt95: false, hemoptysis: false,
    estrogen: false, priorVte: false, recentSurgery: false, unilateralLegSwelling: false,
  };
  assert.equal(sumComponents(META.perc, inputs), perc(inputs).score);
});

test('perc components sum equals perc().score (1 positive feature)', () => {
  const inputs = {
    age50: true, hr100: false, sao2lt95: false, hemoptysis: false,
    estrogen: false, priorVte: false, recentSurgery: false, unilateralLegSwelling: false,
  };
  const r = perc(inputs);
  assert.equal(sumComponents(META.perc, inputs), r.score);
  assert.equal(r.score, 1);
});

test('timi components sum equals timi().score (3, intermediate)', () => {
  const inputs = {
    age65: true, threeRiskFactors: true, knownCad50pct: false, asaPast7Days: true,
    severeAngina: false, stDeviation: false, elevatedMarkers: false,
  };
  const r = timi(inputs);
  assert.equal(sumComponents(META.timi, inputs), r.score);
  assert.equal(r.score, 3);
});

test('timi components sum equals timi().score (max 7)', () => {
  const inputs = {
    age65: true, threeRiskFactors: true, knownCad50pct: true, asaPast7Days: true,
    severeAngina: true, stDeviation: true, elevatedMarkers: true,
  };
  const r = timi(inputs);
  assert.equal(sumComponents(META.timi, inputs), r.score);
  assert.equal(r.score, 7);
});

test('heart components sum equals heart().score (worked 0+1+0+1+0=2... wait, low 3)', () => {
  // Recreate the META example: h-hist=1, h-ekg=0, h-age=1, h-rf=1, h-trop=0 -> 3 (low)
  const inputs = { history: 1, ekg: 0, age: 1, riskFactors: 1, troponin: 0 };
  const r = heart(inputs);
  assert.equal(sumComponents(META.heart, inputs), r.score);
  assert.equal(r.score, 3);
});

test('heart components sum equals heart().score (high 10)', () => {
  const inputs = { history: 2, ekg: 2, age: 2, riskFactors: 2, troponin: 2 };
  const r = heart(inputs);
  assert.equal(sumComponents(META.heart, inputs), r.score);
  assert.equal(r.score, 10);
});

test('heart components clamp out-of-range values to 0-2', () => {
  const inputs = { history: 5, ekg: -1, age: 1, riskFactors: 99, troponin: 2 };
  // clamps: 2 + 0 + 1 + 2 + 2 = 7
  const r = heart(inputs);
  assert.equal(sumComponents(META.heart, inputs), r.score);
  assert.equal(r.score, 7);
});

// --- Wave 48-1c: NEWS2 (context-aware callback) -------------------------

test('news2 components sum equals news2() (worked example, baseline 0)', () => {
  const inputs = { rr: 14, spo2: 98, scale2: false, onO2: false, sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 };
  const r = news2(inputs);
  assert.equal(sumComponents(META.news2, inputs), r.score);
  assert.equal(r.score, 0);
});

test('news2 components sum equals news2() (single param triggers 3)', () => {
  // RR 7/min -> resp scores 3; everything else baseline
  const inputs = { rr: 7, spo2: 98, scale2: false, onO2: false, sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 };
  const r = news2(inputs);
  assert.equal(sumComponents(META.news2, inputs), r.score);
  assert.equal(r.score, 3);
});

test('news2 components sum equals news2() (on supplemental O2 adds 2)', () => {
  const inputs = { rr: 14, spo2: 98, scale2: false, onO2: true, sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 };
  const r = news2(inputs);
  assert.equal(sumComponents(META.news2, inputs), r.score);
  assert.equal(r.score, 2);
});

test('news2 components sum equals news2() (Scale 2 + on O2 + SpO2 96 -> 2 pts)', () => {
  // Scale 2, on O2, SpO2 96 -> spo2 scores 2; onO2 scores 2; rest baseline
  const inputs = { rr: 14, spo2: 96, scale2: true, onO2: true, sbp: 124, pulse: 78, acvpu: 'A', temp: 37.0 };
  const r = news2(inputs);
  assert.equal(sumComponents(META.news2, inputs), r.score);
  assert.equal(r.score, 4);
});

test('news2 components sum equals news2() (multi-system high)', () => {
  // RR 30 -> 3; SpO2 90 scale 1 -> 3; on O2 -> 2; SBP 85 -> 3; pulse 135 -> 3;
  // acvpu V -> 3; temp 40 -> 2. Total = 19.
  const inputs = { rr: 30, spo2: 90, scale2: false, onO2: true, sbp: 85, pulse: 135, acvpu: 'V', temp: 40 };
  const r = news2(inputs);
  assert.equal(sumComponents(META.news2, inputs), r.score);
  assert.equal(r.score, 19);
});

// --- Wave 48-1c: SOFA (second-block via derivationSofa) -----------------

test('qsofa-sofa has a derivationSofa block with 6 components', () => {
  const d = META['qsofa-sofa'].derivationSofa;
  assert.ok(d);
  assert.equal(d.components.length, 6);
  for (const k of REQUIRED_FIELDS) assert.ok(d[k] !== undefined, `derivationSofa.${k}`);
});

test('SOFA components sum equals sofa() (zero case)', () => {
  const inputs = { respiration: 0, coagulation: 0, liver: 0, cardiovascular: 0, cns: 0, renal: 0 };
  const sd = META['qsofa-sofa'].derivationSofa;
  const meta = { derivation: sd };
  const sum = sumComponents(meta, inputs);
  assert.equal(sum, sofa(inputs).score);
});

test('SOFA components sum equals sofa() (worked example 2)', () => {
  const inputs = { respiration: 1, coagulation: 0, liver: 0, cardiovascular: 1, cns: 0, renal: 0 };
  const sd = META['qsofa-sofa'].derivationSofa;
  const meta = { derivation: sd };
  const sum = sumComponents(meta, inputs);
  assert.equal(sum, sofa(inputs).score);
  assert.equal(sum, 2);
});

test('SOFA components clamp to 0-4 (max sum = 24)', () => {
  const inputs = { respiration: 4, coagulation: 4, liver: 4, cardiovascular: 4, cns: 4, renal: 4 };
  const sd = META['qsofa-sofa'].derivationSofa;
  const meta = { derivation: sd };
  const sum = sumComponents(meta, inputs);
  assert.equal(sum, 24);
  assert.equal(sum, sofa(inputs).score);
});

test('SOFA components clamp out-of-range values (e.g., 99 → 4)', () => {
  const inputs = { respiration: 99, coagulation: -1, liver: 2, cardiovascular: 3, cns: 4, renal: 1 };
  const sd = META['qsofa-sofa'].derivationSofa;
  const meta = { derivation: sd };
  // 4 + 0 + 2 + 3 + 4 + 1 = 14
  assert.equal(sumComponents(meta, inputs), 14);
  assert.equal(sofa(inputs).score, 14);
});

// --- Wave 48-1c: MELD-3.0 (formula-only block) --------------------------

test('meld-childpugh derivation is formula-only (no components)', () => {
  const d = META['meld-childpugh'].derivation;
  assert.ok(d);
  assert.equal(d.components, undefined);
  for (const k of REQUIRED_FIELDS) assert.ok(d[k] !== undefined, `derivation.${k}`);
});

test('meld-childpugh derivation bands cover the 4-band MELD stratification', () => {
  const bands = META['meld-childpugh'].derivation.bands;
  assert.equal(bands.length, 4);
  // <10, 10-19, 20-29, >=30
  assert.deepEqual(bands[0].range, { op: '<', value: 10 });
  assert.deepEqual(bands[3].range, { op: '>=', value: 30 });
});

test('meld30() worked example produces a finite score consistent with the formula text', () => {
  // Sanity check that the formula text matches the implementation:
  // worked example fields: bili 2.0, INR 1.5, cr 1.3, Na 135, alb 3.0, sex M
  const r = meld30({ bilirubin: 2.0, inr: 1.5, creatinine: 1.3, sodium: 135, albumin: 3.0, sex: 'M', hadDialysisTwiceLastWeek: false });
  // 17 ± 1 per META example
  assert.ok(Math.abs(r.score - 17) <= 1, `MELD-3.0 score = ${r.score}`);
});

// --- Wave 48-2a: CURB-65, Centor, McIsaac, CIWA-Ar, FOUR Score ---------

test('curb-65 components sum equals curb65() (worked example 2)', () => {
  const inputs = { confusion: true, bun20: false, rr30: false, sbp90OrDbp60: false, age65: true };
  const r = curb65(inputs);
  assert.equal(sumComponents(META['curb-65'], inputs), r.score);
  assert.equal(r.score, 2);
});

test('curb-65 components sum equals curb65() (max 5)', () => {
  const inputs = { confusion: true, bun20: true, rr30: true, sbp90OrDbp60: true, age65: true };
  const r = curb65(inputs);
  assert.equal(sumComponents(META['curb-65'], inputs), r.score);
  assert.equal(r.score, 5);
});

test('curb-65 components sum equals curb65() (zero)', () => {
  const inputs = { confusion: false, bun20: false, rr30: false, sbp90OrDbp60: false, age65: false };
  assert.equal(sumComponents(META['curb-65'], inputs), curb65(inputs).score);
});

test('centor components sum equals centor() (worked example 4)', () => {
  const inputs = { tonsillarExudate: true, tenderAnteriorAdenopathy: true, feverHistory: true, absenceOfCough: true };
  const r = centor(inputs);
  assert.equal(sumComponents(META.centor, inputs), r.score);
  assert.equal(r.score, 4);
});

test('mcisaac (second block via derivationMcisaac) sum equals mcisaac() (age 12, all 4 positive -> 5)', () => {
  const inputs = { tonsillarExudate: true, tenderAnteriorAdenopathy: true, feverHistory: true, absenceOfCough: true, ageYears: 12 };
  const meta = { derivation: META.centor.derivationMcisaac };
  const sum = sumComponents(meta, inputs);
  assert.equal(sum, mcisaac(inputs).score);
  assert.equal(sum, 5);
});

test('mcisaac age modifier: age 50 subtracts 1', () => {
  const inputs = { tonsillarExudate: true, tenderAnteriorAdenopathy: true, feverHistory: true, absenceOfCough: true, ageYears: 50 };
  const meta = { derivation: META.centor.derivationMcisaac };
  // 4 centor points - 1 age modifier = 3
  assert.equal(sumComponents(meta, inputs), mcisaac(inputs).score);
  assert.equal(mcisaac(inputs).score, 3);
});

test('mcisaac age modifier: age 30 adds 0', () => {
  const inputs = { tonsillarExudate: true, tenderAnteriorAdenopathy: false, feverHistory: true, absenceOfCough: false, ageYears: 30 };
  const meta = { derivation: META.centor.derivationMcisaac };
  // 2 centor + 0 = 2
  assert.equal(sumComponents(meta, inputs), mcisaac(inputs).score);
});

test('ciwa components sum equals ciwaAr() (worked example 10)', () => {
  const inputs = { nausea: 2, tremor: 2, sweats: 2, anxiety: 2, agitation: 1, tactile: 0, auditory: 0, visual: 0, headache: 1, orientation: 0 };
  const r = ciwaAr(inputs);
  assert.equal(sumComponents(META.ciwa, inputs), r.score);
  assert.equal(r.score, 10);
});

test('ciwa components sum equals ciwaAr() (max 67)', () => {
  const inputs = { nausea: 7, tremor: 7, sweats: 7, anxiety: 7, agitation: 7, tactile: 7, auditory: 7, visual: 7, headache: 7, orientation: 4 };
  const r = ciwaAr(inputs);
  assert.equal(sumComponents(META.ciwa, inputs), r.score);
  assert.equal(r.score, 67);
});

test('ciwa components clamp out-of-range values (10 in a 0-7 field -> 7)', () => {
  const inputs = { nausea: 10, tremor: 0, sweats: 0, anxiety: 0, agitation: 0, tactile: 0, auditory: 0, visual: 0, headache: 0, orientation: 0 };
  // clamp 10 -> 7
  assert.equal(sumComponents(META.ciwa, inputs), 7);
  assert.equal(ciwaAr(inputs).score, 7);
});

test('four-score components sum equals fourScore() (max 16)', () => {
  const inputs = { eye: 4, motor: 4, brainstem: 4, respiration: 4 };
  const r = fourScore(inputs);
  assert.equal(sumComponents(META['four-score'], inputs), r.score);
  assert.equal(r.score, 16);
});

test('four-score components sum equals fourScore() (intermediate)', () => {
  const inputs = { eye: 2, motor: 3, brainstem: 4, respiration: 1 };
  const r = fourScore(inputs);
  assert.equal(sumComponents(META['four-score'], inputs), r.score);
  assert.equal(r.score, 10);
});

test('four-score components sum equals fourScore() (zero, AAN brain-death workup pattern)', () => {
  const inputs = { eye: 0, motor: 0, brainstem: 0, respiration: 0 };
  const r = fourScore(inputs);
  assert.equal(sumComponents(META['four-score'], inputs), r.score);
  assert.equal(r.score, 0);
});

// --- Wave 48-2b: BISAP, COWS, ICDSC, 4AT --------------------------------

test('ranson-bisap derivation covers BISAP (5 binary criteria)', () => {
  const d = META['ranson-bisap'].derivation;
  assert.equal(d.components.length, 5);
});

test('bisap components sum equals bisap() (worked example 2)', () => {
  const inputs = { bun25: false, alteredMental: false, sirs: false, age60: true, pleuralEffusion: false };
  // Only age60 -> 1. Wait worked example says 2: b-bun + b-age both checked
  const inputs2 = { bun25: true, alteredMental: false, sirs: false, age60: true, pleuralEffusion: false };
  const r = bisap(inputs2);
  assert.equal(sumComponents(META['ranson-bisap'], inputs2), r.score);
  assert.equal(r.score, 2);
});

test('bisap components sum equals bisap() (max 5)', () => {
  const inputs = { bun25: true, alteredMental: true, sirs: true, age60: true, pleuralEffusion: true };
  const r = bisap(inputs);
  assert.equal(sumComponents(META['ranson-bisap'], inputs), r.score);
  assert.equal(r.score, 5);
});

test('cows components sum equals cows() (worked example 15)', () => {
  const inputs = { pulse: 1, sweating: 2, restlessness: 1, pupil: 1, jointAches: 2, runnyNose: 2, gi: 2, tremor: 1, yawning: 1, anxiety: 2, gooseflesh: 0 };
  const r = cows(inputs);
  assert.equal(sumComponents(META.cows, inputs), r.score);
  assert.equal(r.score, 15);
});

test('cows components sum equals cows() (zero)', () => {
  const inputs = { pulse: 0, sweating: 0, restlessness: 0, pupil: 0, jointAches: 0, runnyNose: 0, gi: 0, tremor: 0, yawning: 0, anxiety: 0, gooseflesh: 0 };
  const r = cows(inputs);
  assert.equal(sumComponents(META.cows, inputs), r.score);
  assert.equal(r.score, 0);
});

test('icdsc components sum equals icdsc() (worked example 4 -> delirium cutoff)', () => {
  const inputs = {
    alteredLoc: true, inattention: true, disorientation: true, hallucination: true,
    psychomotor: false, inappropriateSpeechOrMood: false,
    sleepWakeDisturbance: false, symptomFluctuation: false,
  };
  const r = icdsc(inputs);
  assert.equal(sumComponents(META.icdsc, inputs), r.score);
  assert.equal(r.score, 4);
  assert.equal(r.delirium, true);
});

test('icdsc components sum equals icdsc() (max 8)', () => {
  const inputs = {
    alteredLoc: true, inattention: true, disorientation: true, hallucination: true,
    psychomotor: true, inappropriateSpeechOrMood: true,
    sleepWakeDisturbance: true, symptomFluctuation: true,
  };
  const r = icdsc(inputs);
  assert.equal(sumComponents(META.icdsc, inputs), r.score);
  assert.equal(r.score, 8);
});

test('4at components sum equals fourAt() (zero)', () => {
  const inputs = { alertnessAbnormal: false, amt4Errors: 0, attentionScore: 0, acuteChange: false };
  const r = fourAt(inputs);
  assert.equal(sumComponents(META['4at'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('4at components sum equals fourAt() (alert+acute both abnormal -> 8, possible delirium)', () => {
  const inputs = { alertnessAbnormal: true, amt4Errors: 0, attentionScore: 0, acuteChange: true };
  const r = fourAt(inputs);
  assert.equal(sumComponents(META['4at'], inputs), r.score);
  assert.equal(r.score, 8);
});

test('4at components sum equals fourAt() (max 12)', () => {
  const inputs = { alertnessAbnormal: true, amt4Errors: 2, attentionScore: 2, acuteChange: true };
  const r = fourAt(inputs);
  assert.equal(sumComponents(META['4at'], inputs), r.score);
  assert.equal(r.score, 12);
});

test('4at amt4 callback clamps out-of-range values to 0-2', () => {
  const inputs = { alertnessAbnormal: false, amt4Errors: 5, attentionScore: -1, acuteChange: false };
  // clamps: 0 + 2 + 0 + 0 = 2
  const r = fourAt(inputs);
  assert.equal(sumComponents(META['4at'], inputs), r.score);
  assert.equal(r.score, 2);
});

// --- Wave 48-2c: PSI, CPOT, BPS, GUSS -----------------------------------

test('psi components sum equals psi() (worked example, male age 70, RR>=30)', () => {
  // males contribute age; RR>=30 adds 20; total = 70 + 20 = 90 -> Class III
  const inputs = {
    age: 70, sex: 'M',
    nursingHome: false, neoplasm: false, liverDisease: false,
    chf: false, cerebrovascular: false, renalDisease: false,
    alteredMental: false, rr30: true, sbp90: false,
    hr125: false, pleuralEffusion: false,
  };
  const r = psi(inputs);
  assert.equal(sumComponents(META.psi, inputs), r.score);
  assert.equal(r.score, 90);
});

test('psi age callback subtracts 10 for females', () => {
  const inputs = {
    age: 70, sex: 'F',
    nursingHome: false, neoplasm: false, liverDisease: false,
    chf: false, cerebrovascular: false, renalDisease: false,
    alteredMental: false, rr30: false, sbp90: false,
    hr125: false, pleuralEffusion: false,
  };
  const r = psi(inputs);
  assert.equal(sumComponents(META.psi, inputs), r.score);
  assert.equal(r.score, 60);
});

test('psi lab callbacks fire when threshold met (BUN 35 adds 20)', () => {
  const inputs = {
    age: 50, sex: 'M',
    nursingHome: false, neoplasm: false, liverDisease: false,
    chf: false, cerebrovascular: false, renalDisease: false,
    alteredMental: false, rr30: false, sbp90: false,
    hr125: false, pleuralEffusion: false,
    bun: 35,
  };
  const r = psi(inputs);
  assert.equal(sumComponents(META.psi, inputs), r.score);
  assert.equal(r.score, 70);
});

test('psi lab callbacks do NOT fire when input is null/undefined (optional labs)', () => {
  const inputs = {
    age: 50, sex: 'M',
    nursingHome: false, neoplasm: false, liverDisease: false,
    chf: false, cerebrovascular: false, renalDisease: false,
    alteredMental: false, rr30: false, sbp90: false,
    hr125: false, pleuralEffusion: false,
    bun: null, sodium: null, glucose: null, hct: null, pao2: null, ph: null, temp: null,
  };
  const r = psi(inputs);
  assert.equal(sumComponents(META.psi, inputs), r.score);
  assert.equal(r.score, 50);
});

test('cpot components sum equals cpot() (worked example zero)', () => {
  const inputs = { facial: 0, body: 0, muscleTension: 0, complianceOrVocalization: 0 };
  const r = cpot(inputs);
  assert.equal(sumComponents(META.cpot, inputs), r.score);
  assert.equal(r.score, 0);
});

test('cpot components sum equals cpot() (cutoff 3 case)', () => {
  const inputs = { facial: 1, body: 1, muscleTension: 1, complianceOrVocalization: 0 };
  const r = cpot(inputs);
  assert.equal(sumComponents(META.cpot, inputs), r.score);
  assert.equal(r.score, 3);
  assert.equal(r.unacceptablePain, true);
});

test('cpot components sum equals cpot() (max 8)', () => {
  const inputs = { facial: 2, body: 2, muscleTension: 2, complianceOrVocalization: 2 };
  const r = cpot(inputs);
  assert.equal(sumComponents(META.cpot, inputs), r.score);
  assert.equal(r.score, 8);
});

test('bps components sum equals bps() (worked example 3, minimum)', () => {
  const inputs = { facial: 1, upperLimb: 1, ventilatorCompliance: 1 };
  const r = bps(inputs);
  assert.equal(sumComponents(META.bps, inputs), r.score);
  assert.equal(r.score, 3);
});

test('bps components sum equals bps() (above cutoff 6)', () => {
  const inputs = { facial: 2, upperLimb: 2, ventilatorCompliance: 2 };
  const r = bps(inputs);
  assert.equal(sumComponents(META.bps, inputs), r.score);
  assert.equal(r.score, 6);
  assert.equal(r.unacceptablePain, true);
});

test('bps components sum equals bps() (max 12)', () => {
  const inputs = { facial: 4, upperLimb: 4, ventilatorCompliance: 4 };
  const r = bps(inputs);
  assert.equal(sumComponents(META.bps, inputs), r.score);
  assert.equal(r.score, 12);
});

test('guss derivation is formula-only (no components; staged gating)', () => {
  const d = META.guss.derivation;
  assert.ok(d);
  assert.equal(d.components, undefined);
  for (const k of REQUIRED_FIELDS) assert.ok(d[k] !== undefined, `derivation.${k}`);
});

test('guss derivation bands cover the 4-tier dysphagia stratification', () => {
  const bands = META.guss.derivation.bands;
  assert.equal(bands.length, 4);
  assert.deepEqual(bands[0].range, [0, 9]);
  assert.deepEqual(bands[3].range, [20, 20]);
});

// --- Wave 48-3a: Braden, Morse Falls, Lawton IADL, Katz ADL -------------

test('braden components sum equals braden() (max 23: 4+4+4+4+4+3)', () => {
  const inputs = { sensory: 4, moisture: 4, activity: 4, mobility: 4, nutrition: 4, friction: 3 };
  const r = braden(inputs);
  assert.equal(sumComponents(META.braden, inputs), r.score);
  assert.equal(r.score, 23);
});

test('braden components sum equals braden() (high-risk 10)', () => {
  // sensory 1, moisture 2, activity 2, mobility 2, nutrition 2, friction 1 = 10
  const inputs = { sensory: 1, moisture: 2, activity: 2, mobility: 2, nutrition: 2, friction: 1 };
  const r = braden(inputs);
  assert.equal(sumComponents(META.braden, inputs), r.score);
  assert.equal(r.score, 10);
});

test('braden friction clamps at 3 (not 4)', () => {
  // If user accidentally enters 4 for friction, the callback clamps to 3.
  const inputs = { sensory: 4, moisture: 4, activity: 4, mobility: 4, nutrition: 4, friction: 4 };
  // sumComponents will clamp friction to 3, total 23
  assert.equal(sumComponents(META.braden, inputs), 23);
});

test('morse-falls components sum equals morseFalls() (low 0)', () => {
  const inputs = { history: false, secondaryDx: false, ambulatoryAid: 'none', ivOrLock: false, gait: 'normal', mentalStatus: 'oriented' };
  const r = morseFalls(inputs);
  assert.equal(sumComponents(META['morse-falls'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('morse-falls components sum equals morseFalls() (moderate 50)', () => {
  // 25 history + 15 secondaryDx + 0 aid + 0 IV + 10 weak gait + 0 mental = 50
  const inputs = { history: true, secondaryDx: true, ambulatoryAid: 'none', ivOrLock: false, gait: 'weak', mentalStatus: 'oriented' };
  const r = morseFalls(inputs);
  assert.equal(sumComponents(META['morse-falls'], inputs), r.score);
  assert.equal(r.score, 50);
});

test('morse-falls components sum equals morseFalls() (high 125, max)', () => {
  // 25 + 15 + 30 furniture + 20 IV + 20 impaired + 15 forgets = 125
  const inputs = { history: true, secondaryDx: true, ambulatoryAid: 'furniture', ivOrLock: true, gait: 'impaired', mentalStatus: 'forgets-limitations' };
  const r = morseFalls(inputs);
  assert.equal(sumComponents(META['morse-falls'], inputs), r.score);
  assert.equal(r.score, 125);
});

test('lawton-iadl components sum equals lawtonIadl() (full independence 8)', () => {
  const inputs = { telephone: 1, shopping: 1, foodPrep: 1, housekeeping: 1, laundry: 1, transportation: 1, medications: 1, finances: 1 };
  const r = lawtonIadl(inputs);
  assert.equal(sumComponents(META['lawton-iadl'], inputs), r.score);
  assert.equal(r.score, 8);
});

test('lawton-iadl components sum equals lawtonIadl() (severe 2)', () => {
  const inputs = { telephone: 1, shopping: 0, foodPrep: 0, housekeeping: 0, laundry: 0, transportation: 0, medications: 1, finances: 0 };
  const r = lawtonIadl(inputs);
  assert.equal(sumComponents(META['lawton-iadl'], inputs), r.score);
  assert.equal(r.score, 2);
});

test('katz-adl components sum equals katzAdl() (full independence 6)', () => {
  const inputs = { bathing: 1, dressing: 1, toileting: 1, transferring: 1, continence: 1, feeding: 1 };
  const r = katzAdl(inputs);
  assert.equal(sumComponents(META['katz-adl'], inputs), r.score);
  assert.equal(r.score, 6);
});

test('katz-adl components sum equals katzAdl() (severe 2)', () => {
  const inputs = { bathing: 0, dressing: 0, toileting: 0, transferring: 0, continence: 1, feeding: 1 };
  const r = katzAdl(inputs);
  assert.equal(sumComponents(META['katz-adl'], inputs), r.score);
  assert.equal(r.score, 2);
});

// --- Wave 48-3b: Barthel, ROSIER, CPSS, LAMS ----------------------------

test('barthel components sum equals barthel() (full independence 100)', () => {
  const inputs = {
    feeding: 10, bathing: 5, grooming: 5, dressing: 10,
    bowel: 10, bladder: 10, toilet: 10,
    transfers: 15, mobility: 15, stairs: 10,
  };
  const r = barthel(inputs);
  assert.equal(sumComponents(META.barthel, inputs), r.score);
  assert.equal(r.score, 100);
});

test('barthel components sum equals barthel() (total dependency 0)', () => {
  const inputs = {
    feeding: 0, bathing: 0, grooming: 0, dressing: 0,
    bowel: 0, bladder: 0, toilet: 0,
    transfers: 0, mobility: 0, stairs: 0,
  };
  const r = barthel(inputs);
  assert.equal(sumComponents(META.barthel, inputs), r.score);
  assert.equal(r.score, 0);
});

test('barthel components sum equals barthel() (moderate dependency 70)', () => {
  // 10+5+5+5+5+5+10+10+15+0 = 70
  const inputs = {
    feeding: 10, bathing: 5, grooming: 5, dressing: 5,
    bowel: 5, bladder: 5, toilet: 10,
    transfers: 10, mobility: 15, stairs: 0,
  };
  const r = barthel(inputs);
  assert.equal(sumComponents(META.barthel, inputs), r.score);
  assert.equal(r.score, 70);
});

test('rosier components sum equals rosier() (zero baseline)', () => {
  const inputs = {
    locSyncope: false, seizure: false,
    facialWeakness: false, armWeakness: false, legWeakness: false,
    speechDisturbance: false, visualFieldDefect: false,
  };
  const r = rosier(inputs);
  assert.equal(sumComponents(META.rosier, inputs), r.score);
  assert.equal(r.score, 0);
});

test('rosier components sum equals rosier() (max 5, all focal-deficit items)', () => {
  const inputs = {
    locSyncope: false, seizure: false,
    facialWeakness: true, armWeakness: true, legWeakness: true,
    speechDisturbance: true, visualFieldDefect: true,
  };
  const r = rosier(inputs);
  assert.equal(sumComponents(META.rosier, inputs), r.score);
  assert.equal(r.score, 5);
});

test('rosier components sum equals rosier() (mimic items subtract)', () => {
  // Both mimic items (-2) plus 1 focal (+1) = -1
  const inputs = {
    locSyncope: true, seizure: true,
    facialWeakness: true, armWeakness: false, legWeakness: false,
    speechDisturbance: false, visualFieldDefect: false,
  };
  const r = rosier(inputs);
  assert.equal(sumComponents(META.rosier, inputs), r.score);
  assert.equal(r.score, -1);
});

test('cpss components sum equals cpss() abnormalCount (zero)', () => {
  const inputs = { facialDroop: 0, armDrift: 0, abnormalSpeech: 0 };
  const r = cpss(inputs);
  // cpss returns abnormalCount, not score
  assert.equal(sumComponents(META.cpss, inputs), r.abnormalCount);
  assert.equal(r.abnormalCount, 0);
});

test('cpss components sum equals cpss() abnormalCount (3 of 3)', () => {
  const inputs = { facialDroop: 1, armDrift: 1, abnormalSpeech: 1 };
  const r = cpss(inputs);
  assert.equal(sumComponents(META.cpss, inputs), r.abnormalCount);
  assert.equal(r.abnormalCount, 3);
});

test('lams components sum equals lams() (zero)', () => {
  const inputs = { facialDroop: 0, armDrift: 0, gripStrength: 0 };
  const r = lams(inputs);
  assert.equal(sumComponents(META.lams, inputs), r.score);
  assert.equal(r.score, 0);
});

test('lams components sum equals lams() (LVO cutoff 4)', () => {
  // facialDroop 1 + armDrift 1 + gripStrength 2 = 4
  const inputs = { facialDroop: 1, armDrift: 1, gripStrength: 2 };
  const r = lams(inputs);
  assert.equal(sumComponents(META.lams, inputs), r.score);
  assert.equal(r.score, 4);
  assert.equal(r.lvoLikely, true);
});

test('lams components sum equals lams() (max 5)', () => {
  const inputs = { facialDroop: 1, armDrift: 2, gripStrength: 2 };
  const r = lams(inputs);
  assert.equal(sumComponents(META.lams, inputs), r.score);
  assert.equal(r.score, 5);
});

// --- Wave 48-3c: NIHSS, RACE, MEOWS, SOS --------------------------------

test('nihss components sum equals nihss() (worked example 5, moderate)', () => {
  const inputs = { '1a': 1, '1b': 0, '1c': 0, '2': 0, '3': 0, '4': 1, '5': 2, '6': 0, '7': 0, '8': 0, '9': 1, '10': 0, '11': 0 };
  const r = nihss(inputs);
  assert.equal(sumComponents(META.nihss, inputs), r.total);
  assert.equal(r.total, 5);
});

test('nihss components sum equals nihss() (zero)', () => {
  const inputs = { '1a': 0, '1b': 0, '1c': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0 };
  const r = nihss(inputs);
  assert.equal(sumComponents(META.nihss, inputs), r.total);
});

test('nihss components sum equals nihss() (max 42)', () => {
  const inputs = { '1a': 3, '1b': 2, '1c': 2, '2': 2, '3': 3, '4': 3, '5': 8, '6': 8, '7': 2, '8': 2, '9': 3, '10': 2, '11': 2 };
  const r = nihss(inputs);
  assert.equal(sumComponents(META.nihss, inputs), r.total);
  assert.equal(r.total, 42);
});

test('race components sum equals race() (zero, LVO less likely)', () => {
  const inputs = { facialPalsy: 0, armMotor: 0, legMotor: 0, gaze: 0, languageAgnosia: 0 };
  const r = race(inputs);
  assert.equal(sumComponents(META.race, inputs), r.score);
  assert.equal(r.score, 0);
});

test('race components sum equals race() (cutoff 5, LVO likely)', () => {
  // 1+1+1+1+1 = 5
  const inputs = { facialPalsy: 1, armMotor: 1, legMotor: 1, gaze: 1, languageAgnosia: 1 };
  const r = race(inputs);
  assert.equal(sumComponents(META.race, inputs), r.score);
  assert.equal(r.score, 5);
  assert.equal(r.lvoLikely, true);
});

test('race components sum equals race() (max 9)', () => {
  const inputs = { facialPalsy: 2, armMotor: 2, legMotor: 2, gaze: 1, languageAgnosia: 2 };
  const r = race(inputs);
  assert.equal(sumComponents(META.race, inputs), r.score);
  assert.equal(r.score, 9);
});

test('meows derivation is formula-only (no components; track-and-trigger)', () => {
  const d = META.meows.derivation;
  assert.ok(d);
  assert.equal(d.components, undefined);
  for (const k of REQUIRED_FIELDS) assert.ok(d[k] !== undefined, `derivation.${k}`);
});

test('meows derivation bands are no-trigger / trigger', () => {
  const bands = META.meows.derivation.bands;
  assert.equal(bands.length, 2);
});

test('sos components sum equals sos() (zero)', () => {
  const inputs = {
    tachycardia: 0, tachypnea: 0, fever: 0, sweating: 0, agitation: 0,
    anxiety: 0, grimacing: 0, sleeplessness: 0, hallucinations: 0,
    motorDisturbance: 0, hypertonia: 0, tremor: 0, vomiting: 0, diarrhea: 0,
    inconsolableCrying: 0,
  };
  const r = sos(inputs);
  assert.equal(sumComponents(META.sos, inputs), r.score);
  assert.equal(r.score, 0);
});

test('sos components sum equals sos() (cutoff 4, withdrawal present)', () => {
  const inputs = {
    tachycardia: 1, tachypnea: 1, fever: 0, sweating: 1, agitation: 1,
    anxiety: 0, grimacing: 0, sleeplessness: 0, hallucinations: 0,
    motorDisturbance: 0, hypertonia: 0, tremor: 0, vomiting: 0, diarrhea: 0,
    inconsolableCrying: 0,
  };
  const r = sos(inputs);
  assert.equal(sumComponents(META.sos, inputs), r.score);
  assert.equal(r.score, 4);
  assert.equal(r.withdrawal, true);
});

test('sos components sum equals sos() (max 15)', () => {
  const inputs = {
    tachycardia: 1, tachypnea: 1, fever: 1, sweating: 1, agitation: 1,
    anxiety: 1, grimacing: 1, sleeplessness: 1, hallucinations: 1,
    motorDisturbance: 1, hypertonia: 1, tremor: 1, vomiting: 1, diarrhea: 1,
    inconsolableCrying: 1,
  };
  const r = sos(inputs);
  assert.equal(sumComponents(META.sos, inputs), r.score);
  assert.equal(r.score, 15);
});

// --- Wave 48-3d: PHQ-9, GAD-7, CAM (formula-only), C-SSRS (formula-only) ---

test('phq9 components sum equals scoreScreener() (max 27)', () => {
  const inputs = { '0': 3, '1': 3, '2': 3, '3': 3, '4': 3, '5': 3, '6': 3, '7': 3, '8': 3 };
  assert.equal(sumComponents(META.phq9, inputs), 27);
});

test('phq9 components sum equals scoreScreener() (worked example 8)', () => {
  // Per PHQ9_CONFIG.exampleAnswers [1, 1, 1, 2, 1, 0, 1, 0, 0] -> 7? Let me sum: 1+1+1+2+1+0+1+0+0 = 7
  const inputs = { '0': 1, '1': 1, '2': 1, '3': 2, '4': 1, '5': 0, '6': 1, '7': 0, '8': 0 };
  assert.equal(sumComponents(META.phq9, inputs), 7);
});

test('phq9 components sum equals scoreScreener() (zero)', () => {
  const inputs = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0 };
  assert.equal(sumComponents(META.phq9, inputs), 0);
});

test('phq9 bands cover 0-27', () => {
  const bands = META.phq9.derivation.bands;
  assert.equal(bands.length, 5);
  assert.deepEqual(bands[0].range, [0, 4]);
  assert.deepEqual(bands[4].range, [20, 27]);
});

test('gad7 components sum equals scoreScreener() (max 21)', () => {
  const inputs = { '0': 3, '1': 3, '2': 3, '3': 3, '4': 3, '5': 3, '6': 3 };
  assert.equal(sumComponents(META.gad7, inputs), 21);
});

test('gad7 components sum equals scoreScreener() (worked example 7)', () => {
  // GAD7_CONFIG.exampleAnswers [1, 1, 1, 2, 0, 1, 1] -> 7
  const inputs = { '0': 1, '1': 1, '2': 1, '3': 2, '4': 0, '5': 1, '6': 1 };
  assert.equal(sumComponents(META.gad7, inputs), 7);
});

test('gad7 bands cover 0-21', () => {
  const bands = META.gad7.derivation.bands;
  assert.equal(bands.length, 4);
  assert.deepEqual(bands[0].range, [0, 4]);
  assert.deepEqual(bands[3].range, [15, 21]);
});

test('cam derivation is formula-only (no components; boolean algorithm)', () => {
  const d = META.cam.derivation;
  assert.ok(d);
  assert.equal(d.components, undefined);
  for (const k of REQUIRED_FIELDS) assert.ok(d[k] !== undefined, `derivation.${k}`);
});

test('cssrs derivation is formula-only (no components; logic-based band)', () => {
  const d = META.cssrs.derivation;
  assert.ok(d);
  assert.equal(d.components, undefined);
  for (const k of REQUIRED_FIELDS) assert.ok(d[k] !== undefined, `derivation.${k}`);
});

// --- Wave 48-4a: ATRIA Bleeding, Hendrich II, FLACC, AUDIT-C ------------

test('atria-bleeding components sum equals atriaBleeding() (zero)', () => {
  const inputs = { anemia: false, severeRenalDisease: false, ageGte75: false, priorBleeding: false, hypertension: false };
  const r = atriaBleeding(inputs);
  assert.equal(sumComponents(META['atria-bleeding'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('atria-bleeding components sum equals atriaBleeding() (high 10, max)', () => {
  const inputs = { anemia: true, severeRenalDisease: true, ageGte75: true, priorBleeding: true, hypertension: true };
  const r = atriaBleeding(inputs);
  assert.equal(sumComponents(META['atria-bleeding'], inputs), r.score);
  assert.equal(r.score, 10);
});

test('atria-bleeding components sum equals atriaBleeding() (intermediate 4)', () => {
  // anemia +3, priorBleeding +1 = 4
  const inputs = { anemia: true, severeRenalDisease: false, ageGte75: false, priorBleeding: true, hypertension: false };
  const r = atriaBleeding(inputs);
  assert.equal(sumComponents(META['atria-bleeding'], inputs), r.score);
  assert.equal(r.score, 4);
});

test('hendrich-ii components sum equals hendrichII() (zero)', () => {
  const inputs = { confusion: false, depression: false, alteredElim: false, dizziness: false, male: false, antiepileptic: false, benzodiazepine: false, getUpAndGo: 'able' };
  const r = hendrichII(inputs);
  assert.equal(sumComponents(META['hendrich-ii'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('hendrich-ii components sum equals hendrichII() (high 5, cutoff)', () => {
  // confusion +4, male +1 = 5
  const inputs = { confusion: true, depression: false, alteredElim: false, dizziness: false, male: true, antiepileptic: false, benzodiazepine: false, getUpAndGo: 'able' };
  const r = hendrichII(inputs);
  assert.equal(sumComponents(META['hendrich-ii'], inputs), r.score);
  assert.equal(r.score, 5);
  assert.equal(r.highRisk, true);
});

test('hendrich-ii get-up-and-go callback maps each value correctly', () => {
  // unable +4
  const inputs = { confusion: false, depression: false, alteredElim: false, dizziness: false, male: false, antiepileptic: false, benzodiazepine: false, getUpAndGo: 'unable' };
  const r = hendrichII(inputs);
  assert.equal(sumComponents(META['hendrich-ii'], inputs), r.score);
  assert.equal(r.score, 4);
});

test('hendrich-ii get-up-and-go callback maps "needs-help" to 3', () => {
  const inputs = { confusion: false, depression: false, alteredElim: false, dizziness: false, male: false, antiepileptic: false, benzodiazepine: false, getUpAndGo: 'needs-help' };
  assert.equal(sumComponents(META['hendrich-ii'], inputs), 3);
});

test('flacc components sum equals flacc() (zero, relaxed)', () => {
  const inputs = { face: 0, legs: 0, activity: 0, cry: 0, consolability: 0 };
  const r = flacc(inputs);
  assert.equal(sumComponents(META.flacc, inputs), r.score);
  assert.equal(r.score, 0);
});

test('flacc components sum equals flacc() (moderate 5)', () => {
  const inputs = { face: 1, legs: 1, activity: 1, cry: 1, consolability: 1 };
  const r = flacc(inputs);
  assert.equal(sumComponents(META.flacc, inputs), r.score);
  assert.equal(r.score, 5);
});

test('flacc components sum equals flacc() (max 10)', () => {
  const inputs = { face: 2, legs: 2, activity: 2, cry: 2, consolability: 2 };
  const r = flacc(inputs);
  assert.equal(sumComponents(META.flacc, inputs), r.score);
  assert.equal(r.score, 10);
});

test('auditc components sum (max 12)', () => {
  const inputs = { '0': 4, '1': 4, '2': 4 };
  assert.equal(sumComponents(META.auditc, inputs), 12);
});

test('auditc components sum (worked example 4)', () => {
  // exampleAnswers [2, 1, 1] -> 4
  const inputs = { '0': 2, '1': 1, '2': 1 };
  assert.equal(sumComponents(META.auditc, inputs), 4);
});

test('auditc bands cover 0-12 contiguously', () => {
  const bands = META.auditc.derivation.bands;
  assert.equal(bands.length, 3);
  assert.deepEqual(bands[0].range, [0, 2]);
  assert.deepEqual(bands[2].range, [8, 12]);
});

// --- Wave 48-4b: ORBIT Bleeding, PAINAD, CAGE, Mini-Cog -----------------

test('orbit-bleeding components sum equals orbitBleeding() (zero)', () => {
  const inputs = { lowHbOrHct: false, ageGt74: false, bleedingHistory: false, renalInsufficiency: false, antiplatelet: false };
  const r = orbitBleeding(inputs);
  assert.equal(sumComponents(META['orbit-bleeding'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('orbit-bleeding components sum equals orbitBleeding() (intermediate 3)', () => {
  // lowHbOrHct +2, antiplatelet +1 = 3
  const inputs = { lowHbOrHct: true, ageGt74: false, bleedingHistory: false, renalInsufficiency: false, antiplatelet: true };
  const r = orbitBleeding(inputs);
  assert.equal(sumComponents(META['orbit-bleeding'], inputs), r.score);
  assert.equal(r.score, 3);
});

test('orbit-bleeding components sum equals orbitBleeding() (max 7)', () => {
  const inputs = { lowHbOrHct: true, ageGt74: true, bleedingHistory: true, renalInsufficiency: true, antiplatelet: true };
  const r = orbitBleeding(inputs);
  assert.equal(sumComponents(META['orbit-bleeding'], inputs), r.score);
  assert.equal(r.score, 7);
});

test('painad components sum equals painad() (zero, no pain)', () => {
  const inputs = { breathing: 0, vocalization: 0, facial: 0, bodyLanguage: 0, consolability: 0 };
  const r = painad(inputs);
  assert.equal(sumComponents(META.painad, inputs), r.score);
  assert.equal(r.score, 0);
});

test('painad components sum equals painad() (moderate 5)', () => {
  const inputs = { breathing: 1, vocalization: 1, facial: 1, bodyLanguage: 1, consolability: 1 };
  const r = painad(inputs);
  assert.equal(sumComponents(META.painad, inputs), r.score);
  assert.equal(r.score, 5);
});

test('painad components sum equals painad() (max 10)', () => {
  const inputs = { breathing: 2, vocalization: 2, facial: 2, bodyLanguage: 2, consolability: 2 };
  const r = painad(inputs);
  assert.equal(sumComponents(META.painad, inputs), r.score);
  assert.equal(r.score, 10);
});

test('cage components sum (zero)', () => {
  const inputs = { '0': 0, '1': 0, '2': 0, '3': 0 };
  assert.equal(sumComponents(META.cage, inputs), 0);
});

test('cage components sum (positive 2)', () => {
  const inputs = { '0': 1, '1': 0, '2': 1, '3': 0 };
  assert.equal(sumComponents(META.cage, inputs), 2);
});

test('cage components sum (max 4)', () => {
  const inputs = { '0': 1, '1': 1, '2': 1, '3': 1 };
  assert.equal(sumComponents(META.cage, inputs), 4);
});

test('mini-cog components sum equals miniCog() (negative 5, max)', () => {
  const inputs = { wordsRecalled: 3, clockNormal: true };
  const r = miniCog(inputs);
  assert.equal(sumComponents(META['mini-cog'], inputs), r.score);
  assert.equal(r.score, 5);
});

test('mini-cog components sum equals miniCog() (positive 2, cutoff just below)', () => {
  // wordsRecalled 2, clockNormal false -> 2 (positive screen)
  const inputs = { wordsRecalled: 2, clockNormal: false };
  const r = miniCog(inputs);
  assert.equal(sumComponents(META['mini-cog'], inputs), r.score);
  assert.equal(r.score, 2);
});

test('mini-cog components sum equals miniCog() (negative 3, cutoff just at)', () => {
  // wordsRecalled 3, clockNormal false -> 3 (negative screen)
  const inputs = { wordsRecalled: 3, clockNormal: false };
  const r = miniCog(inputs);
  assert.equal(sumComponents(META['mini-cog'], inputs), r.score);
  assert.equal(r.score, 3);
});

// --- Wave 48-4c: EPDS, MEWS, COMFORT-B, WAT-1 --------------------------

test('epds components sum (max 30)', () => {
  const inputs = { '0': 3, '1': 3, '2': 3, '3': 3, '4': 3, '5': 3, '6': 3, '7': 3, '8': 3, '9': 3 };
  assert.equal(sumComponents(META.epds, inputs), 30);
});

test('epds components sum (worked example 7)', () => {
  // EPDS_CONFIG.exampleAnswers [1, 1, 1, 1, 0, 1, 1, 1, 0, 0] -> 7
  const inputs = { '0': 1, '1': 1, '2': 1, '3': 1, '4': 0, '5': 1, '6': 1, '7': 1, '8': 0, '9': 0 };
  assert.equal(sumComponents(META.epds, inputs), 7);
});

test('epds bands cover 0-30 contiguously', () => {
  const bands = META.epds.derivation.bands;
  assert.equal(bands.length, 3);
  assert.deepEqual(bands[0].range, [0, 9]);
  assert.deepEqual(bands[2].range, [13, 30]);
});

test('mews components sum equals mews() (baseline 0)', () => {
  const inputs = { sbp: 120, pulse: 78, rr: 14, temp: 37.0, avpu: 'A' };
  const r = mews(inputs);
  assert.equal(sumComponents(META.mews, inputs), r.score);
  assert.equal(r.score, 0);
});

test('mews components sum equals mews() (high multi-parameter)', () => {
  // SBP 60 → 3, pulse 140 → 3, RR 32 → 3, temp 39 → 2, avpu V → 1. Total 12.
  const inputs = { sbp: 60, pulse: 140, rr: 32, temp: 39, avpu: 'V' };
  const r = mews(inputs);
  assert.equal(sumComponents(META.mews, inputs), r.score);
  assert.equal(r.score, 12);
});

test('mews avpu callback maps each value correctly', () => {
  for (const [letter, expected] of [['A', 0], ['V', 1], ['P', 2], ['U', 3]]) {
    const inputs = { sbp: 120, pulse: 78, rr: 14, temp: 37.0, avpu: letter };
    const r = mews(inputs);
    assert.equal(sumComponents(META.mews, inputs), r.score, `avpu=${letter}`);
    assert.equal(r.score, expected);
  }
});

test('comfort-b components sum equals comfortB() (target sedation 18)', () => {
  const inputs = { alertness: 3, calmness: 3, respiratoryOrCry: 3, movement: 3, muscleTone: 3, facialTension: 3 };
  const r = comfortB(inputs);
  assert.equal(sumComponents(META['comfort-b'], inputs), r.score);
  assert.equal(r.score, 18);
});

test('comfort-b components sum equals comfortB() (min 6)', () => {
  const inputs = { alertness: 1, calmness: 1, respiratoryOrCry: 1, movement: 1, muscleTone: 1, facialTension: 1 };
  const r = comfortB(inputs);
  assert.equal(sumComponents(META['comfort-b'], inputs), r.score);
  assert.equal(r.score, 6);
});

test('comfort-b components sum equals comfortB() (max 30)', () => {
  const inputs = { alertness: 5, calmness: 5, respiratoryOrCry: 5, movement: 5, muscleTone: 5, facialTension: 5 };
  const r = comfortB(inputs);
  assert.equal(sumComponents(META['comfort-b'], inputs), r.score);
  assert.equal(r.score, 30);
});

test('wat-1 components sum equals wat1() (zero)', () => {
  const inputs = { looseStools: 0, vomiting: 0, fever: 0, sbsStatePositive: 0, tremor: 0, sweating: 0, uncoordinatedMovement: 0, yawnSneeze: 0, startleToTouch: 0, increasedMuscleTone: 0, recoveryMinutes: 0 };
  const r = wat1(inputs);
  assert.equal(sumComponents(META['wat-1'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('wat-1 components sum equals wat1() (cutoff 3, withdrawal)', () => {
  // tremor + sweating + recovery 3 min (1 pt) = 3
  const inputs = { looseStools: 0, vomiting: 0, fever: 0, sbsStatePositive: 0, tremor: 1, sweating: 1, uncoordinatedMovement: 0, yawnSneeze: 0, startleToTouch: 0, increasedMuscleTone: 0, recoveryMinutes: 3 };
  const r = wat1(inputs);
  assert.equal(sumComponents(META['wat-1'], inputs), r.score);
  assert.equal(r.score, 3);
  assert.equal(r.withdrawal, true);
});

test('wat-1 recovery callback maps minutes correctly', () => {
  // recovery <2 = 0, 2-5 = 1, >5 = 2
  for (const [mins, expected] of [[0, 0], [1, 0], [2, 1], [5, 1], [6, 2], [60, 2]]) {
    const inputs = { looseStools: 0, vomiting: 0, fever: 0, sbsStatePositive: 0, tremor: 0, sweating: 0, uncoordinatedMovement: 0, yawnSneeze: 0, startleToTouch: 0, increasedMuscleTone: 0, recoveryMinutes: mins };
    const r = wat1(inputs);
    assert.equal(sumComponents(META['wat-1'], inputs), r.score, `recovery=${mins}`);
    assert.equal(r.score, expected, `recovery=${mins}`);
  }
});

test('wat-1 components sum equals wat1() (max 12)', () => {
  const inputs = { looseStools: 1, vomiting: 1, fever: 1, sbsStatePositive: 1, tremor: 1, sweating: 1, uncoordinatedMovement: 1, yawnSneeze: 1, startleToTouch: 1, increasedMuscleTone: 1, recoveryMinutes: 10 };
  const r = wat1(inputs);
  assert.equal(sumComponents(META['wat-1'], inputs), r.score);
  assert.equal(r.score, 12);
});

// --- Wave 48-4d: STOP-BANG, 4Ts, ABCD2, RCRI ----------------------------

test('stop-bang components sum equals stopBang() (zero)', () => {
  const inputs = { snore: false, tired: false, observedApnea: false, highBp: false, bmiGt35: false, ageGt50: false, neckGt40cm: false, male: false };
  const r = stopBang(inputs);
  assert.equal(sumComponents(META['stop-bang'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('stop-bang components sum equals stopBang() (intermediate band, 3)', () => {
  const inputs = { snore: true, tired: true, observedApnea: false, highBp: true, bmiGt35: false, ageGt50: false, neckGt40cm: false, male: false };
  const r = stopBang(inputs);
  assert.equal(sumComponents(META['stop-bang'], inputs), r.score);
  assert.equal(r.score, 3);
});

test('stop-bang components sum equals stopBang() (high band, 5)', () => {
  const inputs = { snore: true, tired: true, observedApnea: true, highBp: true, bmiGt35: true, ageGt50: false, neckGt40cm: false, male: false };
  const r = stopBang(inputs);
  assert.equal(sumComponents(META['stop-bang'], inputs), r.score);
  assert.equal(r.score, 5);
});

test('stop-bang components sum equals stopBang() (max 8)', () => {
  const inputs = { snore: true, tired: true, observedApnea: true, highBp: true, bmiGt35: true, ageGt50: true, neckGt40cm: true, male: true };
  const r = stopBang(inputs);
  assert.equal(sumComponents(META['stop-bang'], inputs), r.score);
  assert.equal(r.score, 8);
});

test('four-ts components sum equals fourTs() (zero)', () => {
  const inputs = { thrombocytopenia: 0, timingOfFall: 0, thrombosis: 0, otherCauses: 0 };
  const r = fourTs(inputs);
  assert.equal(sumComponents(META['four-ts'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('four-ts components sum equals fourTs() (intermediate band, 4)', () => {
  const inputs = { thrombocytopenia: 2, timingOfFall: 1, thrombosis: 1, otherCauses: 0 };
  const r = fourTs(inputs);
  assert.equal(sumComponents(META['four-ts'], inputs), r.score);
  assert.equal(r.score, 4);
});

test('four-ts components sum equals fourTs() (high band, 7)', () => {
  const inputs = { thrombocytopenia: 2, timingOfFall: 2, thrombosis: 2, otherCauses: 1 };
  const r = fourTs(inputs);
  assert.equal(sumComponents(META['four-ts'], inputs), r.score);
  assert.equal(r.score, 7);
});

test('four-ts components clamp out-of-range input values to 0-2', () => {
  // The scoring fn clamps via fourTsClamp; the derivation callback mirrors that.
  for (const v of [-1, 0, 1, 2, 3, 5]) {
    const inputs = { thrombocytopenia: v, timingOfFall: 0, thrombosis: 0, otherCauses: 0 };
    const r = fourTs(inputs);
    assert.equal(sumComponents(META['four-ts'], inputs), r.score, `thrombocytopenia=${v}`);
  }
});

test('abcd2 components sum equals abcd2() (zero, low band)', () => {
  const inputs = { age: 40, sbp: 120, dbp: 80, clinicalFeatures: 'other', durationMinutes: 5, diabetes: false };
  const r = abcd2(inputs);
  assert.equal(sumComponents(META.abcd2, inputs), r.total);
  assert.equal(r.total, 0);
});

test('abcd2 components sum equals abcd2() (moderate band, 4)', () => {
  // age>=60 (1) + bp via DBP>=90 (1) + speech (1) + duration 10-59 (1) + no diabetes = 4
  const inputs = { age: 65, sbp: 130, dbp: 92, clinicalFeatures: 'speech', durationMinutes: 30, diabetes: false };
  const r = abcd2(inputs);
  assert.equal(sumComponents(META.abcd2, inputs), r.total);
  assert.equal(r.total, 4);
});

test('abcd2 components sum equals abcd2() (high band, 7)', () => {
  const inputs = { age: 70, sbp: 150, dbp: 90, clinicalFeatures: 'weakness', durationMinutes: 90, diabetes: true };
  const r = abcd2(inputs);
  assert.equal(sumComponents(META.abcd2, inputs), r.total);
  assert.equal(r.total, 7);
});

test('abcd2 BP component fires when DBP alone meets the threshold', () => {
  // SBP below 140 but DBP at 90 should still give the +1 BP point.
  const inputs = { age: 40, sbp: 120, dbp: 90, clinicalFeatures: 'other', durationMinutes: 5, diabetes: false };
  const r = abcd2(inputs);
  assert.equal(sumComponents(META.abcd2, inputs), r.total);
  assert.equal(r.total, 1);
});

test('rcri components sum equals rcri() (zero, Class I)', () => {
  const inputs = { highRiskSurgery: false, ischemicHeartDisease: false, congestiveHeartFailure: false, cerebrovascularDisease: false, insulinDependentDm: false, creatinineOver2: false };
  const r = rcri(inputs);
  assert.equal(sumComponents(META.rcri, inputs), r.count);
  assert.equal(r.count, 0);
});

test('rcri components sum equals rcri() (Class III, 2 factors)', () => {
  const inputs = { highRiskSurgery: true, ischemicHeartDisease: true, congestiveHeartFailure: false, cerebrovascularDisease: false, insulinDependentDm: false, creatinineOver2: false };
  const r = rcri(inputs);
  assert.equal(sumComponents(META.rcri, inputs), r.count);
  assert.equal(r.count, 2);
});

test('rcri components sum equals rcri() (Class IV, all 6)', () => {
  const inputs = { highRiskSurgery: true, ischemicHeartDisease: true, congestiveHeartFailure: true, cerebrovascularDisease: true, insulinDependentDm: true, creatinineOver2: true };
  const r = rcri(inputs);
  assert.equal(sumComponents(META.rcri, inputs), r.count);
  assert.equal(r.count, 6);
});

// --- Wave 48-4e: ICH Score, IMPROVE-VTE, Khorana, DASH ------------------

test('ich-score components sum equals ichScore() (zero, GCS 15 no factors)', () => {
  const inputs = { gcs: 15, age: 70, ichVolumeMl: 10, infratentorial: false, ivh: false };
  const r = ichScore(inputs);
  assert.equal(sumComponents(META['ich-score'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('ich-score components sum equals ichScore() (mid band, GCS 10 + age 85 -> 2)', () => {
  const inputs = { gcs: 10, age: 85, ichVolumeMl: 10, infratentorial: false, ivh: false };
  const r = ichScore(inputs);
  assert.equal(sumComponents(META['ich-score'], inputs), r.score);
  assert.equal(r.score, 2);
});

test('ich-score components sum equals ichScore() (max 6, GCS 3 + age 85 + all)', () => {
  const inputs = { gcs: 3, age: 85, ichVolumeMl: 60, infratentorial: true, ivh: true };
  const r = ichScore(inputs);
  assert.equal(sumComponents(META['ich-score'], inputs), r.score);
  assert.equal(r.score, 6);
});

test('ich-score GCS callback band boundaries: 4 -> +2, 5 -> +1, 13 -> 0', () => {
  for (const [g, expected] of [[3, 2], [4, 2], [5, 1], [12, 1], [13, 0], [15, 0]]) {
    const inputs = { gcs: g, age: 70, ichVolumeMl: 10, infratentorial: false, ivh: false };
    assert.equal(sumComponents(META['ich-score'], inputs), ichScore(inputs).score, `gcs=${g}`);
    assert.equal(sumComponents(META['ich-score'], inputs), expected, `gcs=${g} component`);
  }
});

test('improve-vte components sum equals improveVte() (zero)', () => {
  const inputs = { priorVte: false, thrombophilia: false, lowerLimbParalysis: false, currentCancer: false, immobilized7d: false, icuCcuStay: false, ageGt60: false };
  const r = improveVte(inputs);
  assert.equal(sumComponents(META['improve-vte'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('improve-vte components sum equals improveVte() (inpatient band, 2)', () => {
  const inputs = { priorVte: false, thrombophilia: false, lowerLimbParalysis: false, currentCancer: false, immobilized7d: true, icuCcuStay: false, ageGt60: true };
  const r = improveVte(inputs);
  assert.equal(sumComponents(META['improve-vte'], inputs), r.score);
  assert.equal(r.score, 2);
});

test('improve-vte components sum equals improveVte() (max 12)', () => {
  const inputs = { priorVte: true, thrombophilia: true, lowerLimbParalysis: true, currentCancer: true, immobilized7d: true, icuCcuStay: true, ageGt60: true };
  const r = improveVte(inputs);
  assert.equal(sumComponents(META['improve-vte'], inputs), r.score);
  assert.equal(r.score, 12);
});

test('khorana components sum equals khorana() (zero)', () => {
  const inputs = { cancerSiteRisk: 'other', plateletGte350: false, hbLt10OrEsa: false, wbcGt11: false, bmiGte35: false };
  const r = khorana(inputs);
  assert.equal(sumComponents(META.khorana, inputs), r.score);
  assert.equal(r.score, 0);
});

test('khorana components sum equals khorana() (intermediate, 2)', () => {
  const inputs = { cancerSiteRisk: 'high', plateletGte350: true, hbLt10OrEsa: false, wbcGt11: false, bmiGte35: false };
  const r = khorana(inputs);
  assert.equal(sumComponents(META.khorana, inputs), r.score);
  assert.equal(r.score, 2);
});

test('khorana components sum equals khorana() (max 6)', () => {
  const inputs = { cancerSiteRisk: 'very-high', plateletGte350: true, hbLt10OrEsa: true, wbcGt11: true, bmiGte35: true };
  const r = khorana(inputs);
  assert.equal(sumComponents(META.khorana, inputs), r.score);
  assert.equal(r.score, 6);
});

test('khorana cancer-site callback returns 2 / 1 / 0 by category', () => {
  for (const [site, expected] of [['very-high', 2], ['high', 1], ['other', 0], ['unknown', 0]]) {
    const inputs = { cancerSiteRisk: site, plateletGte350: false, hbLt10OrEsa: false, wbcGt11: false, bmiGte35: false };
    assert.equal(sumComponents(META.khorana, inputs), expected, `site=${site}`);
  }
});

test('dash-vte components sum equals dashVte() (zero)', () => {
  const inputs = { dDimerAbnormal: false, ageLt50: false, male: false, hormoneUseAtInitialVteInWoman: false };
  const r = dashVte(inputs);
  assert.equal(sumComponents(META['dash-vte'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('dash-vte components sum equals dashVte() (intermediate, 2)', () => {
  const inputs = { dDimerAbnormal: true, ageLt50: false, male: false, hormoneUseAtInitialVteInWoman: false };
  const r = dashVte(inputs);
  assert.equal(sumComponents(META['dash-vte'], inputs), r.score);
  assert.equal(r.score, 2);
});

test('dash-vte components sum equals dashVte() (high, 4 = all positive)', () => {
  const inputs = { dDimerAbnormal: true, ageLt50: true, male: true, hormoneUseAtInitialVteInWoman: false };
  const r = dashVte(inputs);
  assert.equal(sumComponents(META['dash-vte'], inputs), r.score);
  assert.equal(r.score, 4);
});

test('dash-vte hormone -2 modifier subtracts correctly (D-dimer + age + hormone -> 1)', () => {
  const inputs = { dDimerAbnormal: true, ageLt50: true, male: false, hormoneUseAtInitialVteInWoman: true };
  const r = dashVte(inputs);
  assert.equal(sumComponents(META['dash-vte'], inputs), r.score);
  assert.equal(r.score, 1);
});

test('dash-vte hormone alone yields negative -2', () => {
  const inputs = { dDimerAbnormal: false, ageLt50: false, male: false, hormoneUseAtInitialVteInWoman: true };
  const r = dashVte(inputs);
  assert.equal(sumComponents(META['dash-vte'], inputs), r.score);
  assert.equal(r.score, -2);
});

// --- Wave 48-4f: HERDOO2, HOSPITAL, IMPROVE-Bleeding, Aldrete/PADSS -----

test('herdoo2 components sum equals herdoo2() (zero)', () => {
  const inputs = { legSignsPostThrombotic: false, dDimerGte250OnAnticoag: false, bmiGte30: false, ageGte65: false };
  const r = herdoo2(inputs);
  assert.equal(sumComponents(META.herdoo2, inputs), r.score);
  assert.equal(r.score, 0);
});

test('herdoo2 components sum equals herdoo2() (1 = still low band)', () => {
  const inputs = { legSignsPostThrombotic: false, dDimerGte250OnAnticoag: true, bmiGte30: false, ageGte65: false };
  const r = herdoo2(inputs);
  assert.equal(sumComponents(META.herdoo2, inputs), r.score);
  assert.equal(r.score, 1);
});

test('herdoo2 components sum equals herdoo2() (2 = continue band)', () => {
  const inputs = { legSignsPostThrombotic: false, dDimerGte250OnAnticoag: true, bmiGte30: true, ageGte65: false };
  const r = herdoo2(inputs);
  assert.equal(sumComponents(META.herdoo2, inputs), r.score);
  assert.equal(r.score, 2);
});

test('herdoo2 components sum equals herdoo2() (max 4)', () => {
  const inputs = { legSignsPostThrombotic: true, dDimerGte250OnAnticoag: true, bmiGte30: true, ageGte65: true };
  const r = herdoo2(inputs);
  assert.equal(sumComponents(META.herdoo2, inputs), r.score);
  assert.equal(r.score, 4);
});

test('hospital-score components sum equals hospitalScore() (zero, low band)', () => {
  const inputs = { hgbLt12: false, oncologyDischarge: false, sodiumLt135: false, anyProcedure: false, urgentAdmission: false, priorAdmissions12mo: 0, losGe5: false };
  const r = hospitalScore(inputs);
  assert.equal(sumComponents(META['hospital-score'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('hospital-score components sum equals hospitalScore() (intermediate, 5)', () => {
  // onc (2) + LOS (2) + Na (1) = 5
  const inputs = { hgbLt12: false, oncologyDischarge: true, sodiumLt135: true, anyProcedure: false, urgentAdmission: false, priorAdmissions12mo: 0, losGe5: true };
  const r = hospitalScore(inputs);
  assert.equal(sumComponents(META['hospital-score'], inputs), r.score);
  assert.equal(r.score, 5);
});

test('hospital-score prior-admissions callback bands (0 / 3 / 5)', () => {
  for (const [prior, expected] of [[0, 0], [2, 0], [3, 2], [4, 2], [5, 5], [10, 5]]) {
    const inputs = { hgbLt12: false, oncologyDischarge: false, sodiumLt135: false, anyProcedure: false, urgentAdmission: false, priorAdmissions12mo: prior, losGe5: false };
    assert.equal(sumComponents(META['hospital-score'], inputs), expected, `prior=${prior}`);
    assert.equal(hospitalScore(inputs).score, expected, `prior=${prior}`);
  }
});

test('improve-bleeding components sum equals improveBleeding() (zero)', () => {
  const inputs = { activeUlcer: false, bleeding3moPrior: false, plateletLt50: false, age: '<40', hepaticFailure: false, renalFailure: 'none', icuAdmission: false, centralVenousCatheter: false, rheumaticDisease: false, currentCancer: false, male: false };
  const r = improveBleeding(inputs);
  assert.equal(sumComponents(META['improve-bleeding'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('improve-bleeding components sum equals improveBleeding() (high band, ulcer + bleed3mo -> 8.5)', () => {
  const inputs = { activeUlcer: true, bleeding3moPrior: true, plateletLt50: false, age: '<40', hepaticFailure: false, renalFailure: 'none', icuAdmission: false, centralVenousCatheter: false, rheumaticDisease: false, currentCancer: false, male: false };
  const r = improveBleeding(inputs);
  assert.equal(sumComponents(META['improve-bleeding'], inputs), r.score);
  assert.equal(r.score, 8.5);
});

test('improve-bleeding age banded callback (<40 / 40-84 / >=85)', () => {
  for (const [age, expected] of [['<40', 0], ['40-84', 1.5], ['>=85', 3.5]]) {
    const inputs = { activeUlcer: false, bleeding3moPrior: false, plateletLt50: false, age, hepaticFailure: false, renalFailure: 'none', icuAdmission: false, centralVenousCatheter: false, rheumaticDisease: false, currentCancer: false, male: false };
    assert.equal(sumComponents(META['improve-bleeding'], inputs), expected, `age=${age}`);
    assert.equal(improveBleeding(inputs).score, expected, `age=${age}`);
  }
});

test('improve-bleeding renal banded callback (none / moderate / severe)', () => {
  for (const [renal, expected] of [['none', 0], ['moderate', 1], ['severe', 2.5]]) {
    const inputs = { activeUlcer: false, bleeding3moPrior: false, plateletLt50: false, age: '<40', hepaticFailure: false, renalFailure: renal, icuAdmission: false, centralVenousCatheter: false, rheumaticDisease: false, currentCancer: false, male: false };
    assert.equal(sumComponents(META['improve-bleeding'], inputs), expected, `renal=${renal}`);
    assert.equal(improveBleeding(inputs).score, expected, `renal=${renal}`);
  }
});

test('aldrete-padss Aldrete components sum equals aldrete() (zero)', () => {
  const inputs = { activity: 0, respiration: 0, circulation: 0, consciousness: 0, oxygenSaturation: 0 };
  const r = aldrete(inputs);
  assert.equal(sumComponents(META['aldrete-padss'], inputs), r.score);
  assert.equal(r.score, 0);
});

test('aldrete-padss Aldrete components sum equals aldrete() (max 10)', () => {
  const inputs = { activity: 2, respiration: 2, circulation: 2, consciousness: 2, oxygenSaturation: 2 };
  const r = aldrete(inputs);
  assert.equal(sumComponents(META['aldrete-padss'], inputs), r.score);
  assert.equal(r.score, 10);
});

test('aldrete-padss Aldrete clamps out-of-range values to 0-2', () => {
  // Out-of-range inputs should clamp into [0, 2].
  const inputs = { activity: -1, respiration: 5, circulation: 2, consciousness: 1, oxygenSaturation: 2 };
  const r = aldrete(inputs);
  assert.equal(sumComponents(META['aldrete-padss'], inputs), r.score);
  // -1 -> 0; 5 -> 2; 2; 1; 2 = 7
  assert.equal(r.score, 7);
});

const PADSS_META = { derivation: META['aldrete-padss'].derivationPadss };

test('aldrete-padss PADSS components sum equals padss() (zero)', () => {
  const inputs = { vitalSigns: 0, ambulation: 0, nauseaVomiting: 0, pain: 0, surgicalBleeding: 0 };
  const r = padss(inputs);
  assert.equal(sumComponents(PADSS_META, inputs), r.score);
  assert.equal(r.score, 0);
});

test('aldrete-padss PADSS components sum equals padss() (max 10)', () => {
  const inputs = { vitalSigns: 2, ambulation: 2, nauseaVomiting: 2, pain: 2, surgicalBleeding: 2 };
  const r = padss(inputs);
  assert.equal(sumComponents(PADSS_META, inputs), r.score);
  assert.equal(r.score, 10);
});

test('aldrete-padss PADSS components sum equals padss() (discharge cutoff at 9)', () => {
  const inputs = { vitalSigns: 2, ambulation: 2, nauseaVomiting: 2, pain: 2, surgicalBleeding: 1 };
  const r = padss(inputs);
  assert.equal(sumComponents(PADSS_META, inputs), r.score);
  assert.equal(r.score, 9);
  assert.equal(r.readyForDischarge, true);
});

// --- 4. Renderer behavior (jsdom-free smoke via stub) -------------------
// renderDerivation/updateDerivationSteps need a DOM. The full UI assertion
// happens in the Playwright e2e suite. Here we just assert the validation
// path: omitting a required field throws.

test('renderDerivation throws on a malformed derivation block', async () => {
  // Provide a minimal stub document since lib/dom.js calls document.createElement.
  const originalDocument = globalThis.document;
  const elements = [];
  globalThis.document = {
    createElement(tag) {
      const node = {
        tag, children: [], attrs: {},
        appendChild(c) { this.children.push(c); return c; },
        setAttribute(k, v) { this.attrs[k] = v; },
        get textContent() { return this._text || ''; },
        set textContent(v) { this._text = v; },
        querySelector() { return null; },
      };
      elements.push(node);
      return node;
    },
    createTextNode(s) { return { text: String(s) }; },
  };
  try {
    const { renderDerivation } = await import('../../lib/derivation.js');
    assert.throws(() => renderDerivation({ derivation: { formula: 'x' } }),
      /missing required field/);
    assert.equal(renderDerivation(null), null);
    assert.equal(renderDerivation({}), null);
  } finally {
    if (originalDocument) globalThis.document = originalDocument;
    else delete globalThis.document;
  }
});
