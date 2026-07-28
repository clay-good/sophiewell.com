// spec-v583: the National Amyloidosis Centre (NAC / Gillmore) staging system for transthyretin cardiac
// amyloidosis, in both its original three-stage form and the 2024 four-stage expansion. A
// REVISED-SUCCESSOR GAP with nothing of either version in the catalog: `grep -ci transthyretin app.js`
// returned 0.
//
// **STAGE 4 IS NOT A TAIL OF STAGE 3 -- IT CUTS ACROSS.** This is the load-bearing fact and it is
// counter-intuitive. Stage 4 is NT-proBNP at or above 10,000 ng/L IRRESPECTIVE OF eGFR, so a patient with
// NT-proBNP 12,000 and a perfectly good eGFR of 60 is original stage 2 and expanded stage 4. The paper
// counts it: of the 180 stage 4 patients, 65 came from original stage 2 and 115 from original stage 3.
// Treating stage 4 as "stage 3 plus" silently loses the 65.
//
// **THE PUBLISHED DEFINITION OF STAGE 2 IS AN OR AND LITERALLY OVERLAPS STAGE 3.** The paper's own wording
// is "stage 2: NT-proBNP >3000 ng/L OR eGFR <45 ml/min; stage 3: NT-proBNP >3000 ng/L AND eGFR <45 ml/min",
// so every stage 3 patient also satisfies the stage 2 sentence. The intended reading, and the one every
// implementation uses, is that stage 2 is the RESIDUAL -- one criterion but not both -- with stage 3 taking
// precedence. This lib applies that reading and says so rather than pretending the published wording is
// unambiguous.
//
// **STAGE 2 THEREFORE LUMPS TOGETHER TWO OPPOSITE PATIENTS**: a cardiac-dominant one (NT-proBNP over 3000
// with preserved renal function) and a renal-dominant one (eGFR under 45 with NT-proBNP at or under 3000).
// The stage is identical; the clinical picture is not. The result names which of the two it is.
//
// **THE 10,000 CUT-POINT IS ROUNDED AND ITS SENSITIVITY IS ABOUT 54 PERCENT.** The Youden-optimal value was
// 10,461 ng/L (sensitivity 53.5 percent, specificity 76.4 percent); 10,000 was adopted as a round number
// with sensitivity 54.1 percent and specificity 75.6 percent. It was derived ONLY within stage 3 patients.
// So nearly half the patients who die early are NOT flagged by stage 4, and a stage below 4 is not
// reassurance.
//
// **THE PAPER DOES NOT STATE WHICH eGFR EQUATION WAS USED.** Neither CKD-EPI nor MDRD appears in the text.
// This matters because the two equations routinely disagree by several ml/min around the 45 threshold, which
// is exactly where the stage boundary sits. That is the source's own hole; it is reported, not patched.
//
// **MEDIAN SURVIVAL WAS NOT REACHED FOR STAGES 1 AND 2** within the paper's 36-month follow-up. Only stage 3
// (33.5 months) and stage 4 (22.5 months) reached a median. Quoting a median for stages 1 and 2 from this
// paper would be inventing one, so this lib returns none.
//
// NT-proBNP: ng/L and pg/mL are numerically identical, so no conversion is applied or needed.
//
// HIGH-STAKES: this is a prognostic stage at a group level for patients who ALREADY have a diagnosis of
// transthyretin cardiac amyloidosis. It does NOT diagnose amyloidosis, does not distinguish transthyretin
// from light-chain amyloidosis -- which is a different disease with a different and more urgent treatment --
// and does not distinguish wild-type from variant ATTR, which requires TTR sequencing and has implications
// for relatives. It does not select or withhold tafamidis or any other therapy, and a high stage is not a
// reason to withhold treatment (spec-v11 section 5.3).
//
// DEFINITIONS AND FIGURES RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97): the stage definitions
// were extracted verbatim from the expansion paper's methods, and the operators and the stage 4 threshold
// re-checked against an independent report because the PDF loses the >= and <= glyphs.
//   - Gillmore JD, Damy T, Fontana M, et al. A new staging system for cardiac transthyretin amyloidosis.
//     Eur Heart J. 2018;39(30):2799-2806.
//   - Nitsche C, Patel RK, Hong Y, et al. Expansion of the National Amyloidosis Centre staging system to
//     detect early mortality in transthyretin cardiac amyloidosis. Eur J Heart Fail. 2024;26(9):2008-2016.

