// spec-v316 MCP wave: adapter for the GOLD ABE assessment tool (COPD group A/B/E) in
// lib/gold-abe-v316.js. The dom keys mirror the browser renderer (views/group-v316.js)
// and META['gold-abe'].example. `mmrc`, `cat`, and `moderateExacerbations` are numbers
// (each optional — the compute treats an absent mMRC/CAT as not-entered and defaults
// the exacerbation count to 0); `hospitalizedExacerbation` is a boolean. At least one
// of mMRC / CAT is required by the compute itself (it returns valid:false otherwise).
// The compute reports the GOLD group A, B, or E from the two axes (symptom burden,
// exacerbation history). The example sets mMRC 2 + one moderate exacerbation (a group-B
// case); its band carries the "mMRC 2" and "1 moderate exacerbation" example numbers,
// so it round-trips through the default makeToArgs with no custom toArgs.

import * as G from '../../lib/gold-abe-v316.js';

export default [
  {
    id: 'gold-abe',
    summary: 'GOLD ABE assessment tool (GOLD 2025 Report; the 2023 refinement that replaced the ABCD grid, merging C and D into group E) for COPD. Assigns group A, B, or E from two axes: symptom burden — "more symptoms" if mMRC >= 2 or CAT >= 10 — and exacerbation history over the past 12 months — "high risk" if >= 2 moderate exacerbations or >= 1 leading to hospital admission. Group A: low exacerbation risk and less symptoms. Group B: low exacerbation risk and more symptoms. Group E: high exacerbation risk, regardless of symptom burden. Enter mMRC and/or CAT (either suffices). The group informs initial pharmacotherapy but is a classification, not a drug order; the spirometric grade (GOLD 1-4) is reported separately.',
    compute: G.goldAbe,
    fields: [
      { dom: 'gold-mmrc', arg: 'mmrc', kind: 'number', label: 'mMRC dyspnea grade (0-4)' },
      { dom: 'gold-cat', arg: 'cat', kind: 'number', label: 'CAT score (0-40)' },
      { dom: 'gold-exac-mod', arg: 'moderateExacerbations', kind: 'number', label: 'Moderate exacerbations in the past 12 months (not hospitalized)' },
      { dom: 'gold-exac-hosp', arg: 'hospitalizedExacerbation', kind: 'bool', label: '>= 1 exacerbation leading to hospital admission' },
    ],
  },
];
