// spec-v1234: the last of `probe-envelope-unbounded`'s first section.
//
// The probe's first section asks one question of the whole catalog: does a tile
// answer from a value an order of magnitude past a ceiling `lib/bounds.js`
// already declares? It opened at **116 fields across 68 calculators** and this
// wave takes the last eighteen tiles. **It now reads zero.**
//
// These eighteen are the long tail -- one or two fields each, in a file of their
// own -- and three of them are worth remembering:
//
//   corrected-phenytoin  The albumin is the DENOMINATOR of the correction, so an
//                        impossible one does not produce an impossible level, it
//                        produces a small PLAUSIBLE one: an albumin of 70 g/dL
//                        divided a measured 15 ug/mL down to 1.06 and the tile
//                        read "below the 10-20 ug/mL therapeutic range", which
//                        reads as an instruction to give more.
//
//   snappe-ii            The pH item bands at >= 7.20 / 7.10 / below, open at the
//                        top, so a pH of 80 scored the 0-point band -- the
//                        reassuring end of a neonatal illness-severity score.
//
//   phoenix-sepsis       Its `pos(o.lactate, 0, 60)` already returned null for a
//                        lactate of 400, and null there means "not measured", so
//                        the impossible value was being DISCARDED in silence and
//                        the other organ systems scored as though it had never
//                        been drawn (spec-v1217's shape). The check has to read
//                        the RAW input to see it at all.
//
// Each check runs after its tile's own missing-value branch and skips a blank,
// so nothing here narrows what a tile will answer from.
import test from 'node:test';
import assert from 'node:assert/strict';

import { correctedPhenytoin } from '../../lib/clinical-v7.js';
import { snappeII } from '../../lib/peds-v140.js';
import { phoenixSepsis } from '../../lib/peds-sepsis-v278.js';
import { deadSpace } from '../../lib/hemodynamics-v87.js';
import { ckdEpiCystatin } from '../../lib/nephro-v92.js';
import { hlh2004 } from '../../lib/hlh-2004-v582.js';
import { arcHbr } from '../../lib/arc-hbr-v594.js';
import { acef } from '../../lib/acef-v595.js';
import { walterIndex } from '../../lib/walter-index-v669.js';
import { mcmahonRhabdo } from '../../lib/mcmahon-rhabdo-v677.js';
import { kobayashiKawasaki } from '../../lib/kobayashi-kawasaki-v680.js';
import { sanoKawasaki } from '../../lib/sano-kawasaki-v681.js';
import { effectiveOsmolality } from '../../lib/effective-osmolality-v683.js';
import { fractionalExcretionPotassium } from '../../lib/fractional-excretion-potassium-v684.js';
import { hysLaw } from '../../lib/hys-law-v908.js';
import { udcaResponse } from '../../lib/udca-response-v909.js';
import { pcdai } from '../../lib/pcdai-v522.js';
import { nsofa } from '../../lib/nsofa-v526.js';

test('corrected-phenytoin refuses the albumin it was dividing by', () => {
  assert.throws(() => correctedPhenytoin({ measured: 15, albumin: 70, esrd: false }), /albumin must be between 0.5 and 7/);
  assert.equal(correctedPhenytoin({ measured: 15, albumin: 2.0, esrd: false }).corrected, 30);
});

test('snappe-ii refuses the pH that scored its 0-point band', () => {
  const S = { ph: 7.05, bp: 30, temp: 36, pao2: 60, fio2: 40, urine: 1, bw: 1200, apgar: 6 };
  assert.match(snappeII({ ...S, ph: 80 }).band, /arterial pH/);
  assert.equal(snappeII({ ...S, ph: 80 }).score, null);
  assert.notEqual(snappeII(S).score, null);
});

test('phoenix-sepsis sees the impossible lactate its own reader was discarding', () => {
  const P = { ageMonths: 24, ratio: 200, lactate: 6, platelets: 80, inr: 1.4 };
  assert.match(phoenixSepsis({ ...P, lactate: 400 }).message, /serum lactate/);
  assert.match(phoenixSepsis({ ...P, platelets: 20000 }).message, /platelet count/);
  assert.equal(phoenixSepsis(P).valid, true);
  assert.match(phoenixSepsis({}).message, /^Enter the patient age/);
});