export const NTPROBNP_THRESHOLD = 3000;        // ng/L (= pg/mL)
export const EGFR_THRESHOLD = 45;              // ml/min
export const STAGE4_THRESHOLD = 10000;         // ng/L, at or above, irrespective of eGFR
export const YOUDEN_OPTIMAL = 10461;           // ng/L, the unrounded cut-point

// One-year mortality from the expansion cohort (n = 2042).
export const ONE_YEAR_MORTALITY = { 1: 2.3, 2: 8.8, 3: 10.4, 4: 30.6 };
// Median survival at 36 months. Stages 1 and 2 did not reach a median; null is deliberate.
export const MEDIAN_SURVIVAL_MONTHS = { 1: null, 2: null, 3: 33.5, 4: 22.5 };

export const EGFR_EQUATION_NOTE = 'The paper does NOT state which eGFR equation was used. CKD-EPI and MDRD routinely disagree by several ml/min around 45, which is exactly where this boundary sits, so a borderline eGFR can move the stage depending on a choice the source never made. This is the source’s own gap, reported rather than filled.';
export const CUTPOINT_NOTE = `The ${STAGE4_THRESHOLD} ng/L cut-point is a rounded one: the Youden-optimal value was ${YOUDEN_OPTIMAL} ng/L (sensitivity 53.5 percent, specificity 76.4 percent), and ${STAGE4_THRESHOLD} was adopted with sensitivity 54.1 percent and specificity 75.6 percent. It was derived only within stage 3 patients. Sensitivity near 54 percent means nearly half the patients who die early are NOT flagged, so a stage below 4 is not reassurance.`;
export const OVERLAP_NOTE = 'The paper’s own wording defines stage 2 with an OR ("NT-proBNP >3000 ng/L or eGFR <45 ml/min"), which every stage 3 patient also satisfies. The intended and universally applied reading is that stage 2 is the RESIDUAL - one criterion but not both - with stage 3 taking precedence. That reading is applied here.';

const NOTE = `The National Amyloidosis Centre staging system for transthyretin cardiac amyloidosis (Gillmore and colleagues 2018; expanded by Nitsche and colleagues 2024) stratifies patients who already have a diagnosis of ATTR cardiac amyloidosis using two biomarkers. Original three stages: stage 1 is NT-proBNP at or below ${NTPROBNP_THRESHOLD} ng/L and eGFR at or above ${EGFR_THRESHOLD} ml/min; stage 3 is NT-proBNP above ${NTPROBNP_THRESHOLD} and eGFR below ${EGFR_THRESHOLD}; stage 2 is the remainder. The 2024 expansion adds stage 4, NT-proBNP at or above ${STAGE4_THRESHOLD} ng/L irrespective of eGFR. Stage 4 is not a tail of stage 3, it cuts across: of the 180 stage 4 patients, 65 came from original stage 2 and 115 from original stage 3, so a patient with NT-proBNP 12000 and an eGFR of 60 is original stage 2 and expanded stage 4, and treating stage 4 as stage 3 plus silently loses the 65. The published definition of stage 2 is an OR that literally overlaps stage 3, and the intended reading, applied here, is that stage 2 is the residual with stage 3 taking precedence. Stage 2 therefore lumps together two opposite patients, one cardiac-dominant and one renal-dominant, and the result names which. The 10000 cut-point is rounded from a Youden-optimal 10461 ng/L and has a sensitivity near 54 percent, derived only within stage 3 patients, so a stage below 4 is not reassurance. The paper does not state which eGFR equation was used, and CKD-EPI and MDRD disagree around 45. One-year mortality was 2.3, 8.8, 10.4 and 30.6 percent for stages 1 to 4. Median survival at 36 months was reached only for stage 3 at 33.5 months and stage 4 at 22.5 months; stages 1 and 2 did not reach a median and none is quoted here. NT-proBNP in ng/L and pg/mL are numerically identical. This is a prognostic stage at a group level. It does not diagnose amyloidosis, does not distinguish transthyretin from light-chain amyloidosis, which is a different disease with a different and more urgent treatment, and does not distinguish wild-type from variant ATTR, which requires TTR sequencing and has implications for relatives. It does not select or withhold tafamidis or any other therapy, and a high stage is not a reason to withhold treatment.`;

