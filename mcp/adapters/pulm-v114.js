// spec-v183 MCP wave 11: adapters for the six lib/pulm-v114.js COPD /
// bronchiectasis exacerbation and sleep instruments (DECAF, BAP-65, Bronchiectasis
// Severity Index, FACED, NoSAS, AHI/ODI severity band). dom keys mirror
// views/group-v39.js; the compute arg names are the verbatim keys that renderer
// passes. optNum and Number(selVal) inputs are 'number', chk inputs 'bool', and
// the eMRCD / desaturation-criterion selects 'enum'. Default makeToArgs
// round-trips every documented example.

import * as F from '../../lib/pulm-v114.js';

export default [
  {
    id: 'decaf-score',
    summary: 'DECAF score (Steer 2012): predicts in-hospital mortality in an acute COPD exacerbation (0-6) from dyspnea, eosinopenia, consolidation, acidemia, and atrial fibrillation.',
    compute: F.decafScore,
    fields: [
      { dom: 'dc-emrcd', arg: 'emrcd', kind: 'enum', values: ['1-4', '5a', '5b'], required: true, label: 'Extended MRC dyspnea (eMRCD)' },
      { dom: 'dc-eos', arg: 'eosinopenia', kind: 'bool', label: 'Eosinopenia (< 0.05 x10^9/L)' },
      { dom: 'dc-cons', arg: 'consolidation', kind: 'bool', label: 'Consolidation on chest X-ray' },
      { dom: 'dc-acid', arg: 'acidemia', kind: 'bool', label: 'Acidemia (pH < 7.30)' },
      { dom: 'dc-af', arg: 'af', kind: 'bool', label: 'Atrial fibrillation' },
    ],
  },
  {
    id: 'bap-65',
    summary: 'BAP-65 (Shorr 2011): classifies acute-COPD-exacerbation risk from BUN, altered mental status, pulse >= 109, and age >= 65.',
    compute: F.bap65,
    fields: [
      { dom: 'bp-bun', arg: 'bun', kind: 'bool', label: 'BUN >= 25 mg/dL' },
      { dom: 'bp-ams', arg: 'ams', kind: 'bool', label: 'Altered mental status' },
      { dom: 'bp-age', arg: 'age', kind: 'bool', label: 'Age >= 65 years' },
    ],
  },
  {
    id: 'bronchiectasis-bsi',
    summary: 'Bronchiectasis Severity Index (Chalmers 2014): predicts mortality and exacerbation risk from age, BMI, FEV1, colonization, radiology, and exacerbation history.',
    compute: F.bronchiectasisBsi,
    fields: [
      { dom: 'bs-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'bs-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI (kg/m^2)' },
      { dom: 'bs-fev1', arg: 'fev1', kind: 'number', required: true, label: 'FEV1 (% predicted)' },
      { dom: 'bs-exac', arg: 'exacerbations', kind: 'number', required: true, label: 'Exacerbations in the prior year' },
      { dom: 'bs-mrc', arg: 'mrc', kind: 'number', required: true, label: 'MRC dyspnea grade (1-5)' },
      { dom: 'bs-adm', arg: 'priorAdmission', kind: 'bool', label: 'Hospital admission in the prior 2 years' },
      { dom: 'bs-ps', arg: 'pseudomonas', kind: 'bool', label: 'Pseudomonas colonization' },
      { dom: 'bs-other', arg: 'otherOrganism', kind: 'bool', label: 'Colonization with another organism' },
      { dom: 'bs-lobes', arg: 'lobes3', kind: 'bool', label: '3 or more lobes involved' },
      { dom: 'bs-cyst', arg: 'cystic', kind: 'bool', label: 'Cystic bronchiectasis' },
    ],
  },
  {
    id: 'faced-bronchiectasis',
    summary: 'FACED score (Martinez-Garcia 2014): a five-variable bronchiectasis severity score (0-7) predicting 5-year mortality.',
    compute: F.facedBronchiectasis,
    fields: [
      { dom: 'fa-fev1', arg: 'fev1', kind: 'number', required: true, label: 'FEV1 (% predicted)' },
      { dom: 'fa-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'fa-ps', arg: 'pseudomonas', kind: 'bool', label: 'Pseudomonas colonization' },
      { dom: 'fa-ext', arg: 'extension', kind: 'bool', label: 'More than 2 lobes involved' },
      { dom: 'fa-dys', arg: 'dyspnea', kind: 'bool', label: 'MRC dyspnea grade 3-5' },
    ],
  },
  {
    id: 'nosas-score',
    summary: 'NoSAS score (Marti-Soler 2016): screens for sleep-disordered breathing (0-17) from neck circumference, BMI, snoring, age, and sex.',
    compute: F.nosasScore,
    fields: [
      { dom: 'no-neck', arg: 'neck', kind: 'number', required: true, label: 'Neck circumference (cm)' },
      { dom: 'no-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI (kg/m^2)' },
      { dom: 'no-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'no-snore', arg: 'snoring', kind: 'bool', label: 'Snoring' },
      { dom: 'no-male', arg: 'male', kind: 'bool', label: 'Male sex' },
    ],
  },
  {
    id: 'ahi-odi-severity',
    summary: 'AHI / ODI severity band (AASM): classifies obstructive sleep apnea severity from the apnea-hypopnea or oxygen-desaturation index (normal / mild / moderate / severe).',
    compute: F.ahiOdiSeverity,
    fields: [
      { dom: 'ah-ahi', arg: 'ahi', kind: 'number', label: 'AHI (events/hr)' },
      { dom: 'ah-odi', arg: 'odi', kind: 'number', label: 'ODI (events/hr)' },
      { dom: 'ah-crit', arg: 'criterion', kind: 'enum', values: ['3%', '4%'], label: 'Desaturation criterion' },
    ],
  },
];
