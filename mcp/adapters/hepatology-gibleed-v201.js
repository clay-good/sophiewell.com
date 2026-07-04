// spec-v183 MCP wave 23: adapters for the five hepatology / GI-bleed
// instruments in lib/hepatology-gibleed-v201.js — the Glasgow-Blatchford
// upper-GI-bleed score, CLIF-C AD (acute decompensation, pre-ACLF), the Hepamet
// fibrosis score, the CLIP HCC prognostic score, and Agile 3+ (FibroScan
// advanced-fibrosis probability). dom keys mirror views/group-v201.js. Glasgow-
// Blatchford's urea-unit and sex, Hepamet/Agile sex, and CLIP's Child-Pugh and
// morphology are ordinal / categorical enums mirroring the renderer selects.

import * as F from '../../lib/hepatology-gibleed-v201.js';

export default [
  {
    id: 'glasgow-blatchford',
    summary: 'Glasgow-Blatchford score for upper GI bleeding (Blatchford 2000): blood urea, hemoglobin, systolic BP, sex, and clinical markers (tachycardia, melena, syncope, hepatic/cardiac disease) give a 0–23 pre-endoscopy risk; 0 flags a candidate for outpatient management.',
    compute: F.glasgowBlatchford,
    fields: [
      { dom: 'gbs-ureaunit', arg: 'ureaUnit', kind: 'enum', values: ['mmol', 'mgdl'], required: true, label: 'Urea unit (mmol/L urea or mg/dL BUN)' },
      { dom: 'gbs-urea', arg: 'urea', kind: 'number', required: true, label: 'Blood urea / BUN (in the selected unit)' },
      { dom: 'gbs-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'gbs-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'gbs-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'gbs-pulse', arg: 'pulseHigh', kind: 'bool', required: false, label: 'Pulse ≥ 100 /min (+1)' },
      { dom: 'gbs-melena', arg: 'melena', kind: 'bool', required: false, label: 'Presentation with melena (+1)' },
      { dom: 'gbs-syncope', arg: 'syncope', kind: 'bool', required: false, label: 'Presentation with syncope (+2)' },
      { dom: 'gbs-hepatic', arg: 'hepatic', kind: 'bool', required: false, label: 'Hepatic disease (+2)' },
      { dom: 'gbs-cardiac', arg: 'cardiac', kind: 'bool', required: false, label: 'Cardiac failure (+2)' },
    ],
  },
  {
    id: 'clif-c-ad',
    summary: 'CLIF-C AD score (Jalan 2015): a mortality model for hospitalized decompensated cirrhosis without acute-on-chronic liver failure from age, creatinine, INR, WBC, and sodium; ≥ 60 is the high-risk band.',
    compute: F.clifcAd,
    fields: [
      { dom: 'clifad-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'clifad-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'clifad-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'clifad-wbc', arg: 'wbc', kind: 'number', required: true, label: 'WBC', unit: '×10⁹/L' },
      { dom: 'clifad-na', arg: 'sodium', kind: 'number', required: true, label: 'Sodium', unit: 'mmol/L' },
    ],
  },
  {
    id: 'hepamet-fibrosis',
    summary: 'Hepamet fibrosis score (Ampuero 2020): a non-invasive advanced-fibrosis score for NAFLD from age, sex, AST, albumin, platelets, diabetes, and HOMA-IR; < 0.12 rules out and ≥ 0.47 rules in advanced fibrosis.',
    compute: F.hepamet,
    fields: [
      { dom: 'hep-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'hep-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'hep-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'IU/L' },
      { dom: 'hep-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
      { dom: 'hep-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelets', unit: '×10⁹/L' },
      { dom: 'hep-dm', arg: 'diabetes', kind: 'bool', required: false, label: 'Diabetes mellitus (if set, HOMA-IR is not needed)' },
      { dom: 'hep-homa', arg: 'homa', kind: 'number', required: false, label: 'HOMA-IR (non-diabetic only)' },
    ],
  },
  {
    id: 'clip-hcc',
    summary: 'CLIP score for hepatocellular carcinoma (CLIP Investigators 1998): Child-Pugh stage, tumor morphology, AFP, and portal-vein thrombosis sum to 0–6, with median survival falling from ~36 months at 0 to ~3 months at 4–6.',
    compute: F.clip,
    fields: [
      { dom: 'clip-child', arg: 'childPugh', kind: 'enum', values: ['A', 'B', 'C'], required: true, label: 'Child-Pugh stage' },
      { dom: 'clip-morph', arg: 'morphology', kind: 'enum', values: ['uni', 'multi', 'massive'], required: true, label: 'Tumor morphology' },
      { dom: 'clip-afp', arg: 'afp', kind: 'number', required: true, label: 'Alpha-fetoprotein', unit: 'ng/mL' },
      { dom: 'clip-pvt', arg: 'pvt', kind: 'bool', required: false, label: 'Portal-vein thrombosis (+1)' },
    ],
  },
  {
    id: 'agile-3plus',
    summary: 'Agile 3+ (Sanyal 2023): a FibroScan-anchored probability of advanced (≥ F3) fibrosis in NAFLD from liver stiffness, AST, ALT, platelets, diabetes, sex, and age; < 0.451 rules out and ≥ 0.679 rules in.',
    compute: F.agile3plus,
    fields: [
      { dom: 'agile-lsm', arg: 'lsm', kind: 'number', required: true, label: 'Liver stiffness (LSM) by VCTE / FibroScan', unit: 'kPa' },
      { dom: 'agile-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'IU/L' },
      { dom: 'agile-alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'IU/L' },
      { dom: 'agile-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelets', unit: '×10⁹/L' },
      { dom: 'agile-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'agile-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'agile-dm', arg: 'diabetes', kind: 'bool', required: false, label: 'Diabetes mellitus' },
    ],
  },
];
