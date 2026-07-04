// spec-v183 MCP wave 38: adapters for the seven hematology prognostic
// instruments in lib/heme-prognostic-v216.js — the WPSS (MDS), MD Anderson CLL
// index, PIT (PTCL), PRIMA-PI (follicular lymphoma), Durie-Salmon myeloma stage,
// lymphocyte doubling time, and the Talcott febrile-neutropenia risk groups. dom
// keys mirror views/group-v216.js. The WPSS, MDACC, and Durie-Salmon ordinal
// selects carry numeric-string point values (modeled as enums); the rest are
// numeric labs and boolean flags.

import * as F from '../../lib/heme-prognostic-v216.js';

export default [
  {
    id: 'wpss-mds',
    summary: 'WHO Prognostic Scoring System for MDS (Malcovati 2007): WHO morphologic category, karyotype, and transfusion dependence give a 0–6 score banding survival and leukemic progression.',
    compute: F.wpssMds,
    fields: [
      { dom: 'wpss-cat', arg: 'whoCategory', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'WHO category (0–3 points)' },
      { dom: 'wpss-karyo', arg: 'karyotype', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Karyotype (good/intermediate/poor)' },
      { dom: 'wpss-tx', arg: 'transfusion', kind: 'bool', required: false, label: 'Transfusion dependence (+1)' },
    ],
  },
  {
    id: 'mdacc-cll-index',
    summary: 'MD Anderson CLL prognostic index (Wierda 2007): age, beta-2-microglobulin, absolute lymphocyte count, male sex, advanced Rai stage, and number of involved nodal groups give a score banding survival.',
    compute: F.mdaccCll,
    fields: [
      { dom: 'mdacc-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mdacc-b2m', arg: 'b2mBand', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Beta-2-microglobulin (× ULN band)' },
      { dom: 'mdacc-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '×10⁹/L' },
      { dom: 'mdacc-male', arg: 'male', kind: 'bool', required: false, label: 'Male sex' },
      { dom: 'mdacc-rai', arg: 'raiAdvanced', kind: 'bool', required: false, label: 'Advanced Rai stage (III–IV)' },
      { dom: 'mdacc-nodal', arg: 'nodalHigh', kind: 'bool', required: false, label: '≥ 3 involved nodal groups' },
    ],
  },
  {
    id: 'pit-ptcl',
    summary: 'Prognostic Index for PTCL-U (Gallamini 2004): age > 60, elevated LDH, ECOG ≥ 2, and bone-marrow involvement give a 0–4 score mapping to a prognostic group in peripheral T-cell lymphoma.',
    compute: F.pitPtcl,
    fields: [
      { dom: 'pit-age', arg: 'ageOver60', kind: 'bool', required: false, label: 'Age > 60 years (+1)' },
      { dom: 'pit-ldh', arg: 'ldhHigh', kind: 'bool', required: false, label: 'LDH above normal (+1)' },
      { dom: 'pit-ecog', arg: 'ecog2', kind: 'bool', required: false, label: 'ECOG performance status ≥ 2 (+1)' },
      { dom: 'pit-marrow', arg: 'marrow', kind: 'bool', required: false, label: 'Bone-marrow involvement (+1)' },
    ],
  },
  {
    id: 'prima-pi',
    summary: 'PRIMA Prognostic Index (Bachy 2018): beta-2-microglobulin and bone-marrow involvement stratify follicular lymphoma into low, intermediate, and high risk (B2M > 3 mg/L is high).',
    compute: F.primaPi,
    fields: [
      { dom: 'prima-b2m', arg: 'b2m', kind: 'number', required: true, label: 'Beta-2-microglobulin', unit: 'mg/L' },
      { dom: 'prima-marrow', arg: 'marrow', kind: 'bool', required: false, label: 'Bone-marrow involvement' },
    ],
  },
  {
    id: 'durie-salmon',
    summary: 'Durie-Salmon staging (Durie 1975): hemoglobin, serum calcium, lytic bone lesions, and M-protein burden give stage I–III, subclassified A/B by renal function (creatinine).',
    compute: F.durieSalmon,
    fields: [
      { dom: 'ds-hb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'ds-ca', arg: 'calcium', kind: 'number', required: true, label: 'Serum calcium', unit: 'mg/dL' },
      { dom: 'ds-lesions', arg: 'boneLesions', kind: 'number', required: true, label: 'Number of lytic bone lesions' },
      { dom: 'ds-mprot', arg: 'mProtein', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'M-protein burden (low/intermediate/high)' },
      { dom: 'ds-cr', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'lymphocyte-doubling-time',
    summary: 'Lymphocyte doubling time: from two absolute lymphocyte counts and the interval, the projected time to double the lymphocyte count; ≤ 12 months marks a worse CLL prognosis.',
    compute: F.ldt,
    fields: [
      { dom: 'ldt-alc1', arg: 'alc1', kind: 'number', required: true, label: 'Earlier absolute lymphocyte count', unit: '×10⁹/L' },
      { dom: 'ldt-alc2', arg: 'alc2', kind: 'number', required: true, label: 'Later absolute lymphocyte count', unit: '×10⁹/L' },
      { dom: 'ldt-int', arg: 'intervalMonths', kind: 'number', required: true, label: 'Interval between counts', unit: 'months' },
    ],
  },
  {
    id: 'talcott-febrile-neutropenia',
    summary: 'Talcott rules (Talcott 1988): inpatient status at fever onset, serious concurrent comorbidity, and uncontrolled cancer classify febrile-neutropenia patients into groups I–IV, with group IV (outpatient, no comorbidity, controlled cancer) at low complication risk.',
    compute: F.talcott,
    fields: [
      { dom: 'tal-inpt', arg: 'inpatient', kind: 'bool', required: false, label: 'Inpatient at fever onset' },
      { dom: 'tal-comorb', arg: 'comorbidity', kind: 'bool', required: false, label: 'Serious concurrent comorbidity' },
      { dom: 'tal-cancer', arg: 'uncontrolledCancer', kind: 'bool', required: false, label: 'Uncontrolled / progressive cancer' },
    ],
  },
];
