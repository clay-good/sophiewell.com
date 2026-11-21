// spec-v1768: hemoglobin's floor in lib/bounds.js names a recorded survival (1.4 g/dL, PMID 24117834), so it is 1 g/dL,
// and hematocrit's is 3%. Each tool below answered half that floor (Hb 0.5 g/dL, Hct 1.5%); it now refuses it, and a
// value just above the floor (Hb 1.5 g/dL, Hct 4%) still answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dlcoCorrection } from '../../lib/specialtymath-v186.js';
import { binetCll, raiCll } from '../../lib/heme-staging-v188.js';
import { crusade } from '../../lib/acs-v193.js';
import { shuntFraction } from '../../lib/hemo-v194.js';
import { durieSalmon } from '../../lib/heme-prognostic-v216.js';
import { epvs } from '../../lib/nephrology-v226.js';
import { denverEdTof } from '../../lib/mixed-v227.js';
import { reticIndex } from '../../lib/clinical-v6.js';
import { apache2 } from '../../lib/scoring-v6.js';
import { transfusionThreshold } from '../../lib/transfusion-v292.js';
import { acef } from '../../lib/acef-v595.js';

const HB = /plausible range for hemoglobin \(1 to 26 g\/dL\)/i;
const HCT = /plausible range for hematocrit \(3 to 90 %\)/i;

// [tool, call(value), floor message]: each call returns a result object, or throws for a throwing lib.
const CASES = [
  ['dlco-correction', (hb) => dlcoCorrection({ dlco: 20, hb, va: 5, sex: 'male' }), HB, 0.5, 1.5],
  ['binet-cll', (hb) => binetCll({ areas: 2, hb, platelets: 150 }), HB, 0.5, 1.5],
  ['rai-cll', (hb) => raiCll({ lymphocytosis: true, hb, platelets: 150 }), HB, 0.5, 1.5],
  ['crusade', (hct) => crusade({ hct, crcl: 60, hr: 80, sbp: 130, sex: 'male' }), HCT, 1.5, 4],
  ['shunt-fraction', (hb) => shuntFraction({ hb, pAO2: 110, sao2: 99, pao2: 95, svo2: 75, pvo2: 40 }), HB, 0.5, 1.5],
  ['durie-salmon', (hemoglobin) => durieSalmon({ hemoglobin, calcium: 10, boneLesions: 1, creatinine: 1, mProtein: '0' }), HB, 0.5, 1.5],
  ['epvs (hematocrit)', (hematocrit) => epvs({ hematocrit, hemoglobin: 12 }), HCT, 1.5, 4],
  ['epvs (hemoglobin)', (hemoglobin) => epvs({ hematocrit: 36, hemoglobin }), HB, 0.5, 1.5],
  ['denver-ed-tof', (hematocrit) => denverEdTof({ hematocrit }), HCT, 1.5, 4],
  ['retic-index', (hct) => reticIndex({ reticPct: 2, hct }), /between 3 and 90/, 1.5, 4],
  ['apache2', (hct) => apache2({ temp: 37, map: 90, hr: 80, rr: 16, oxy: 90, ph: 7.4, na: 140, k: 4, creatinine: 1, hct, wbc: 8, gcs: 15, age: 30 }), /between 3 and 90/, 1.5, 4],
  ['transfusion-threshold', (hemoglobin) => transfusionThreshold({ hemoglobin, population: 'stable-adult' }), HB, 0.5, 1.5],
  ['acef', (hematocrit) => acef({ age: 70, ejectionFraction: 50, creatinine: 1, hematocrit, emergency: false }), HCT, 1.5, 4],
];

function outcome(call, v) {
  try {
    const r = call(v);
    return r && r.valid === false ? { refused: true, message: r.message } : { refused: false, r };
  } catch (err) {
    return { refused: true, message: err.message };
  }
}

for (const [tool, call, re, below, above] of CASES) {
  test(`${tool}: half the floor (${below}) is refused`, () => {
    const o = outcome(call, below);
    assert.equal(o.refused, true);
    assert.match(o.message, re);
  });
  test(`${tool}: ${above}, just above the floor, still answers`, () => {
    const o = outcome(call, above);
    assert.equal(o.refused, false, o.message);
  });
}

test('ebv-mabl: a starting hematocrit below the floor is refused with the range, not by the order check', async () => {
  const { ebvMabl } = await import('../../lib/clinical-v7.js');
  assert.throws(() => ebvMabl({ weightKg: 70, ebvFactor: 70, startHct: 1.5, minHct: 21 }), /plausible range for hematocrit/);
  assert.ok(ebvMabl({ weightKg: 70, ebvFactor: 70, startHct: 40, minHct: 21 }));
});
