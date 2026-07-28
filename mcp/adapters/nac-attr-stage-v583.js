// spec-v583 MCP wave: adapter for the NAC / Gillmore ATTR cardiac amyloidosis stage in
// lib/nac-attr-stage-v583.js. The dom keys mirror the browser renderer (views/group-v583.js) and
// META['nac-attr-stage'].example.
//
// **STAGE 4 IS NOT A TAIL OF STAGE 3 - IT CUTS ACROSS.** The single most important fact here. Stage 4 is
// NT-proBNP at or above 10,000 ng/L IRRESPECTIVE OF eGFR, so a patient with NT-proBNP 12,000 and a perfectly
// good eGFR of 60 is original stage 2 and expanded stage 4. The paper counts it: of its 180 stage 4
// patients, 65 came from original stage 2 and 115 from original stage 3. Any consumer that models stage 4 as
// "stage 3 plus a higher NT-proBNP" silently loses the 65.
//
// **THE PUBLISHED DEFINITION OF STAGE 2 IS AN OR AND LITERALLY OVERLAPS STAGE 3.** The paper's own wording
// is "stage 2: NT-proBNP >3000 ng/L OR eGFR <45 ml/min; stage 3: NT-proBNP >3000 ng/L AND eGFR <45 ml/min",
// which every stage 3 patient also satisfies. The intended and universally applied reading is that stage 2
// is the RESIDUAL - one criterion but not both, with stage 3 taking precedence. That reading is applied and
// stated rather than the published wording being presented as unambiguous.
//
// **STAGE 2 LUMPS TOGETHER TWO OPPOSITE PATIENTS**: cardiac-dominant (NT-proBNP over 3000, kidneys fine) and
// renal-dominant (eGFR under 45, NT-proBNP at or under 3000). Same label, different clinical picture. The
// result names which one it is.
//
// **THE 10,000 CUT-POINT IS ROUNDED AND ITS SENSITIVITY IS ABOUT 54 PERCENT** (Youden-optimal 10,461 ng/L,
// sensitivity 53.5, specificity 76.4; the rounded 10,000 gives 54.1 and 75.6), and it was derived ONLY
// within stage 3 patients. Nearly half the patients who die early are NOT flagged, so a stage below 4 is not
// reassurance.
//
// **THE PAPER DOES NOT STATE WHICH eGFR EQUATION WAS USED.** Neither CKD-EPI nor MDRD appears in the text,
// and the two routinely disagree by several ml/min around 45 - exactly where the boundary sits. Reported,
// not patched.
//
// **MEDIAN SURVIVAL IS NULL FOR STAGES 1 AND 2 ON PURPOSE**: within 36 months of follow-up a median was
// reached only for stage 3 (33.5 months) and stage 4 (22.5 months). Do not substitute a number.
//
// NT-proBNP in ng/L and pg/mL are numerically identical; no conversion is applied or needed.

import * as N from '../../lib/nac-attr-stage-v583.js';

export default [
  {
    id: 'nac-attr-stage',
    summary: `The NATIONAL AMYLOIDOSIS CENTRE (NAC / GILLMORE) STAGE for transthyretin cardiac amyloidosis (Gillmore and colleagues 2018; expanded by Nitsche and colleagues 2024), reported in BOTH versions. ORIGINAL THREE STAGES: stage 1 = NT-proBNP at or below ${N.NTPROBNP_THRESHOLD} ng/L AND eGFR at or above ${N.EGFR_THRESHOLD} ml/min; stage 3 = NT-proBNP above ${N.NTPROBNP_THRESHOLD} AND eGFR below ${N.EGFR_THRESHOLD}; stage 2 = the remainder. 2024 EXPANSION: stage 4 = NT-proBNP at or above ${N.STAGE4_THRESHOLD} ng/L IRRESPECTIVE OF eGFR. **STAGE 4 IS NOT A TAIL OF STAGE 3 - IT CUTS ACROSS.** A patient with NT-proBNP 12,000 and a perfectly good eGFR of 60 is original stage 2 and expanded stage 4. The paper counts it: of its 180 stage 4 patients, 65 came from original stage 2 and 115 from original stage 3, so modelling stage 4 as "stage 3 plus" silently loses the 65. **THE PUBLISHED DEFINITION OF STAGE 2 IS AN OR THAT LITERALLY OVERLAPS STAGE 3** - every stage 3 patient also satisfies the stage 2 sentence - and the intended, universally applied reading is that stage 2 is the RESIDUAL, one criterion but not both, with stage 3 taking precedence. That reading is applied here and stated rather than hidden. **STAGE 2 LUMPS TOGETHER TWO OPPOSITE PATIENTS**, cardiac-dominant (NT-proBNP over ${N.NTPROBNP_THRESHOLD}, renal function preserved) and renal-dominant (eGFR under ${N.EGFR_THRESHOLD}, NT-proBNP at or under ${N.NTPROBNP_THRESHOLD}); the result names which. **THE ${N.STAGE4_THRESHOLD} CUT-POINT IS ROUNDED AND ITS SENSITIVITY IS ABOUT 54 PERCENT**: the Youden-optimal value was ${N.YOUDEN_OPTIMAL} ng/L (sensitivity 53.5, specificity 76.4) and it was derived ONLY within stage 3 patients, so nearly half the patients who die early are NOT flagged and a stage below 4 is not reassurance. **THE PAPER DOES NOT STATE WHICH eGFR EQUATION WAS USED**; CKD-EPI and MDRD routinely disagree by several ml/min around 45, exactly where the boundary sits. ONE-YEAR MORTALITY in the expansion cohort: stage 1 ${N.ONE_YEAR_MORTALITY[1]} percent, stage 2 ${N.ONE_YEAR_MORTALITY[2]}, stage 3 ${N.ONE_YEAR_MORTALITY[3]}, stage 4 ${N.ONE_YEAR_MORTALITY[4]}. MEDIAN SURVIVAL is deliberately NULL for stages 1 and 2: within 36 months of follow-up a median was reached only for stage 3 (${N.MEDIAN_SURVIVAL_MONTHS[3]} months) and stage 4 (${N.MEDIAN_SURVIVAL_MONTHS[4]} months). Do not substitute a number. NT-proBNP in ng/L and pg/mL are numerically identical; no conversion is applied or needed. This STAGES a patient who ALREADY HAS a diagnosis of ATTR cardiac amyloidosis. It does NOT diagnose amyloidosis, does NOT distinguish transthyretin from light-chain amyloidosis, which is a different disease with a different and more urgent treatment, and does NOT distinguish wild-type from variant ATTR, which requires TTR sequencing and has implications for relatives. It does NOT select or withhold tafamidis or any other therapy, and a high stage is NOT a reason to withhold treatment.`,
    compute: N.nacAttrStage,
    fields: [
      {
        dom: 'nac-bnp', arg: 'ntProBnp', kind: 'number', unit: 'ng/L', required: true,
        label: `NT-proBNP in ng/L; pg/mL is numerically identical, so no conversion is needed. Above ${N.NTPROBNP_THRESHOLD} moves the original stage; at or above ${N.STAGE4_THRESHOLD} makes it stage 4 irrespective of eGFR.`,
      },
      {
        dom: 'nac-egfr', arg: 'egfr', kind: 'number', unit: 'ml/min', required: true,
        label: `eGFR. Below ${N.EGFR_THRESHOLD} moves the original stage. THE SOURCE DOES NOT STATE WHICH EQUATION PRODUCED IT, and CKD-EPI and MDRD disagree by several ml/min right at this boundary.`,
      },
    ],
  },
];
