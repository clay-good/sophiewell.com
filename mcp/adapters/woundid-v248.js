// spec-v183 MCP wave: adapters for the four wound-care + infectious-disease
// scores in lib/woundid-v248.js — the Abbreviated Burn Severity Index (ABSI),
// the SINBAD diabetic-foot-ulcer score, the ATLAS score for Clostridioides
// difficile infection, and the INCREMENT-CPE mortality score. dom keys mirror
// views/group-v248.js.

import * as F from '../../lib/woundid-v248.js';

export default [
  {
    id: 'absi-burn',
    summary: 'Abbreviated Burn Severity Index (Tobiasen 1982): sex + age band + inhalation injury + full-thickness burn + %TBSA band; grades threat to life from 2-3 very low to >= 12 maximum.',
    compute: F.absiBurn,
    fields: [
      { dom: 'absi-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
      { dom: 'absi-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'absi-tbsa', arg: 'tbsa', kind: 'number', required: true, label: '%TBSA burned', unit: '%' },
      { dom: 'absi-inhal', arg: 'inhalation', kind: 'bool', required: true, label: 'Inhalation injury' },
      { dom: 'absi-ft', arg: 'fullThickness', kind: 'bool', required: true, label: 'Full-thickness (third-degree) burn' },
    ],
  },
  {
    id: 'sinbad-score',
    summary: 'SINBAD diabetic-foot-ulcer score (Ince 2008): Site, Ischemia, Neuropathy, Bacterial infection, Area, and Depth, each 0/1; total 0-6, with >= 3 predicting a poorer outcome.',
    compute: F.sinbadScore,
    fields: [
      { dom: 'sin-site', arg: 'site', kind: 'bool', required: true, label: 'Site: mid- or hindfoot (vs forefoot)' },
      { dom: 'sin-isch', arg: 'ischemia', kind: 'bool', required: true, label: 'Ischemia: pedal pulses absent' },
      { dom: 'sin-neuro', arg: 'neuropathy', kind: 'bool', required: true, label: 'Neuropathy: protective sensation lost' },
      { dom: 'sin-inf', arg: 'infection', kind: 'bool', required: false, label: 'Bacterial infection present' },
      { dom: 'sin-area', arg: 'area', kind: 'bool', required: false, label: 'Area >= 1 cm^2' },
      { dom: 'sin-depth', arg: 'depth', kind: 'bool', required: false, label: 'Depth: reaches muscle/tendon/bone' },
    ],
  },
  {
    id: 'atlas-cdi',
    summary: 'ATLAS score (Miller 2013) for Clostridioides difficile infection: Age + Antibiotics + Leukocyte count + Albumin + serum Creatinine, 0-10; predicted cure = 100 - 5.08 x score.',
    compute: F.atlasCdi,
    fields: [
      { dom: 'atl-age', arg: 'age', kind: 'number', required: true, label: 'Age (< 60 = 0, 60-79 = 1, >= 80 = 2)' },
      { dom: 'atl-abx', arg: 'antibiotics', kind: 'number', required: true, label: 'Systemic antibiotics during CDI therapy' },
      { dom: 'atl-wbc', arg: 'leukocyte', kind: 'number', required: true, label: 'Leukocyte count (< 16 = 0, 16-25 = 1, > 25 = 2)' },
      { dom: 'atl-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin (> 35 = 0, 26-35 = 1, <= 25 = 2) g/L' },
      { dom: 'atl-cr', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine (<= 120 = 0, 121-179 = 1, >= 180 = 2) umol/L' },
    ],
  },
  {
    id: 'increment-cpe',
    summary: 'INCREMENT-CPE mortality score (Gutierrez-Gutierrez 2017): septic shock (5), Pitt bacteremia >= 6 (4), Charlson >= 2 (3), non-urinary/biliary source (3); total 0-15, with >= 8 high risk.',
    compute: F.incrementCpe,
    fields: [
      { dom: 'inc-shock', arg: 'shock', kind: 'bool', required: true, label: 'Severe sepsis or septic shock at presentation (5)' },
      { dom: 'inc-pitt', arg: 'pitt', kind: 'bool', required: true, label: 'Pitt bacteremia score >= 6 (4)' },
      { dom: 'inc-charl', arg: 'charlson', kind: 'bool', required: false, label: 'Charlson comorbidity index >= 2 (3)' },
      { dom: 'inc-src', arg: 'source', kind: 'bool', required: false, label: 'Source other than urinary/biliary tract (3)' },
    ],
  },
];