function readNum(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a number that is 0 or more.`);
  return n;
}

// input: ntProBnp (ng/L, equivalently pg/mL), egfr (ml/min).
export function nacAttrStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let bnp, egfr;
  try {
    bnp = readNum(o.ntProBnp, 'NT-proBNP');
    egfr = readNum(o.egfr, 'eGFR');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (bnp === null || egfr === null) {
    return { valid: false, message: 'Enter both NT-proBNP (ng/L, equivalently pg/mL) and eGFR (ml/min). Both are required by every version of the staging system.' };
  }

  const bnpHigh = bnp > NTPROBNP_THRESHOLD;
  const egfrLow = egfr < EGFR_THRESHOLD;

  // Original three-stage system. Stage 2 is the residual, per OVERLAP_NOTE.
  let originalStage;
  if (bnpHigh && egfrLow) originalStage = 3;
  else if (bnpHigh || egfrLow) originalStage = 2;
  else originalStage = 1;

  // The expansion. Stage 4 overrides irrespective of eGFR.
  const stage4 = bnp >= STAGE4_THRESHOLD;
  const expandedStage = stage4 ? 4 : originalStage;
  const reclassified = stage4 && originalStage !== 3;

  const stage2Kind = originalStage === 2 ? (bnpHigh ? 'cardiac-dominant' : 'renal-dominant') : null;

  const parts = [];
  parts.push(`NAC stage ${expandedStage} by the 2024 four-stage system; stage ${originalStage} by the original three-stage system.`);
  if (stage4) {
    parts.push(reclassified
      ? `STAGE 4 IS NOT A TAIL OF STAGE 3 - IT CUTS ACROSS. This patient is original stage ${originalStage} and expanded stage 4, because stage 4 is NT-proBNP at or above ${STAGE4_THRESHOLD} ng/L IRRESPECTIVE OF eGFR. The paper counts 65 of its 180 stage 4 patients as coming from original stage 2, and treating stage 4 as "stage 3 plus" would lose them.`
      : 'This patient is stage 4 by the expansion and was already stage 3 by the original system. Stage 4 still cuts across rather than extending stage 3: 65 of the paper’s 180 stage 4 patients came from original stage 2.');
  }
  if (stage2Kind) {
    parts.push(stage2Kind === 'cardiac-dominant'
      ? `Stage 2 here is CARDIAC-dominant: NT-proBNP above ${NTPROBNP_THRESHOLD} with preserved renal function. The opposite patient - eGFR below ${EGFR_THRESHOLD} with NT-proBNP at or below ${NTPROBNP_THRESHOLD} - carries the same stage 2 label and a different clinical picture.`
      : `Stage 2 here is RENAL-dominant: eGFR below ${EGFR_THRESHOLD} with NT-proBNP at or below ${NTPROBNP_THRESHOLD}. The opposite patient - NT-proBNP above ${NTPROBNP_THRESHOLD} with preserved renal function - carries the same stage 2 label and a different clinical picture.`);
  }
  const mortality = ONE_YEAR_MORTALITY[expandedStage];
  const median = MEDIAN_SURVIVAL_MONTHS[expandedStage];
  parts.push(`One-year mortality in the expansion cohort was ${mortality} percent for stage ${expandedStage}.`);
  parts.push(median === null
    ? `Median survival is NOT reported for stage ${expandedStage}: within the paper’s 36-month follow-up, a median was reached only for stage 3 (33.5 months) and stage 4 (22.5 months). Quoting one here would be inventing it.`
    : `Median survival was ${median} months at 36 months of follow-up.`);
  parts.push(OVERLAP_NOTE);
  parts.push(CUTPOINT_NOTE);
  parts.push(EGFR_EQUATION_NOTE);
  parts.push('This stages a patient who already has a diagnosis of ATTR cardiac amyloidosis. It does not diagnose amyloidosis, does not separate transthyretin from light-chain disease, and does not select or withhold therapy.');

  return {
    valid: true,
    expandedStage,
    originalStage,
    stage4,
    reclassifiedByExpansion: reclassified,
    stage2Kind,
    ntProBnpAboveThreshold: bnpHigh,
    egfrBelowThreshold: egfrLow,
    oneYearMortalityPercent: mortality,
    medianSurvivalMonths: median,
    band: `NAC stage ${expandedStage}`,
    bandLabel: `NAC stage ${expandedStage} (original stage ${originalStage})`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
