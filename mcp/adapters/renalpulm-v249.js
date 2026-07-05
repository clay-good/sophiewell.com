// spec-v183 MCP wave: adapters for the four renal & respiratory bedside formulas
// in lib/renalpulm-v249.js — the renal failure index (RFI), the fractional
// excretion of uric acid (FEUA), the bronchodilator responsiveness, and the
// integrative weaning index (IWI). dom keys mirror views/group-v249.js; all
// inputs are numeric.

import * as F from '../../lib/renalpulm-v249.js';

export default [
  {
    id: 'renal-failure-index',
    summary: 'Renal failure index = urine sodium x plasma creatinine / urine creatinine; < 1 favors prerenal azotemia, > 1 favors acute tubular necrosis.',
    compute: F.renalFailureIndex,
    fields: [
      { dom: 'rfi-una', arg: 'urineNa', kind: 'number', required: true, label: 'Urine sodium', unit: 'mEq/L' },
      { dom: 'rfi-pcr', arg: 'plasmaCr', kind: 'number', required: true, label: 'Plasma creatinine', unit: 'mg/dL' },
      { dom: 'rfi-ucr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'feua',
    summary: 'Fractional excretion of uric acid = 100 x (urine uric acid x serum creatinine) / (serum uric acid x urine creatinine); normal 4-11%, aiding the hyponatremia / SIADH workup.',
    compute: F.feua,
    fields: [
      { dom: 'feua-uua', arg: 'urineUA', kind: 'number', required: true, label: 'Urine uric acid', unit: 'mg/dL' },
      { dom: 'feua-scr', arg: 'serumCr', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'feua-sua', arg: 'serumUA', kind: 'number', required: true, label: 'Serum uric acid', unit: 'mg/dL' },
      { dom: 'feua-ucr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'bronchodilator-response',
    summary: 'Bronchodilator responsiveness (ATS/ERS 2022): % change = 100 x (post - pre) / predicted for FEV1 or FVC; a change > 10% of predicted is a significant response.',
    compute: F.bronchodilatorResponse,
    fields: [
      { dom: 'bdr-pre', arg: 'pre', kind: 'number', required: true, label: 'Pre-bronchodilator FEV1 or FVC', unit: 'L' },
      { dom: 'bdr-post', arg: 'post', kind: 'number', required: true, label: 'Post-bronchodilator FEV1 or FVC', unit: 'L' },
      { dom: 'bdr-pred', arg: 'predicted', kind: 'number', required: true, label: 'Predicted FEV1 or FVC', unit: 'L' },
    ],
  },
  {
    id: 'integrative-weaning-index',
    summary: 'Integrative weaning index (Nemer 2009) = static compliance x SaO2 / RSBI; an IWI >= 25 predicts weaning success from mechanical ventilation.',
    compute: F.integrativeWeaningIndex,
    fields: [
      { dom: 'iwi-cst', arg: 'compliance', kind: 'number', required: true, label: 'Static compliance', unit: 'mL/cmH2O' },
      { dom: 'iwi-sao2', arg: 'sao2', kind: 'number', required: true, label: 'SaO2', unit: '%' },
      { dom: 'iwi-rsbi', arg: 'rsbi', kind: 'number', required: true, label: 'RSBI / f/VT', unit: 'breaths/min/L' },
    ],
  },
];
