// spec-v183 MCP wave 49: adapters for the six cross-specialty instruments in
// lib/mixed-v227.js — the ICBD 2014 and ISG 1990 Behcet-disease criteria, the
// BATT prehospital-TXA score, the Denver ED Trauma Organ Failure score, the
// Emergency Transfusion Score, and the WHO 2009 dengue classification. dom keys
// mirror views/group-v227.js. BATT, Denver, and ETS take a few numeric vitals;
// every other input is a boolean criterion.

import * as F from '../../lib/mixed-v227.js';

export default [
  {
    id: 'icbd-2014-behcet',
    summary: 'International Criteria for Behcet Disease (ICBD 2014): ocular, oral, and genital lesions (2 points each) plus skin, neurological, vascular, and pathergy items (1 point each); ≥ 4 classifies Behcet disease.',
    compute: F.icbdBehcet,
    fields: [
      { dom: 'icbd-eye', arg: 'ocular', kind: 'bool', required: false, label: 'Ocular lesions (+2)' },
      { dom: 'icbd-oral', arg: 'oral', kind: 'bool', required: false, label: 'Oral aphthosis (+2)' },
      { dom: 'icbd-gen', arg: 'genital', kind: 'bool', required: false, label: 'Genital aphthosis (+2)' },
      { dom: 'icbd-skin', arg: 'skin', kind: 'bool', required: false, label: 'Skin lesions (+1)' },
      { dom: 'icbd-neuro', arg: 'neuro', kind: 'bool', required: false, label: 'Neurological manifestations (+1)' },
      { dom: 'icbd-vasc', arg: 'vascular', kind: 'bool', required: false, label: 'Vascular manifestations (+1)' },
      { dom: 'icbd-path', arg: 'pathergy', kind: 'bool', required: false, label: 'Positive pathergy test (+1)' },
    ],
  },
  {
    id: 'isg-1990-behcet',
    summary: 'International Study Group criteria for Behcet disease (ISG 1990): recurrent oral ulceration plus ≥ 2 of recurrent genital ulceration, eye lesions, skin lesions, and a positive pathergy test.',
    compute: F.isgBehcet,
    fields: [
      { dom: 'isg-oral', arg: 'oralUlceration', kind: 'bool', required: false, label: 'Recurrent oral ulceration' },
      { dom: 'isg-gen', arg: 'genital', kind: 'bool', required: false, label: 'Recurrent genital ulceration' },
      { dom: 'isg-eye', arg: 'eye', kind: 'bool', required: false, label: 'Eye lesions (uveitis / retinal vasculitis)' },
      { dom: 'isg-skin', arg: 'skin', kind: 'bool', required: false, label: 'Skin lesions' },
      { dom: 'isg-path', arg: 'pathergy', kind: 'bool', required: false, label: 'Positive pathergy test' },
    ],
  },
  {
    id: 'batt',
    summary: 'BATT score (Ageron 2019): age, systolic BP, and GCS bands plus respiratory, heart-rate, penetrating-injury, and high-energy items give a 0–27 prehospital trauma score; ≥ 2 has guided tranexamic-acid use.',
    compute: F.batt,
    fields: [
      { dom: 'batt-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'batt-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'batt-gcs', arg: 'gcs', kind: 'number', required: true, label: 'GCS (3–15)' },
      { dom: 'batt-rr', arg: 'rrAbnormal', kind: 'bool', required: false, label: 'Abnormal respiratory rate or SpO₂' },
      { dom: 'batt-hr', arg: 'hrHigh', kind: 'bool', required: false, label: 'Heart rate high' },
      { dom: 'batt-pen', arg: 'penetrating', kind: 'bool', required: false, label: 'Penetrating injury' },
      { dom: 'batt-he', arg: 'highEnergy', kind: 'bool', required: false, label: 'High-energy mechanism' },
    ],
  },
  {
    id: 'denver-ed-tof',
    summary: 'Denver ED Trauma Organ Failure score (Vogel 2014): age ≥ 65, intubation, hematocrit band, SBP < 90, BUN ≥ 30, and WBC ≥ 20,000 give a multiple-organ-failure risk (0–1 low, 2–3 moderate, ≥ 4 high).',
    compute: F.denverEdTof,
    fields: [
      { dom: 'den-hct', arg: 'hematocrit', kind: 'number', required: true, label: 'Hematocrit', unit: '%' },
      { dom: 'den-age', arg: 'ageOver65', kind: 'bool', required: false, label: 'Age ≥ 65' },
      { dom: 'den-intub', arg: 'intubation', kind: 'bool', required: false, label: 'Intubation' },
      { dom: 'den-sbp', arg: 'sbpLow', kind: 'bool', required: false, label: 'Systolic BP < 90 mmHg' },
      { dom: 'den-bun', arg: 'bunHigh', kind: 'bool', required: false, label: 'BUN ≥ 30 mg/dL' },
      { dom: 'den-wbc', arg: 'wbcHigh', kind: 'bool', required: false, label: 'WBC ≥ 20,000' },
    ],
  },
  {
    id: 'ets',
    summary: 'Emergency Transfusion Score (Ruchholtz 2006): systolic BP and age bands plus free intra-abdominal fluid, unstable pelvis, scene arrival, traffic mechanism, and fall > 3 m; ≥ 3 flags a likely need for blood products.',
    compute: F.ets,
    fields: [
      { dom: 'ets-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'ets-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ets-fluid', arg: 'freeFluid', kind: 'bool', required: false, label: 'Free intra-abdominal fluid on FAST' },
      { dom: 'ets-pelvis', arg: 'unstablePelvis', kind: 'bool', required: false, label: 'Unstable pelvic fracture' },
      { dom: 'ets-scene', arg: 'fromScene', kind: 'bool', required: false, label: 'Admission directly from the scene' },
      { dom: 'ets-traffic', arg: 'traffic', kind: 'bool', required: false, label: 'Traffic mechanism' },
      { dom: 'ets-fall', arg: 'fall', kind: 'bool', required: false, label: 'Fall > 3 m' },
    ],
  },
  {
    id: 'who-dengue-2009',
    summary: 'WHO 2009 dengue classification: severity criteria (severe plasma leakage, severe bleeding, organ impairment) and warning signs (abdominal pain, persistent vomiting, fluid accumulation, mucosal bleeding, lethargy, liver enlargement, rising hematocrit with falling platelets) classify severe dengue, dengue with warning signs, or dengue without warning signs.',
    compute: F.whoDengue,
    fields: [
      { dom: 'dg-leak', arg: 'plasmaLeakage', kind: 'bool', required: false, label: 'Severe plasma leakage (shock or respiratory distress)' },
      { dom: 'dg-bleed', arg: 'severeBleeding', kind: 'bool', required: false, label: 'Severe bleeding' },
      { dom: 'dg-organ', arg: 'organImpairment', kind: 'bool', required: false, label: 'Severe organ impairment' },
      { dom: 'dg-abd', arg: 'abdominalPain', kind: 'bool', required: false, label: 'Abdominal pain or tenderness' },
      { dom: 'dg-vom', arg: 'vomiting', kind: 'bool', required: false, label: 'Persistent vomiting' },
      { dom: 'dg-fluid', arg: 'fluidAccumulation', kind: 'bool', required: false, label: 'Clinical fluid accumulation' },
      { dom: 'dg-muc', arg: 'mucosalBleeding', kind: 'bool', required: false, label: 'Mucosal bleeding' },
      { dom: 'dg-leth', arg: 'lethargy', kind: 'bool', required: false, label: 'Lethargy or restlessness' },
      { dom: 'dg-liver', arg: 'liverEnlargement', kind: 'bool', required: false, label: 'Liver enlargement > 2 cm' },
      { dom: 'dg-hct', arg: 'hctPlatelet', kind: 'bool', required: false, label: 'Rising hematocrit with rapid platelet drop' },
    ],
  },
];
