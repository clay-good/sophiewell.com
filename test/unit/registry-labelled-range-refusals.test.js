// spec-v1236: the long tail of the dead-end refusal, driven from the field
// registry.
//
// Twenty-five library files, each with its own copy of a reader that returns one
// `null` for a blank field, a non-number AND a value outside its own bounds --
// and a caller that reads `null` as absent. So a reader who typed a plasma
// creatinine of 250 mg/dL was told to *enter* it, retyped it, and got the same
// sentence.
//
// spec-v1226 and spec-v1227 did the files that build a `missing` list. These do
// not: each tests its reads with `if (a === null || b === null) return { valid:
// false, message: '<one sentence naming them all>' }`, and that sentence is
// worth keeping -- so `gradeFault` goes BEFORE it, skipping a blank, and only
// the out-of-range value is called out.
//
// THE LABELS COME FROM THE FIELD REGISTRY each tile already publishes to agents
// (`mcp/fields.js`), read PER CALCULATOR. That scoping is the point: a first
// pass merged every calculator's fields into one arg->label map and gave
// `bronchodilator-response` the label "Pre-transfusion platelet count
// (x10^9/L)" for its `pre`, because `percent-platelet-recovery` also has a
// `pre`. An arg name is unique inside one calculator and means nothing across
// the catalog.
//
// The bounds are the callers' own, and reading them wrong is the other half of
// the same care: six of these files test `n < 0` (zero is legitimate -- a count
// of 0 lytic bone lesions, 0 failed antiarrhythmic drugs) where the rest test
// `n <= 0`. Taking the first for the second refused a real answer, and three
// existing tests caught it.
import test from 'node:test';
import assert from 'node:assert/strict';

import { renalFailureIndex, feua, bronchodilatorResponse } from '../../lib/renalpulm-v249.js';
import { nlr, plr } from '../../lib/hematology-v229.js';
import { piv, car } from '../../lib/inflam-v230.js';
import { kingScore, bavenoVii } from '../../lib/hep-fibrosis-portal-v212.js';
import { percentPlateletRecovery } from '../../lib/hemederm-v245.js';
import { caapAf } from '../../lib/cardiology-risk-v214.js';
import { durieSalmon } from '../../lib/heme-prognostic-v216.js';
import { sitsSich } from '../../lib/stroke-risk-v217.js';
import { ggtPlatelet } from '../../lib/metabolic-hepatic-v219.js';
import { measuredCrcl } from '../../lib/renal-v277.js';

const CHECK = /must be .* Check the value entered\.$/;

test('the refusal names the value and its range, not the field as missing', () => {
  assert.match(renalFailureIndex({ urineNa: 20, plasmaCr: 250, urineCr: 60 }).message,
    /^Plasma creatinine \(mg\/dL\) must be between 0.1 and 30/);
  assert.match(feua({ urineUA: 300, serumCr: 250, serumUA: 6, urineCr: 60 }).message, /^Serum creatinine \(mg\/dL\) must be/);
  assert.match(nlr({ anc: 200000, alc: 1.5 }).message, /^Absolute neutrophil count .* must be/);
  assert.match(piv({ anc: 8, plt: 20000, amc: 0.5, alc: 1.5 }).message, /^Platelet count .* must be/);
  assert.match(kingScore({ age: 50, ast: 80, inr: 1.2, platelets: 20000 }).message, /^Platelet count .* must be/);
  assert.match(sitsSich({ nihss: 10, glucose: 20000, sbp: 150, weight: 70, age: 70 }).message, /^Blood glucose \(mg\/dL\) must be/);
  assert.match(measuredCrcl({ urineCr: 100, urineVolume: 1440, serumCr: 250, hours: 24 }).message, CHECK);
  assert.match(ggtPlatelet({ ggt: 80, ggtUln: 50, platelets: 20000 }).message, CHECK);
});

test('a blank field is still asked for, in the tile\'s own words', () => {
  assert.match(renalFailureIndex({ urineNa: 20, urineCr: 60 }).message, /^Enter urine sodium/);
  assert.match(nlr({ alc: 1.5 }).message, /^Enter absolute neutrophil count/);
  assert.match(piv({ anc: 8, amc: 0.5, alc: 1.5 }).message, /^Enter absolute neutrophil, platelet/);
  assert.match(bavenoVii({ lsm: 20 }).message, /^Enter/);
});

test('and each tile still answers at a real reading', () => {
  assert.equal(renalFailureIndex({ urineNa: 20, plasmaCr: 2, urineCr: 60 }).score, 0.67);
  assert.equal(nlr({ anc: 8, alc: 1.5 }).valid, true);
  assert.equal(plr({ plt: 250, alc: 1.5 }).valid, true);
  assert.equal(piv({ anc: 8, plt: 250, amc: 0.5, alc: 1.5 }).valid, true);
  assert.equal(car({ crp: 12, albumin: 3.2 }).valid, true);
  assert.equal(bronchodilatorResponse({ pre: 2.0, post: 2.4, predicted: 3.0 }).valid, true);
  assert.equal(percentPlateletRecovery({ pre: 20, post: 45, bloodVolume: 5, transfused: 3 }).valid, true);
});

// The bounds are the callers' own, and six of these files allow zero. A count of
// 0 lytic bone lesions and 0 failed antiarrhythmic drugs are answers, not errors.
test('zero is still an answer where the caller allowed it', () => {
  assert.equal(caapAf({ laDiameter: 3.5, age: 45, failedAad: 0 }).score, 0);
  assert.equal(durieSalmon({ hemoglobin: 12, calcium: 9, boneLesions: 0, mProtein: '0', creatinine: 1.0 }).stage, 'IA');
  // ...and the range is still enforced at the other end.
  assert.match(caapAf({ laDiameter: 35, age: 45, failedAad: 0 }).message, /^Left-atrial diameter \(cm\) must be between 0 and 20/);
  assert.match(durieSalmon({ hemoglobin: 250, calcium: 9, boneLesions: 0, mProtein: '0', creatinine: 1.0 }).message, /^Hemoglobin \(g\/dL\) must be/);
});

// The per-calculator scoping, pinned: two tiles both have an arg called `pre`,
// and each refusal must name its OWN quantity.
test('two tiles that share an arg name each name their own quantity', () => {
  assert.match(bronchodilatorResponse({ pre: 2.0, post: 100, predicted: 3.0 }).message, /^Post-bronchodilator FEV1 or FVC \(L\) must be/);
  assert.match(percentPlateletRecovery({ pre: 20, post: 2000000, bloodVolume: 5, transfused: 3 }).message,
    /^Post-transfusion platelet count .* must be/);
});
