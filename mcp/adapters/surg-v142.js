// MCP wave 12: adapters for lib/surg-v142.js — the POSSUM and P-POSSUM
// surgical morbidity/mortality models, the SORT and Surgical Risk Scale
// preoperative-mortality scores, the Goldman Cardiac Risk Index, and the
// Wilson difficult-intubation score. dom keys mirror views/group-v142.js.

import * as F from '../../lib/surg-v142.js';

// The 18 shared POSSUM grade variables, each an integer point grade whose
// select value the lib coerces and range-checks; the dom prefix differs by tile
// (ps- for POSSUM, pp- for P-POSSUM) but the arg names are identical.
const POSSUM_VARS = [
  ['age', 'Age'], ['cardiac', 'Cardiac status'], ['respiratory', 'Respiratory status'],
  ['sbp', 'Systolic blood pressure'], ['pulse', 'Pulse'], ['gcs', 'Glasgow Coma Score'],
  ['hb', 'Hemoglobin'], ['wcc', 'White-cell count'], ['urea', 'Urea'],
  ['sodium', 'Sodium'], ['potassium', 'Potassium'], ['ecg', 'ECG'],
  ['opSeverity', 'Operative severity'], ['procedures', 'Number of procedures'],
  ['bloodLoss', 'Blood loss'], ['soiling', 'Peritoneal soiling'],
  ['malignancy', 'Malignancy'], ['urgency', 'Urgency'],
];
const possumFields = (prefix) => POSSUM_VARS.map(([arg, label]) => ({
  dom: `${prefix}-${arg}`, arg, kind: 'number', required: true, label: `${label} (point grade)`,
}));

export default [
  {
    id: 'possum',
    summary: 'POSSUM — Physiological and Operative Severity Score: 12 physiological + 6 operative variables (each graded 1/2/4/8) drive logistic equations for predicted 30-day morbidity and mortality.',
    compute: F.possum,
    fields: possumFields('ps'),
  },
  {
    id: 'p-possum',
    summary: 'P-POSSUM — the Portsmouth recalibration of POSSUM: the identical 18 variables with a better-calibrated mortality equation, reported alongside the original POSSUM mortality.',
    compute: F.pPossum,
    fields: possumFields('pp'),
  },
  {
    id: 'goldman-cardiac-risk',
    summary: 'Goldman Cardiac Risk Index (0–53): nine weighted clinical factors mapping to Class I–IV with the source’s per-class cardiac-complication rate for noncardiac surgery.',
    compute: F.goldmanCardiacRisk,
    fields: [
      { dom: 'gold-s3', arg: 's3jvd', kind: 'bool', required: false, label: 'Third heart sound or JVD (+11)' },
      { dom: 'gold-mi', arg: 'mi6mo', kind: 'bool', required: false, label: 'MI within 6 months (+10)' },
      { dom: 'gold-pvc', arg: 'pvc', kind: 'bool', required: false, label: '> 5 PVCs per minute (+7)' },
      { dom: 'gold-rhythm', arg: 'nonsinus', kind: 'bool', required: false, label: 'Rhythm other than sinus, or PACs (+7)' },
      { dom: 'gold-age', arg: 'age70', kind: 'bool', required: false, label: 'Age over 70 years (+5)' },
      { dom: 'gold-emerg', arg: 'emergency', kind: 'bool', required: false, label: 'Emergency operation (+4)' },
      { dom: 'gold-intraop', arg: 'intraop', kind: 'bool', required: false, label: 'Intraperitoneal, intrathoracic, or aortic operation (+3)' },
      { dom: 'gold-as', arg: 'aorticstenosis', kind: 'bool', required: false, label: 'Important aortic stenosis (+3)' },
      { dom: 'gold-status', arg: 'poorstatus', kind: 'bool', required: false, label: 'Poor general medical status (+3)' },
    ],
  },
  {
    id: 'wilson-airway',
    summary: 'Wilson Risk Sum Score (0–10) for difficult intubation: body weight, head/neck movement, jaw movement, receding mandible, and buck teeth each scored 0–2; ≥ 2 is the common sensitive screen.',
    compute: F.wilsonAirway,
    fields: [
      { dom: 'wil-weight', arg: 'weight', kind: 'number', required: true, label: 'Body weight (0–2)', values: ['0', '1', '2'] },
      { dom: 'wil-headneck', arg: 'headneck', kind: 'number', required: true, label: 'Head and neck movement (0–2)', values: ['0', '1', '2'] },
      { dom: 'wil-jaw', arg: 'jaw', kind: 'number', required: true, label: 'Jaw movement (0–2)', values: ['0', '1', '2'] },
      { dom: 'wil-mandible', arg: 'mandible', kind: 'number', required: true, label: 'Receding mandible (0–2)', values: ['0', '1', '2'] },
      { dom: 'wil-teeth', arg: 'teeth', kind: 'number', required: true, label: 'Buck teeth (0–2)', values: ['0', '1', '2'] },
    ],
  },
  {
    id: 'surgical-risk-scale',
    summary: 'Surgical Risk Scale (3–14): CEPOD operative urgency + ASA grade + BUPA operative-magnitude grade; a score of 8 or more is a common high-risk threshold.',
    compute: F.surgicalRiskScale,
    fields: [
      { dom: 'srs-cepod', arg: 'cepod', kind: 'number', required: true, label: 'CEPOD urgency (1–4)', values: ['1', '2', '3', '4'] },
      { dom: 'srs-asa', arg: 'asa', kind: 'number', required: true, label: 'ASA grade (1–5)', values: ['1', '2', '3', '4', '5'] },
      { dom: 'srs-bupa', arg: 'bupa', kind: 'number', required: true, label: 'BUPA operative-magnitude grade (1–5)', values: ['1', '2', '3', '4', '5'] },
    ],
  },
];
