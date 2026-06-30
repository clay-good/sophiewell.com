// spec-v183 MCP wave 7: adapters for the five lib/nephro-v92.js nephrology
// instruments (KDIGO CKD staging, spot UACR/UPCR with A-stage, hemodialysis
// adequacy URR + Daugirdas Kt/V, Mehran contrast-nephropathy risk, and the 2021
// race-free CKD-EPI cystatin estimates). dom keys mirror views/group-v26.js; the
// labs and dimensions are numbers, the albuminuria / albumin-unit / sex / risk
// criteria are enums.

import * as F from '../../lib/nephro-v92.js';

export default [
  {
    id: 'ckd-staging',
    summary: 'KDIGO CKD staging: G-stage by eGFR and A-stage by UACR (or a direct albuminuria category) mapped to the heat-map risk colour (KDIGO 2024).',
    compute: F.ckdStaging,
    fields: [
      { dom: 'cs-egfr', arg: 'egfr', kind: 'number', required: true, label: 'eGFR', unit: 'mL/min/1.73m^2' },
      { dom: 'cs-uacr', arg: 'uacr', kind: 'number', required: false, label: 'Urine albumin-to-creatinine ratio', unit: 'mg/g' },
      { dom: 'cs-acat', arg: 'aCategory', kind: 'enum', values: ['A1', 'A2', 'A3'], required: false, label: 'Albuminuria category (use only if no UACR)' },
    ],
  },
  {
    id: 'uacr-upcr',
    summary: 'Spot urine albumin- and protein-to-creatinine ratios with the KDIGO A-stage and an estimated 24-hour excretion (2024 CKD guideline).',
    compute: F.uacrUpcr,
    fields: [
      { dom: 'uu-alb', arg: 'albumin', kind: 'number', required: false, label: 'Urine albumin', unit: 'mg/dL' },
      { dom: 'uu-unit', arg: 'albuminUnit', kind: 'enum', values: ['mg/dL', 'mg/L'], required: false, label: 'Urine albumin unit' },
      { dom: 'uu-prot', arg: 'protein', kind: 'number', required: false, label: 'Urine protein (for the UPCR)', unit: 'mg/dL' },
      { dom: 'uu-cr', arg: 'urineCr', kind: 'number', required: true, label: 'Urine creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'ktv-urr',
    summary: 'Hemodialysis adequacy: urea reduction ratio (URR) and the Daugirdas second-generation single-pool Kt/V against the KDOQI minimum targets (Daugirdas 1993).',
    compute: F.ktvUrr,
    fields: [
      { dom: 'kt-pre', arg: 'preBun', kind: 'number', required: true, label: 'Pre-dialysis BUN', unit: 'mg/dL' },
      { dom: 'kt-post', arg: 'postBun', kind: 'number', required: true, label: 'Post-dialysis BUN', unit: 'mg/dL' },
      { dom: 'kt-uf', arg: 'ufVolume', kind: 'number', required: false, label: 'Ultrafiltration volume', unit: 'L' },
      { dom: 'kt-time', arg: 'dialysisTime', kind: 'number', required: false, label: 'Dialysis session time', unit: 'h' },
      { dom: 'kt-wt', arg: 'postWeight', kind: 'number', required: false, label: 'Post-dialysis weight', unit: 'kg' },
    ],
  },
  {
    id: 'mehran-cin',
    summary: 'Mehran contrast-induced nephropathy risk score after PCI (weighted points, bands <=5 / 6-10 / 11-15 / >=16) with CIN and dialysis percentages (Mehran 2004).',
    compute: F.mehranCin,
    fields: [
      { dom: 'me-hypo', arg: 'hypotension', kind: 'enum', values: ['no', 'yes'], required: false, label: 'Hypotension (5)' },
      { dom: 'me-iabp', arg: 'iabp', kind: 'enum', values: ['no', 'yes'], required: false, label: 'Intra-aortic balloon pump (5)' },
      { dom: 'me-chf', arg: 'chf', kind: 'enum', values: ['no', 'yes'], required: false, label: 'Congestive heart failure (5)' },
      { dom: 'me-age', arg: 'ageOver75', kind: 'enum', values: ['no', 'yes'], required: false, label: 'Age > 75 (4)' },
      { dom: 'me-anemia', arg: 'anemia', kind: 'enum', values: ['no', 'yes'], required: false, label: 'Anemia (3)' },
      { dom: 'me-dm', arg: 'diabetes', kind: 'enum', values: ['no', 'yes'], required: false, label: 'Diabetes (3)' },
      { dom: 'me-contrast', arg: 'contrastVolume', kind: 'number', required: false, label: 'Contrast volume (1 per 100 mL)', unit: 'mL' },
      { dom: 'me-egfr', arg: 'egfr', kind: 'number', required: false, label: 'eGFR (40-60 = 2, 20-40 = 4, <20 = 6)', unit: 'mL/min/1.73m^2' },
    ],
  },
  {
    id: 'ckd-epi-cystatin',
    summary: 'The 2021 race-free CKD-EPI eGFR: cystatin-C alone, the combined creatinine + cystatin C estimate, and creatinine-only for comparison (Inker 2021).',
    compute: F.ckdEpiCystatin,
    fields: [
      { dom: 'cc-cys', arg: 'cystatinC', kind: 'number', required: true, label: 'Serum cystatin C', unit: 'mg/L' },
      { dom: 'cc-cr', arg: 'creatinine', kind: 'number', required: false, label: 'Serum creatinine (for the combined estimate)', unit: 'mg/dL' },
      { dom: 'cc-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'cc-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: false, label: 'Sex' },
    ],
  },
];
