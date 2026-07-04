// spec-v183 MCP wave 21: adapters for the four myeloid-neoplasm / transplant
// prognostic scores in lib/myeloid-prognosis-v199.js — MIPSS70 for
// transplant-age primary myelofibrosis, GIPSS (genetically inspired), MYSEC-PM
// for secondary myelofibrosis survival, and the Sorror HCT-CI transplant
// comorbidity index. dom keys mirror views/group-v199.js. MIPSS70's HMR count,
// GIPSS's karyotype, and HCT-CI's hepatic / pulmonary axes are ordinal enums
// whose values mirror the renderer selects; every other item is a boolean.

import * as F from '../../lib/myeloid-prognosis-v199.js';

export default [
  {
    id: 'mipss70',
    summary: 'MIPSS70 for transplant-age primary myelofibrosis (Guglielmelli 2018): anemia, leukocytosis, thrombocytopenia, circulating blasts, marrow fibrosis, constitutional symptoms, CALR-type-1 absence, and HMR-mutation count sum to a risk score.',
    compute: F.mipss70,
    fields: [
      { dom: 'mipss-hb', arg: 'hb', kind: 'bool', required: false, label: 'Hemoglobin < 10 g/dL (+1)' },
      { dom: 'mipss-wbc', arg: 'wbc', kind: 'bool', required: false, label: 'Leukocytes > 25 ×10⁹/L (+2)' },
      { dom: 'mipss-plt', arg: 'plt', kind: 'bool', required: false, label: 'Platelets < 100 ×10⁹/L (+2)' },
      { dom: 'mipss-blasts', arg: 'blasts', kind: 'bool', required: false, label: 'Circulating blasts ≥ 2% (+1)' },
      { dom: 'mipss-fibrosis', arg: 'fibrosis', kind: 'bool', required: false, label: 'Bone-marrow fibrosis grade ≥ 2 (+1)' },
      { dom: 'mipss-constit', arg: 'constitutional', kind: 'bool', required: false, label: 'Constitutional symptoms (+1)' },
      { dom: 'mipss-nocalr', arg: 'noCalr', kind: 'bool', required: false, label: 'Absence of CALR type-1/like mutation (+1)' },
      { dom: 'mipss-hmr', arg: 'hmr', kind: 'enum', values: ['none', 'one', 'twoPlus'], required: false, label: 'High-molecular-risk (HMR) mutations' },
    ],
  },
  {
    id: 'gipss',
    summary: 'GIPSS genetically inspired prognostic score for primary myelofibrosis (Tefferi 2018): karyotype category plus CALR-type-1 absence, ASXL1, SRSF2, and U2AF1-Q157 mutations sum to a purely genetic risk score.',
    compute: F.gipss,
    fields: [
      { dom: 'gipss-karyo', arg: 'karyotype', kind: 'enum', values: ['favorable', 'unfavorable', 'vhr'], required: true, label: 'Karyotype' },
      { dom: 'gipss-nocalr', arg: 'noCalr', kind: 'bool', required: false, label: 'Absence of CALR type-1/like mutation (+1)' },
      { dom: 'gipss-asxl1', arg: 'asxl1', kind: 'bool', required: false, label: 'ASXL1 mutation (+1)' },
      { dom: 'gipss-srsf2', arg: 'srsf2', kind: 'bool', required: false, label: 'SRSF2 mutation (+1)' },
      { dom: 'gipss-u2af1', arg: 'u2af1', kind: 'bool', required: false, label: 'U2AF1 Q157 mutation (+1)' },
    ],
  },
  {
    id: 'mysec-pm',
    summary: 'MYSEC-PM for post-PV/ET secondary myelofibrosis survival (Passamonti 2017): age plus anemia, circulating blasts, CALR-unmutated status, thrombocytopenia, and constitutional symptoms give a weighted survival score.',
    compute: F.mysecPm,
    fields: [
      { dom: 'mysec-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mysec-hb', arg: 'hb', kind: 'bool', required: false, label: 'Hemoglobin < 11 g/dL (+2)' },
      { dom: 'mysec-blasts', arg: 'blasts', kind: 'bool', required: false, label: 'Circulating blasts ≥ 3% (+2)' },
      { dom: 'mysec-nocalr', arg: 'noCalr', kind: 'bool', required: false, label: 'CALR-unmutated (+2)' },
      { dom: 'mysec-plt', arg: 'plt', kind: 'bool', required: false, label: 'Platelets < 150 ×10⁹/L (+1)' },
      { dom: 'mysec-constit', arg: 'constitutional', kind: 'bool', required: false, label: 'Constitutional symptoms (+1)' },
    ],
  },
  {
    id: 'hct-ci',
    summary: 'Sorror HCT-CI hematopoietic-cell-transplantation comorbidity index (Sorror 2005): weighted organ comorbidities sum to a score banding non-relapse mortality (0 low, 1–2 intermediate, ≥ 3 high).',
    compute: F.hctCi,
    fields: [
      { dom: 'hct-arrhythmia', arg: 'arrhythmia', kind: 'bool', required: false, label: 'Arrhythmia (+1)' },
      { dom: 'hct-cardiac', arg: 'cardiac', kind: 'bool', required: false, label: 'Cardiac — CAD / CHF / MI / EF ≤ 50% (+1)' },
      { dom: 'hct-ibd', arg: 'ibd', kind: 'bool', required: false, label: 'Inflammatory bowel disease (+1)' },
      { dom: 'hct-diabetes', arg: 'diabetes', kind: 'bool', required: false, label: 'Diabetes on treatment (+1)' },
      { dom: 'hct-cva', arg: 'cerebrovascular', kind: 'bool', required: false, label: 'Cerebrovascular disease (+1)' },
      { dom: 'hct-psych', arg: 'psychiatric', kind: 'bool', required: false, label: 'Psychiatric disturbance (+1)' },
      { dom: 'hct-obesity', arg: 'obesity', kind: 'bool', required: false, label: 'Obesity (BMI > 35) (+1)' },
      { dom: 'hct-infection', arg: 'infection', kind: 'bool', required: false, label: 'Infection — antibiotics past day 0 (+1)' },
      { dom: 'hct-rheum', arg: 'rheumatologic', kind: 'bool', required: false, label: 'Rheumatologic disease (+2)' },
      { dom: 'hct-ulcer', arg: 'pepticUlcer', kind: 'bool', required: false, label: 'Peptic ulcer needing treatment (+2)' },
      { dom: 'hct-renal', arg: 'renalModerate', kind: 'bool', required: false, label: 'Moderate renal — Cr > 2 mg/dL / dialysis / transplant (+2)' },
      { dom: 'hct-tumor', arg: 'solidTumor', kind: 'bool', required: false, label: 'Prior solid tumor (+3)' },
      { dom: 'hct-valve', arg: 'heartValve', kind: 'bool', required: false, label: 'Heart-valve disease (+3)' },
      { dom: 'hct-hepatic', arg: 'hepatic', kind: 'enum', values: ['none', 'mild', 'severe'], required: false, label: 'Hepatic disease' },
      { dom: 'hct-pulmonary', arg: 'pulmonary', kind: 'enum', values: ['none', 'moderate', 'severe'], required: false, label: 'Pulmonary disease' },
    ],
  },
];
