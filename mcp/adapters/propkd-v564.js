// spec-v564 MCP wave: adapter for the PROPKD score in lib/propkd-v564.js. The dom keys mirror the browser
// renderer (views/group-v564.js) and META['propkd'].example.
//
// **"PKD2 MUTATION, 0 POINTS" IS AN EXPLICIT FINDING AND IS NOT THE SAME AS AN UNKNOWN GENOTYPE.** This is
// the trap a zero-point level invites. Scoring 0 for the mutation term ASSERTS that PKD2 was FOUND. A
// patient who has not been genotyped has NO PROPKD score - the variable is missing, not zero - and an agent
// that defaults an ungenotyped patient to the 0-point level hands back a low-risk result built on an
// assertion nobody made. The enum has no "unknown" or "not tested" member, and the tool refuses without it.
//
// **THE SCORE IS INAPPLICABLE TO PATIENTS WITH NO PKD1 OR PKD2 MUTATION FOUND.** There is no category for
// them at all; the model was built on genotyped patients. Do not fall back to the PKD2 level.
//
// **THE MUTATION TERM SUPPLIES UP TO 4 OF THE 9 POINTS FROM ONE CATEGORICAL VARIABLE.** It is mutually
// exclusive and non-linear (0 / 2 / 4), so a truncating PKD1 mutation alone reaches the intermediate band
// before any clinical variable is counted.
//
// **BOTH CLINICAL VARIABLES ARE AGE-GATED AT 35, AND THE INSTRUMENT IS LEAST INFORMATIVE IN YOUNG
// PATIENTS.** Hypertension and a first urologic event count only if they occurred BEFORE age 35. A later
// analysis notes the score may not help identify rapid progression under 35 unless the patient is ALREADY
// hypertensive and has ALREADY had urologic complications - so it is weakest in exactly the patients a
// clinician most wants to stratify. The optional age argument does not enter the score; it only attaches
// that caveat.
//
// A COMPANION TO `mayo-adpkd`, NOT A DUPLICATE: that stratifies from kidney VOLUME on imaging, this from
// GENOTYPE AND CLINICAL HISTORY with no imaging at all, and the two disagree on real patients.

import * as P from '../../lib/propkd-v564.js';

export default [
  {
    id: 'propkd',
    summary: `The PROPKD score (Cornec-Le Gall and colleagues, JASN 2016), predicting renal survival in autosomal dominant polycystic kidney disease. FOUR variables, total 0 to ${P.PROPKD_MAX}: male sex 1 point; hypertension before ${P.AGE_GATE} years of age 2 points; first urologic event before ${P.AGE_GATE} years of age 2 points; and the MUTATION, scoring 0 for PKD2, 2 for a NON-TRUNCATING PKD1 mutation, and 4 for a TRUNCATING PKD1 mutation. BANDS: 0 to 3 low risk (median age for end-stage renal disease 70.6 years), 4 to 6 intermediate (56.9 years), 7 to 9 high (49 years). **"PKD2 MUTATION, 0 POINTS" IS AN EXPLICIT FINDING, NOT AN ABSENCE** - this is the trap a zero-point level invites. Scoring 0 ASSERTS that a PKD2 mutation was FOUND. A patient who has NOT been genotyped has NO PROPKD score, because the variable is missing rather than zero, and defaulting an ungenotyped patient to the 0-point level would return a low-risk result built on an assertion nobody made. The enum has no "unknown" or "not tested" member and the tool refuses without a category. **THE SCORE IS ALSO INAPPLICABLE TO PATIENTS IN WHOM NO PKD1 OR PKD2 MUTATION WAS FOUND**: no category exists for them, and the PKD2 level is not a fallback. THE MUTATION TERM SUPPLIES UP TO 4 OF THE 9 POINTS from a single mutually exclusive, non-linear categorical variable, so a truncating PKD1 mutation alone reaches the intermediate band before any clinical variable is counted. **BOTH CLINICAL VARIABLES ARE AGE-GATED AT ${P.AGE_GATE}** - hypertension and a first urologic event count ONLY if they occurred BEFORE that age - and a later analysis notes the consequence directly: the score may not help identify rapid progression in patients under ${P.AGE_GATE} unless they are ALREADY hypertensive and have ALREADY had urologic complications, so the instrument is least informative in exactly the young patients one most wants to stratify. The optional age argument does NOT enter the score and only attaches that caveat. A UROLOGIC EVENT MEANS SOMETHING SPECIFIC: gross hematuria, cyst infection, or flank pain related to cysts - not any urological problem. The low-risk band runs 0 to 3; one widely circulated slide draws the band strip starting at 1, which would leave a score of 0 unbanded, and the paper is followed here. The negative predictive value of 81.4 percent and positive predictive value of 90.9 percent for end-stage renal disease before 60 are quoted from a SEPARATE REVIEW, not from the derivation paper. This is a COMPANION to the mayo-adpkd tile rather than a duplicate: that stratifies from kidney VOLUME on a scan while this stratifies from GENOTYPE AND CLINICAL HISTORY and needs no imaging, and the two disagree on real patients. This predicts the AGE at which end-stage renal disease is reached at a GROUP level; the band medians are population figures with wide spread, not a forecast for the patient in front of you. It does NOT diagnose ADPKD and does NOT measure current kidney function, so a high-risk score says nothing about today's estimated glomerular filtration rate. It is not by itself an indication for a vasopressin receptor antagonist or any other treatment, and it does not decide transplant or dialysis timing.`,
    compute: P.propkd,
    fields: [
      {
        dom: 'propkd-mutation', arg: 'mutation', kind: 'enum',
        values: P.MUTATION_CATEGORIES.map((m) => m.value), required: true,
        label: `Mutation category. REQUIRED, with NO "unknown" or "not tested" option: scoring PKD2 at 0 points asserts the mutation was FOUND, and an ungenotyped patient has no PROPKD score at all [${P.MUTATION_CATEGORIES.map((m) => `${m.value} = ${m.text}, ${m.points} points`).join('; ')}]`,
      },
      ...P.CLINICAL_VARIABLES.map((v) => ({
        dom: `propkd-${v.key}`, arg: v.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${v.text}. ${v.points} point${v.points === 1 ? '' : 's'}.${v.key === 'earlyUrologicEvent' ? ` ${P.UROLOGIC_EVENT_DEFINITION}` : ''}`,
      })),
      {
        dom: 'propkd-age', arg: 'age', kind: 'number', unit: 'years', required: false,
        label: `Optional current age. Does NOT enter the score. Used only to flag the documented limitation that the instrument may not identify rapid progression below age ${P.AGE_GATE}.`,
      },
    ],
  },
];
