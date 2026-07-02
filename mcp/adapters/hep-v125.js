// spec-v183 MCP wave 14: adapters for the five lib/hep-v125.js hepatology tiles.
// dom keys mirror views/group-v125.js; arg names mirror the lib signatures. The
// CLIF-C ACLF six organ sub-scores are 1–3 ordinal selects (enums); labs and
// age are numbers; PELD age-under-1 / growth-failure and the Hepatic Steatosis
// Index female / diabetes flags are booleans.

import * as F from '../../lib/hep-v125.js';

export default [
  {
    id: 'peld-score',
    summary: 'PELD (Pediatric End-stage Liver Disease, McDiarmid 2002): from albumin, bilirubin, INR, age < 1 y, and growth failure; a higher score means greater waitlist priority.',
    compute: F.peldScore,
    fields: [
      { dom: 'pe-alb', arg: 'albumin', kind: 'number', label: 'Albumin (g/dL)' },
      { dom: 'pe-bili', arg: 'bilirubin', kind: 'number', label: 'Total bilirubin (mg/dL)' },
      { dom: 'pe-inr', arg: 'inr', kind: 'number', label: 'INR' },
      { dom: 'pe-age', arg: 'ageUnder1', kind: 'bool', label: 'Age < 1 year at listing' },
      { dom: 'pe-growth', arg: 'growthFailure', kind: 'bool', label: 'Growth failure (< −2 SD)' },
    ],
  },
  {
    id: 'clif-c-aclf',
    summary: 'CLIF-C ACLF (Jalan 2014): the six-organ CLIF-OF sub-score (6–18) plus age and white-cell count → a 0–100 acute-on-chronic-liver-failure mortality score.',
    compute: F.clifCAclf,
    fields: [
      { dom: 'cl-liver', arg: 'liver', kind: 'enum', values: ['1', '2', '3'], label: 'Liver — bilirubin sub-score' },
      { dom: 'cl-kidney', arg: 'kidney', kind: 'enum', values: ['1', '2', '3'], label: 'Kidney — creatinine sub-score' },
      { dom: 'cl-brain', arg: 'brain', kind: 'enum', values: ['1', '2', '3'], label: 'Brain — West Haven HE sub-score' },
      { dom: 'cl-coag', arg: 'coag', kind: 'enum', values: ['1', '2', '3'], label: 'Coagulation — INR sub-score' },
      { dom: 'cl-circ', arg: 'circ', kind: 'enum', values: ['1', '2', '3'], label: 'Circulation — MAP / vasopressor sub-score' },
      { dom: 'cl-resp', arg: 'resp', kind: 'enum', values: ['1', '2', '3'], label: 'Respiration — PaO2/FiO2 sub-score' },
      { dom: 'cl-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'cl-wbc', arg: 'wbc', kind: 'number', label: 'White-cell count (×10⁹/L)' },
    ],
  },
  {
    id: 'gahs',
    summary: 'Glasgow Alcoholic Hepatitis Score (Forrest 2005): from age, WBC, urea, INR, and bilirubin; ≥ 9 identifies the higher-mortality cohort in which corticosteroids showed benefit.',
    compute: F.gahs,
    fields: [
      { dom: 'ga-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'ga-wbc', arg: 'wbc', kind: 'number', label: 'White-cell count (×10⁹/L)' },
      { dom: 'ga-urea', arg: 'urea', kind: 'number', label: 'Urea (mmol/L)' },
      { dom: 'ga-inr', arg: 'inr', kind: 'number', label: 'INR' },
      { dom: 'ga-bili', arg: 'bilirubin', kind: 'number', label: 'Bilirubin (µmol/L)' },
    ],
  },
  {
    id: 'west-haven-he',
    summary: 'West Haven criteria (Conn 1977): hepatic-encephalopathy grade 0–4 from the selected clinical stage.',
    compute: F.westHavenHe,
    fields: [
      { dom: 'wh-grade', arg: 'grade', kind: 'number', required: true, label: 'West Haven grade (0–4)' },
    ],
  },
  {
    id: 'hepatic-steatosis-index',
    summary: 'Hepatic Steatosis Index (Lee 2010): 8 × (ALT/AST) + BMI + 2 (female) + 2 (diabetes); above 36 makes NAFLD likely.',
    compute: F.hepaticSteatosisIndex,
    fields: [
      { dom: 'hs-alt', arg: 'alt', kind: 'number', label: 'ALT (U/L)' },
      { dom: 'hs-ast', arg: 'ast', kind: 'number', label: 'AST (U/L)' },
      { dom: 'hs-bmi', arg: 'bmi', kind: 'number', label: 'BMI (kg/m²)' },
      { dom: 'hs-female', arg: 'female', kind: 'bool', label: 'Female sex' },
      { dom: 'hs-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
    ],
  },
];
