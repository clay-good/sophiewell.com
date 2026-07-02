// spec-v183 MCP wave 14: adapters for the five lib/id-v137.js infectious-disease
// tiles. dom keys mirror views/group-v137.js; arg names mirror the lib
// signatures. Continuous inputs are numbers; the yes/no and ordinal clinical
// questions are enums.

import * as F from '../../lib/id-v137.js';

export default [
  {
    id: 'isaric-4c-mortality',
    summary: 'ISARIC 4C Mortality Score (Knight 2020): a 0–21 in-hospital COVID-19 mortality score from age, sex, comorbidities, respiratory rate, SpO2, GCS, urea, and CRP.',
    compute: F.isaric4cMortality,
    fields: [
      { dom: 'is4c-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'is4c-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], label: 'Sex' },
      { dom: 'is4c-com', arg: 'comorbidities', kind: 'number', label: 'Number of comorbidities' },
      { dom: 'is4c-rr', arg: 'rr', kind: 'number', label: 'Respiratory rate (/min)' },
      { dom: 'is4c-spo2', arg: 'spo2', kind: 'number', label: 'SpO2 on room air (%)' },
      { dom: 'is4c-gcs', arg: 'gcs', kind: 'number', label: 'Glasgow Coma Scale' },
      { dom: 'is4c-urea', arg: 'urea', kind: 'number', label: 'Urea' },
      { dom: 'is4c-ureaunit', arg: 'ureaUnit', kind: 'enum', values: ['mmol', 'bun-mgdl'], label: 'Urea unit' },
      { dom: 'is4c-crp', arg: 'crp', kind: 'number', label: 'CRP (mg/L)' },
    ],
  },
  {
    id: 'covid-gram',
    summary: 'COVID-GRAM critical-illness risk (Liang 2020): a published logistic model from X-ray abnormality, age, hemoptysis, dyspnea, unconsciousness, comorbidity count, cancer, NLR, LDH, and direct bilirubin.',
    compute: F.covidGram,
    fields: [
      { dom: 'cg-xray', arg: 'xray', kind: 'enum', values: ['no', 'yes'], label: 'Chest X-ray abnormality' },
      { dom: 'cg-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'cg-hemo', arg: 'hemoptysis', kind: 'enum', values: ['no', 'yes'], label: 'Hemoptysis' },
      { dom: 'cg-dysp', arg: 'dyspnea', kind: 'enum', values: ['no', 'yes'], label: 'Dyspnea' },
      { dom: 'cg-unc', arg: 'unconscious', kind: 'enum', values: ['no', 'yes'], label: 'Unconsciousness' },
      { dom: 'cg-com', arg: 'comorbidities', kind: 'number', label: 'Number of comorbidities' },
      { dom: 'cg-cancer', arg: 'cancer', kind: 'enum', values: ['no', 'yes'], label: 'History of cancer' },
      { dom: 'cg-nlr', arg: 'nlr', kind: 'number', label: 'Neutrophil-to-lymphocyte ratio' },
      { dom: 'cg-ldh', arg: 'ldh', kind: 'number', label: 'LDH (U/L)' },
      { dom: 'cg-db', arg: 'db', kind: 'number', label: 'Direct bilirubin (µmol/L)' },
    ],
  },
  {
    id: 'candida-score',
    summary: 'Candida score (León 2006): TPN + surgery + multifocal colonization + severe sepsis (0–5); ≥ 3 makes invasive candidiasis likely.',
    compute: F.candidaScore,
    fields: [
      { dom: 'cand-tpn', arg: 'tpn', kind: 'enum', values: ['no', 'yes'], label: 'Total parenteral nutrition' },
      { dom: 'cand-surg', arg: 'surgery', kind: 'enum', values: ['no', 'yes'], label: 'Surgery on ICU admission' },
      { dom: 'cand-col', arg: 'colonization', kind: 'enum', values: ['no', 'yes'], label: 'Multifocal Candida colonization' },
      { dom: 'cand-sep', arg: 'sepsis', kind: 'enum', values: ['no', 'yes'], label: 'Severe sepsis' },
    ],
  },
  {
    id: 'vacs-index',
    summary: 'VACS Index (Justice 2013): a continuous HIV mortality risk from age, CD4, HIV-1 RNA, hemoglobin, FIB-4 components (AST/ALT/platelets), eGFR, and hepatitis C.',
    compute: F.vacsIndex,
    fields: [
      { dom: 'vacs-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'vacs-cd4', arg: 'cd4', kind: 'number', label: 'CD4 count (cells/µL)' },
      { dom: 'vacs-rna', arg: 'rna', kind: 'number', label: 'HIV-1 RNA (copies/mL)' },
      { dom: 'vacs-hgb', arg: 'hgb', kind: 'number', label: 'Hemoglobin (g/dL)' },
      { dom: 'vacs-ast', arg: 'ast', kind: 'number', label: 'AST (U/L)' },
      { dom: 'vacs-alt', arg: 'alt', kind: 'number', label: 'ALT (U/L)' },
      { dom: 'vacs-plt', arg: 'platelets', kind: 'number', label: 'Platelets (×10⁹/L)' },
      { dom: 'vacs-egfr', arg: 'egfr', kind: 'number', label: 'eGFR (mL/min/1.73 m²)' },
      { dom: 'vacs-hcv', arg: 'hepC', kind: 'enum', values: ['no', 'yes'], label: 'Hepatitis C co-infection' },
    ],
  },
  {
    id: 'regiscar-dress',
    summary: 'RegiSCAR DRESS validation score (Kardaun 2007): fever, nodes, eosinophilia, atypical lymphocytes, skin extent/suggestiveness/biopsy, organ involvement, resolution, and cause exclusion → no case / possible / probable / definite.',
    compute: F.regiscarDress,
    fields: [
      { dom: 'rd-fever', arg: 'fever', kind: 'enum', values: ['no', 'yes'], label: 'Fever ≥ 38.5 °C' },
      { dom: 'rd-nodes', arg: 'nodes', kind: 'enum', values: ['no', 'yes'], label: 'Enlarged lymph nodes (≥ 2 sites)' },
      { dom: 'rd-eos', arg: 'eos', kind: 'enum', values: ['0', '1', '2'], label: 'Eosinophilia band' },
      { dom: 'rd-atyp', arg: 'atypical', kind: 'enum', values: ['no', 'yes'], label: 'Atypical lymphocytes' },
      { dom: 'rd-ext', arg: 'skinExtent', kind: 'enum', values: ['no', 'yes'], label: 'Skin involvement > 50% BSA' },
      { dom: 'rd-sugg', arg: 'rashSuggestive', kind: 'enum', values: ['no', 'unknown', 'yes'], label: 'Rash suggestive of DRESS' },
      { dom: 'rd-biopsy', arg: 'biopsy', kind: 'enum', values: ['compatible', 'against'], label: 'Biopsy result' },
      { dom: 'rd-organ', arg: 'organ', kind: 'enum', values: ['0', '1', '2plus'], label: 'Organ involvement' },
      { dom: 'rd-res', arg: 'resolution', kind: 'enum', values: ['no', 'yes'], label: 'Resolution ≥ 15 days' },
      { dom: 'rd-other', arg: 'otherCauses', kind: 'enum', values: ['no', 'yes'], label: 'Other causes excluded (≥ 3 negative tests)' },
    ],
  },
];