test('the other fifteen refuse their own impossible value and still answer at a real one', () => {
  assert.match(deadSpace({ paco2: 2000, expiredCo2: 20 }).band, /arterial PaCO2/);
  assert.equal(deadSpace({ paco2: 60, expiredCo2: 20 }).valid, true);

  const C = { cystatinC: 1.5, creatinine: 1.4, age: 65, sex: 'male' };
  assert.match(ckdEpiCystatin({ ...C, creatinine: 250 }).band, /serum creatinine/);
  assert.equal(ckdEpiCystatin(C).valid, true);

  const A = { sex: 'male', age: 70, hemoglobin: 14, egfr: 50, platelets: 250,
    priorBleeding: 'none', priorStroke: 'none',
    longTermOac: 'no', bleedingDiathesis: 'no', cirrhosisPortalHypertension: 'no',
    activeMalignancy12Months: 'no', spontaneousIchEver: 'no', traumaticIch12Months: 'no',
    brainAvm: 'no', nondeferrableSurgeryOnDapt: 'no', majorSurgeryOrTrauma30Days: 'no',
    longTermNsaidsOrSteroids: 'no' };
  assert.match(arcHbr({ ...A, hemoglobin: 250 }).message, /plausible range for hemoglobin/);
  assert.match(arcHbr({ ...A, platelets: 20000 }).message, /platelet count/);

  const E = { age: 70, ejectionFraction: 50, creatinine: 2.5, hematocrit: 38, emergency: 'no' };
  assert.match(acef({ ...E, creatinine: 250 }).message, /serum creatinine/);
  assert.equal(acef(E).valid, true);

  const W = { sex: 'male', adl: 'none', cancer: 'none', creatinine: 3.5, albumin: 3.2 };
  assert.match(walterIndex({ ...W, creatinine: 250 }).message, /serum creatinine/);
  assert.match(walterIndex({ ...W, albumin: 70 }).message, /serum albumin/);
  assert.equal(walterIndex(W).valid, true);

  const M = { age: 50, sex: 'male', creatinine: 2.5, calcium: 8, cpk: 5000, phosphate: 4, bicarbonate: 18, cause: 'other' };
  assert.match(mcmahonRhabdo({ ...M, creatinine: 250 }).message, /serum creatinine/);
  assert.match(mcmahonRhabdo({ ...M, bicarbonate: 600 }).message, /serum bicarbonate/);
  assert.equal(mcmahonRhabdo(M).valid, true);

  const K = { sodium: 131, illnessDay: 4, ast: 100, neutrophil: 80, crp: 8, ageMonths: 12, platelets: 350 };
  assert.match(kobayashiKawasaki({ ...K, sodium: 2000 }).message, /serum sodium/);
  assert.match(kobayashiKawasaki({ ...K, platelets: 20000 }).message, /platelet count/);
  assert.equal(kobayashiKawasaki(K).valid, true);

  assert.match(sanoKawasaki({ ast: 100, bilirubin: 600, crp: 8 }).message, /total bilirubin/);
  assert.equal(sanoKawasaki({ ast: 100, bilirubin: 0.5, crp: 8 }).valid, true);

  assert.match(effectiveOsmolality({ sodium: 140, glucose: 20000 }).message, /serum glucose/);
  assert.equal(effectiveOsmolality({ sodium: 140, glucose: 900 }).valid, true);

  const F = { urineK: 40, plasmaK: 4, urineCr: 60, plasmaCr: 1.0 };
  assert.match(fractionalExcretionPotassium({ ...F, plasmaK: 100 }).message, /serum potassium/);
  assert.match(fractionalExcretionPotassium({ ...F, plasmaCr: 250 }).message, /serum creatinine/);
  // The urine end is another compartment and is left alone (spec-v1233).
  assert.equal(fractionalExcretionPotassium(F).valid, true);

  const H = { alt: 300, altUln: 40, bilirubin: 3.5, bilirubinUln: 1.2, alp: 100, alpUln: 120 };
  assert.match(hysLaw({ ...H, bilirubin: 600 }).message, /total bilirubin/);
  assert.match(hysLaw({ ...H, bilirubinUln: 600 }).message, /total bilirubin/);
  assert.notEqual(hysLaw(H).valid, false);

  const U = { alp: 150, alpUln: 120, baselineAlp: 300, ast: 40, astUln: 40, bilirubin: 0.8, monthsOnUdca: 12 };
  assert.match(udcaResponse({ ...U, bilirubin: 600 }).message, /total bilirubin/);
  assert.equal(udcaResponse(U).valid, true);

  const HL = { molecularDiagnosis: 'no', fever: 'yes', splenomegaly: 'yes', hemophagocytosis: 'yes',
    nkCellActivity: 'yes', noEvidenceOfMalignancy: 'yes', hemoglobin: 8, platelets: 50, neutrophils: 0.8,
    triglycerides: 300, fibrinogen: 120, ferritin: 800, scd25Status: 'resulted', scd25: 3000 };
  assert.match(hlh2004({ ...HL, hemoglobin: 250 }).message, /plausible range for hemoglobin/);
  assert.match(hlh2004({ ...HL, platelets: 20000 }).message, /platelet count/);
});

test('pcdai and nsofa refuse theirs too', () => {
  const P = { pain: 0, stools: 0, wellbeing: 0, weight: 0, height: 0, abdomen: 0,
    perirectal: 0, eim: 0, hctBand: 'child', hct: 38, esr: 20, albumin: 3.2 };
  assert.match(pcdai({ ...P, albumin: 70 }).message, /serum albumin/);
  assert.equal(pcdai(P).valid, true);
  assert.match(nsofa({ intubated: 'yes', steroids: 'no', inotropes: 1, platelets: 20000 }).message, /platelet count/);
  assert.equal(nsofa({ intubated: 'no', steroids: 'no', inotropes: 1, platelets: 20 }).valid, true);
});
