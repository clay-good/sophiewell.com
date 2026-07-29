// spec-v590 MCP wave: adapter for the original 1996 Five-Factor Score in lib/ffs-1996-v590.js. The dom keys
// mirror the browser renderer (views/group-v590.js) and META['ffs-1996'].example.
//
// **THE TWO SCORES SHARE A NAME, A RANGE AND A BAND STRUCTURE, AND ONLY ONE FACTOR.** `ffs-2011` is also in
// this catalog. Both run 0 to 5 and both read as 0 / 1 / 2-or-more. But of the five factors ONLY
// GASTROINTESTINAL INVOLVEMENT survives unchanged: cardiomyopathy became cardiac insufficiency, the renal
// threshold MOVED and proteinuria was DROPPED, CNS involvement was DROPPED, and AGE OVER 65 was ADDED. AN
// IDENTICAL NUMBER FROM THE TWO SCORES DOES NOT MEAN THE SAME THING and a value cannot be carried between
// them.
//
// **THE RENAL THRESHOLD MOVED BY ONLY 10 MICROMOL/L, WHICH IS ENOUGH TO CROSS.** 1996 counts creatinine
// ABOVE 140 micromol/L (1.58 mg/dL); the revision counts AT OR ABOVE 150. A patient at 145 scores the renal
// factor here and NOT on the revision. Pass `creatinineUmol` and the result sets `renalThresholdCrossover`
// when the patient is in that window - report it.
//
// **THE SUCCESSOR HAS A FACTOR THAT SCORES FOR ITS ABSENCE; THIS ONE HAS NOTHING LIKE IT.** In the revision
// the ABSENCE of ear, nose and throat manifestations scores a point. Every factor here counts something
// being PRESENT. Do not carry the inverted item across.
//
// **NEVER DERIVED IN GRANULOMATOSIS WITH POLYANGIITIS.** The 1996 cohort was 342 patients with polyarteritis
// nodosa and Churg-Strauss syndrome, with microscopic polyangiitis conventionally included. GPA (Wegener)
// entered only with the revision's cohort of 1108. `outsideDerivationCohort` marks that input.
//
// **THE FIVE-YEAR MORTALITY FIGURES ARE DELIBERATELY WITHHELD.** `fiveYearMortalityPercent` is ALWAYS null.
// The percentages usually quoted alongside "the Five-Factor Score" belong to the 2011 revision's cohort, and
// the 1996 figures could not be confirmed from two independent sources. DO NOT SUBSTITUTE THE REVISION'S
// PERCENTAGES - that would attach one cohort's outcomes to a different set of factors.

import * as F from '../../lib/ffs-1996-v590.js';

export default [
  {
    id: 'ffs-1996',
    summary: `The ORIGINAL 1996 FIVE-FACTOR SCORE (Guillevin and colleagues) for systemic necrotizing vasculitis, one point per factor, 0 to ${F.FFS_MAX}, read as 0 / 1 / 2-or-more. THE FIVE FACTORS: ${F.FACTORS.map((f) => f.text).join('; ')}. **THE 2011 REVISION (\`ffs-2011\`, ALSO IN THIS CATALOG) SHARES THE NAME, THE RANGE AND THE BAND STRUCTURE AND ONLY ONE FACTOR** - gastrointestinal involvement. ${F.FACTORS.map((f) => `${f.text}: ${f.fate}`).join(' ')} The revision additionally has ${F.REVISION_ONLY_FACTORS.join(', and ')}. **AN IDENTICAL NUMBER FROM THE TWO SCORES DOES NOT MEAN THE SAME THING**, and a value cannot be carried between them. **THE RENAL THRESHOLD MOVED BY ONLY 10 MICROMOL/L, WHICH IS ENOUGH TO CROSS**: this score counts creatinine ABOVE ${F.CREATININE_THRESHOLD_UMOL} micromol/L (${F.CREATININE_THRESHOLD_MGDL} mg/dL), the revision AT OR ABOVE ${F.REVISION_CREATININE_UMOL}, so a patient at 145 scores the renal factor here and NOT on the revision; pass \`creatinineUmol\` and \`renalThresholdCrossover\` marks that window. **THE SUCCESSOR HAS A FACTOR THAT SCORES FOR ITS ABSENCE AND THIS ONE HAS NOTHING LIKE IT** - every factor here counts something being PRESENT, so do not carry the inverted ENT item across. **NEVER DERIVED IN ${F.OUT_OF_DERIVATION.toUpperCase()}**: the 1996 cohort was 342 patients with ${F.DERIVED_DISEASES.slice(0, 2).join(' and ')}, with ${F.DERIVED_DISEASES[2]} conventionally included; GPA entered only with the revision, and \`outsideDerivationCohort\` marks that input. **THE FIVE-YEAR MORTALITY FIGURES ARE DELIBERATELY WITHHELD**: \`fiveYearMortalityPercent\` is ALWAYS null, because the percentages usually quoted alongside "the Five-Factor Score" belong to the 2011 revision's cohort and the 1996 figures could not be confirmed from two independent sources. DO NOT SUBSTITUTE THE REVISION'S PERCENTAGES - that would attach one cohort's outcomes to a different set of factors. This is a GROUP-LEVEL PROGNOSTIC score. It does NOT diagnose vasculitis, does NOT classify which vasculitis, and does NOT measure disease ACTIVITY, which is a separate axis. It does NOT select immunosuppression, and a score of 0 is NOT a reason to withhold treatment.`,
    compute: F.ffs1996,
    fields: [
      ...F.FACTORS.map((f) => ({
        dom: `ffs96-${f.key}`, arg: f.key, kind: 'enum', values: ['no', 'yes'], required: true,
        label: `${f.text}. In the 2011 revision: ${f.fate}`,
      })),
      {
        dom: 'ffs96-creatinineUmol', arg: 'creatinineUmol', kind: 'number', unit: 'umol/L', required: false,
        label: `Optional serum creatinine. Used only to detect the ${F.REVISION_CREATININE_UMOL - F.CREATININE_THRESHOLD_UMOL} micromol/L window in which this score and the revision disagree on the renal factor.`,
      },
      {
        dom: 'ffs96-disease', arg: 'disease', kind: 'enum',
        values: ['polyarteritis-nodosa', 'egpa', 'microscopic-polyangiitis', 'granulomatosis-with-polyangiitis'],
        required: false,
        label: `Optional. Selecting granulomatosis-with-polyangiitis sets \`outsideDerivationCohort\`, because ${F.OUT_OF_DERIVATION} was added only in the 2011 revision.`,
      },
    ],
  },
];
