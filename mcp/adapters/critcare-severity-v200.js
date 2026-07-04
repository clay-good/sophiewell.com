// spec-v183 MCP wave 22: adapters for the four critical-care severity /
// acid-base instruments in lib/critcare-severity-v200.js — OASIS (Oxford Acute
// Severity of Illness Score), LODS (Logistic Organ Dysfunction System), the
// delta gap / delta ratio, and the APPS score for ARDS outcome. dom keys mirror
// views/group-v200.js. OASIS and LODS take worst-24h physiology as numbers plus
// a couple of boolean flags; delta gap's albumin and reference gaps are optional
// numeric overrides.

import * as F from '../../lib/critcare-severity-v200.js';

export default [
  {
    id: 'oasis',
    summary: 'OASIS Oxford Acute Severity of Illness Score (Johnson 2013): pre-ICU stay, age, GCS, heart rate, MAP, respiratory rate, temperature, urine output, mechanical ventilation, and elective-surgical status map to a score with predicted in-hospital mortality.',
    compute: F.oasis,
    fields: [
      { dom: 'oasis-preicu', arg: 'preIcuHours', kind: 'number', required: true, label: 'Pre-ICU length of stay', unit: 'hours' },
      { dom: 'oasis-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'oasis-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3–15)' },
      { dom: 'oasis-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'oasis-map', arg: 'map', kind: 'number', required: true, label: 'Mean arterial pressure', unit: 'mmHg' },
      { dom: 'oasis-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'oasis-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', unit: '°C' },
      { dom: 'oasis-urine', arg: 'urine', kind: 'number', required: true, label: 'Urine output', unit: 'mL/24 h' },
      { dom: 'oasis-vent', arg: 'mechVent', kind: 'bool', required: false, label: 'On mechanical ventilation (+9)' },
      { dom: 'oasis-elective', arg: 'elective', kind: 'bool', required: false, label: 'Elective surgical admission (leave unchecked for urgent / emergency / medical, +6)' },
    ],
  },
  {
    id: 'lods',
    summary: 'LODS Logistic Organ Dysfunction System (Le Gall 1996): the worst first-24-hour value across six organ systems (neuro, cardiovascular, renal, hematologic, hepatic, pulmonary) maps to 0/1/3/5 points driving predicted hospital mortality.',
    compute: F.lods,
    fields: [
      { dom: 'lods-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3–15)' },
      { dom: 'lods-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'lods-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'lods-bun', arg: 'bun', kind: 'number', required: true, label: 'BUN', unit: 'mg/dL' },
      { dom: 'lods-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Creatinine', unit: 'mg/dL' },
      { dom: 'lods-urine', arg: 'urineL', kind: 'number', required: true, label: 'Urine output', unit: 'L/day' },
      { dom: 'lods-wbc', arg: 'wbc', kind: 'number', required: true, label: 'WBC', unit: '×10⁹/L' },
      { dom: 'lods-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelets', unit: '×10⁹/L' },
      { dom: 'lods-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Bilirubin', unit: 'mg/dL' },
      { dom: 'lods-vent', arg: 'mechVent', kind: 'bool', required: false, label: 'On mechanical ventilation / CPAP' },
      { dom: 'lods-pf', arg: 'pf', kind: 'number', required: false, label: 'PaO₂/FiO₂ ratio (if ventilated)' },
      { dom: 'lods-ptlow', arg: 'ptLow', kind: 'bool', required: false, label: 'Prothrombin < 25% of standard (> 3 s above control)' },
    ],
  },
  {
    id: 'delta-gap',
    summary: 'Delta gap / delta ratio (acid-base): (anion gap − normal AG) − (normal HCO₃ − measured HCO₃) and the ratio of AG excess to bicarbonate deficit, disclosing a concurrent non-anion-gap or metabolic-alkalosis component.',
    compute: F.deltaGap,
    fields: [
      { dom: 'dg-na', arg: 'na', kind: 'number', required: true, label: 'Sodium', unit: 'mEq/L' },
      { dom: 'dg-cl', arg: 'cl', kind: 'number', required: true, label: 'Chloride', unit: 'mEq/L' },
      { dom: 'dg-hco3', arg: 'hco3', kind: 'number', required: true, label: 'Bicarbonate', unit: 'mEq/L' },
      { dom: 'dg-alb', arg: 'albumin', kind: 'number', required: false, label: 'Albumin (optional, for corrected AG)', unit: 'g/dL' },
      { dom: 'dg-nag', arg: 'normalAg', kind: 'number', required: false, label: 'Normal anion gap (default 12)' },
      { dom: 'dg-nhco3', arg: 'normalHco3', kind: 'number', required: false, label: 'Normal bicarbonate (default 24)' },
    ],
  },
  {
    id: 'apps-ards',
    summary: 'APPS score for ARDS outcome (Villar 2016): age, PaO₂/FiO₂ ratio, and plateau pressure at 24 h each scored 1–3 sum to 3–9, banding into low, intermediate, and high mortality tiers.',
    compute: F.appsArds,
    fields: [
      { dom: 'apps-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'apps-pf', arg: 'pf', kind: 'number', required: true, label: 'PaO₂/FiO₂ ratio', unit: 'mmHg' },
      { dom: 'apps-plateau', arg: 'plateau', kind: 'number', required: true, label: 'Plateau pressure', unit: 'cmH₂O' },
    ],
  },
];
