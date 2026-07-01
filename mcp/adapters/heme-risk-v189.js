// spec-v183 MCP wave 9: adapters for the four risk/comorbidity instruments in
// lib/heme-risk-v189.js — mSMART cytogenetic risk stratification for myeloma,
// the IMPEDE-VTE myeloma thrombosis score, the SAMe-TT2R2 warfarin-control
// predictor, and the Elixhauser comorbidity index (van Walraven weighting).
// The Elixhauser renderer strips the `elix-` prefix before calling compute, so
// each arg is the bare condition key. dom keys mirror views/group-v189.js.

import * as F from '../../lib/heme-risk-v189.js';

const ELIXHAUSER_CONDITIONS = [
  ['chf', 'Congestive heart failure'],
  ['arrhythmia', 'Cardiac arrhythmias'],
  ['valvular', 'Valvular disease'],
  ['pulmCirc', 'Pulmonary circulation disorders'],
  ['pvd', 'Peripheral vascular disease'],
  ['hypertension', 'Hypertension'],
  ['paralysis', 'Paralysis'],
  ['neuro', 'Other neurological disorders'],
  ['chronicPulm', 'Chronic pulmonary disease'],
  ['diabetes', 'Diabetes (uncomplicated or complicated)'],
  ['hypothyroid', 'Hypothyroidism'],
  ['renal', 'Renal failure'],
  ['liver', 'Liver disease'],
  ['pud', 'Peptic ulcer disease excluding bleeding'],
  ['hiv', 'HIV / AIDS'],
  ['lymphoma', 'Lymphoma'],
  ['metastatic', 'Metastatic cancer'],
  ['solidTumor', 'Solid tumor without metastasis'],
  ['rheum', 'Rheumatoid arthritis / collagen vascular'],
  ['coagulopathy', 'Coagulopathy'],
  ['obesity', 'Obesity'],
  ['weightLoss', 'Weight loss'],
  ['fluidLyte', 'Fluid and electrolyte disorders'],
  ['bloodLossAnemia', 'Blood-loss anemia'],
  ['deficiencyAnemia', 'Deficiency anemia'],
  ['alcohol', 'Alcohol abuse'],
  ['drugAbuse', 'Drug abuse'],
  ['psychoses', 'Psychoses'],
  ['depression', 'Depression'],
];

export default [
  {
    id: 'msmart',
    summary: 'mSMART cytogenetic risk stratification for multiple myeloma (standard vs high risk) from FISH translocations, del(17p), gain(1q), S-phase, and R-ISS III / high LDH.',
    compute: F.msmart,
    fields: [
      { dom: 'msmart-t414', arg: 't414', kind: 'bool', required: false, label: 't(4;14)' },
      { dom: 'msmart-t1416', arg: 't1416', kind: 'bool', required: false, label: 't(14;16)' },
      { dom: 'msmart-t1420', arg: 't1420', kind: 'bool', required: false, label: 't(14;20)' },
      { dom: 'msmart-del17p', arg: 'del17p', kind: 'bool', required: false, label: 'del(17p) / p53 deletion' },
      { dom: 'msmart-gain1q', arg: 'gain1q', kind: 'bool', required: false, label: 'gain(1q) / del(1p)' },
      { dom: 'msmart-sphase', arg: 'sphase', kind: 'bool', required: false, label: 'High plasma-cell S-phase' },
      { dom: 'msmart-rissIII', arg: 'rissIII', kind: 'bool', required: false, label: 'R-ISS III / high LDH' },
    ],
  },
  {
    id: 'impede-vte',
    summary: 'IMPEDE-VTE score for venous-thromboembolism risk in multiple myeloma on therapy; the weighted sum maps to a low/intermediate/high 6-month VTE band.',
    compute: F.impedeVte,
    fields: [
      { dom: 'impede-imid', arg: 'imid', kind: 'bool', required: false, label: 'Immunomodulatory agent (+4)' },
      { dom: 'impede-bmi25', arg: 'bmi25', kind: 'bool', required: false, label: 'BMI ≥ 25 kg/m² (+1)' },
      { dom: 'impede-fracture', arg: 'fracture', kind: 'bool', required: false, label: 'Pelvic / hip / femur fracture (+4)' },
      { dom: 'impede-esa', arg: 'esa', kind: 'bool', required: false, label: 'Erythropoietin-stimulating agent (+1)' },
      { dom: 'impede-dexamethasone', arg: 'dexamethasone', kind: 'enum', values: ['none', 'low', 'high'], required: false, label: 'Dexamethasone dose' },
      { dom: 'impede-doxorubicin', arg: 'doxorubicin', kind: 'bool', required: false, label: 'Doxorubicin (+3)' },
      { dom: 'impede-asian', arg: 'asian', kind: 'bool', required: false, label: 'Asian ethnicity (−3)' },
      { dom: 'impede-vteHistory', arg: 'vteHistory', kind: 'bool', required: false, label: 'Prior VTE (+5)' },
      { dom: 'impede-tunneledLine', arg: 'tunneledLine', kind: 'bool', required: false, label: 'Tunneled line / central venous catheter (+2)' },
      { dom: 'impede-thromboprophylaxis', arg: 'thromboprophylaxis', kind: 'enum', values: ['none', 'aspirin', 'therapeutic'], required: false, label: 'Existing thromboprophylaxis' },
    ],
  },
  {
    id: 'same-tt2r2',
    summary: 'SAMe-TT2R2 score predicting how well a patient will maintain therapeutic INR on warfarin; > 2 suggests a DOAC or extra INR support.',
    compute: F.sameTt2r2,
    fields: [
      { dom: 'same-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
      { dom: 'same-ageUnder60', arg: 'ageUnder60', kind: 'bool', required: false, label: 'Age < 60 years' },
      { dom: 'same-medicalHistory', arg: 'medicalHistory', kind: 'bool', required: false, label: 'Medical history (≥ 2 comorbidities)' },
      { dom: 'same-interactingDrugs', arg: 'interactingDrugs', kind: 'bool', required: false, label: 'Interacting drugs (e.g. amiodarone)' },
      { dom: 'same-tobacco', arg: 'tobacco', kind: 'bool', required: false, label: 'Tobacco use within 2 years (2)' },
      { dom: 'same-nonWhite', arg: 'nonWhite', kind: 'bool', required: false, label: 'Non-white race (2)' },
    ],
  },
  {
    id: 'elixhauser',
    summary: 'Elixhauser comorbidity index with van Walraven weighting: a single mortality-weighted score summed over 29 comorbidity flags.',
    compute: F.elixhauser,
    fields: ELIXHAUSER_CONDITIONS.map(([key, label]) => (
      { dom: `elix-${key}`, arg: key, kind: 'bool', required: false, label }
    )),
  },
];
