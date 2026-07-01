// spec-v183 MCP wave 13: adapters for the three lib/metabolic-onc-v88.js
// metabolic-emergency / oncology tiles. dom keys mirror views/group-v88.js and
// META.example.fields; arg names mirror the lib signatures (o.glucose, o.ph,
// o.targetAuc, o.pediatric, o.arrhythmia, …). The Calvert GFR cap and the
// Cairo-Bishop age class are enum→flag mappings the renderer performs; the
// adapter reproduces them with a per-field `to`.

import * as F from '../../lib/metabolic-onc-v88.js';

export default [
  {
    id: 'dka-hhs',
    summary: 'DKA / HHS classifier (ADA 2009): grades diabetic ketoacidosis by pH / bicarbonate and screens for the hyperosmolar hyperglycemic state, reporting the anion gap and effective serum osmolality.',
    compute: F.dkaHhs,
    fields: [
      { dom: 'dk-glu', arg: 'glucose', kind: 'number', required: true, label: 'Serum glucose', unit: 'mg/dL' },
      { dom: 'dk-ph', arg: 'ph', kind: 'number', required: true, label: 'Arterial / venous pH' },
      { dom: 'dk-hco3', arg: 'bicarbonate', kind: 'number', required: true, label: 'Serum bicarbonate', unit: 'mEq/L' },
      { dom: 'dk-bohb', arg: 'betaHydroxybutyrate', kind: 'number', label: 'β-hydroxybutyrate', unit: 'mmol/L' },
      { dom: 'dk-mental', arg: 'mental', kind: 'enum', values: ['alert', 'drowsy', 'stupor'], label: 'Mental status' },
      { dom: 'dk-na', arg: 'sodium', kind: 'number', label: 'Serum sodium', unit: 'mEq/L' },
      { dom: 'dk-cl', arg: 'chloride', kind: 'number', label: 'Serum chloride', unit: 'mEq/L' },
    ],
  },
  {
    id: 'calvert-carboplatin',
    summary: 'Calvert carboplatin dose (Calvert, J Clin Oncol 1989): dose (mg) = target AUC × (GFR + 25); the GFR is capped at 125 mL/min per the FDA recommendation when the cap is on.',
    compute: F.calvertCarboplatin,
    fields: [
      { dom: 'cv-auc', arg: 'targetAuc', kind: 'number', required: true, label: 'Target AUC', unit: 'mg·min/mL' },
      { dom: 'cv-gfr', arg: 'gfr', kind: 'number', required: true, label: 'GFR (or Cockcroft-Gault CrCl)', unit: 'mL/min' },
      { dom: 'cv-cap', arg: 'capGfr', kind: 'enum', values: ['on', 'off'], label: 'Cap GFR at 125 mL/min (FDA recommendation)' },
    ],
  },
  {
    id: 'tls-cairo-bishop',
    summary: 'Cairo-Bishop tumor lysis syndrome classifier (Cairo & Bishop, Br J Haematol 2004): counts the laboratory-TLS criteria (uric acid, potassium, phosphate, corrected calcium — by absolute threshold or a 25% change) and grades clinical TLS by creatinine, arrhythmia, and seizure.',
    compute: F.tlsCairoBishop,
    fields: [
      { dom: 'tl-age', arg: 'pediatric', kind: 'enum', values: ['adult', 'pediatric'], required: true, label: 'Age class (sets the phosphate threshold)', to: (v) => v === 'pediatric' },
      { dom: 'tl-ua', arg: 'uricAcid', kind: 'number', label: 'Uric acid', unit: 'mg/dL' },
      { dom: 'tl-uab', arg: 'uricBaseline', kind: 'number', label: 'Uric acid baseline', unit: 'mg/dL' },
      { dom: 'tl-k', arg: 'potassium', kind: 'number', label: 'Potassium', unit: 'mEq/L' },
      { dom: 'tl-kb', arg: 'potassiumBaseline', kind: 'number', label: 'Potassium baseline', unit: 'mEq/L' },
      { dom: 'tl-phos', arg: 'phosphate', kind: 'number', label: 'Phosphate', unit: 'mg/dL' },
      { dom: 'tl-phosb', arg: 'phosphateBaseline', kind: 'number', label: 'Phosphate baseline', unit: 'mg/dL' },
      { dom: 'tl-ca', arg: 'calcium', kind: 'number', label: 'Corrected calcium', unit: 'mg/dL' },
      { dom: 'tl-cab', arg: 'calciumBaseline', kind: 'number', label: 'Calcium baseline', unit: 'mg/dL' },
      { dom: 'tl-alb', arg: 'albumin', kind: 'number', label: 'Albumin (for calcium correction)', unit: 'g/dL' },
      { dom: 'tl-cr', arg: 'creatinine', kind: 'number', label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'tl-uln', arg: 'creatinineUln', kind: 'number', label: 'Creatinine upper limit of normal', unit: 'mg/dL' },
      { dom: 'tl-arr', arg: 'arrhythmia', kind: 'enum', values: ['none', 'present', 'life-threatening', 'sudden-death'], label: 'Cardiac arrhythmia' },
      { dom: 'tl-sz', arg: 'seizure', kind: 'enum', values: ['none', 'single', 'poorly-controlled', 'prolonged'], label: 'Seizure' },
    ],
  },
];
