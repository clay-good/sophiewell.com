// spec-v183 MCP wave 5: adapters for the six lib/cardio-v104.js wide-complex-
// tachycardia algorithms and syncope-risk scores. dom keys mirror
// views/group-v104.js and META.example.fields; arg names mirror the lib
// signatures. The Brugada / Vereckei step flags and the syncope criteria are
// bools (the lib's onFlag normalizes); ADD-RS d-dimer is a number.

import * as F from '../../lib/cardio-v104.js';

export default [
  {
    id: 'brugada-vt',
    summary: 'Brugada algorithm (1991) for wide-complex tachycardia: four sequential steps (absent RS in all precordial leads, R-to-S > 100 ms, AV dissociation, morphologic VT criteria); the first positive step diagnoses ventricular tachycardia, else SVT with aberrancy.',
    compute: F.brugadaVt,
    fields: [
      { dom: 'br-rs', arg: 'absentRs', kind: 'bool', label: 'Step 1: absence of an RS complex in all precordial leads' },
      { dom: 'br-int', arg: 'rsInterval', kind: 'bool', label: 'Step 2: R-to-S interval > 100 ms in any precordial lead' },
      { dom: 'br-av', arg: 'avDissociation', kind: 'bool', label: 'Step 3: AV dissociation' },
      { dom: 'br-morph', arg: 'morphology', kind: 'bool', label: 'Step 4: morphologic VT criteria in V1-V2 and V6' },
    ],
  },
  {
    id: 'vereckei-avr',
    summary: 'Vereckei aVR algorithm (2008) for wide-complex tachycardia: four steps in lead aVR (initial dominant R, initial r/q width > 40 ms, notch on a negative-onset QRS, vi/vt <= 1); the first positive step diagnoses ventricular tachycardia.',
    compute: F.vereckeiAvr,
    fields: [
      { dom: 've-r', arg: 'initialR', kind: 'bool', label: 'Step 1: initial dominant R wave in aVR' },
      { dom: 've-w', arg: 'initialWidth', kind: 'bool', label: 'Step 2: initial r or q wave > 40 ms in aVR' },
      { dom: 've-notch', arg: 'notch', kind: 'bool', label: 'Step 3: notch on the descending limb of a negative-onset QRS' },
      { dom: 've-vivt', arg: 'viVt', kind: 'bool', label: 'Step 4: ventricular activation-velocity ratio vi/vt <= 1' },
    ],
  },
  {
    id: 'add-rs',
    summary: 'Aortic Dissection Detection Risk Score (2010 AHA/ACC): one point each for high-risk predisposing conditions, pain features, and exam findings; ADD-RS 0-3 risk-stratifies acute aortic syndrome, with an optional d-dimer for the ADD-RS/D-dimer pathway.',
    compute: F.addRs,
    fields: [
      { dom: 'add-pre', arg: 'predisposing', kind: 'bool', label: 'High-risk predisposing conditions' },
      { dom: 'add-pain', arg: 'pain', kind: 'bool', label: 'High-risk pain features' },
      { dom: 'add-exam', arg: 'exam', kind: 'bool', label: 'High-risk exam features' },
      { dom: 'add-dd', arg: 'dDimer', kind: 'number', label: 'D-dimer (optional)', unit: 'ng/mL' },
    ],
  },
  {
    id: 'rose-syncope',
    summary: 'ROSE rule (Reed 2010) for syncope: any of BNP >= 300, bradycardia <= 50, fecal occult blood, anemia (Hgb <= 9 g/dL), chest pain, ECG Q wave, or SpO2 <= 94% flags high risk of 1-month serious outcome or death.',
    compute: F.roseSyncope,
    fields: [
      { dom: 'rose-bnp', arg: 'bnp', kind: 'bool', label: 'BNP >= 300 pg/mL' },
      { dom: 'rose-brady', arg: 'bradycardia', kind: 'bool', label: 'Bradycardia <= 50 bpm' },
      { dom: 'rose-rectal', arg: 'rectal', kind: 'bool', label: 'Fecal occult blood on rectal exam' },
      { dom: 'rose-anemia', arg: 'anemia', kind: 'bool', label: 'Anemia (hemoglobin <= 9.0 g/dL)' },
      { dom: 'rose-cp', arg: 'chestPain', kind: 'bool', label: 'Chest pain with syncope' },
      { dom: 'rose-q', arg: 'qWave', kind: 'bool', label: 'ECG Q wave (not lead III)' },
      { dom: 'rose-sat', arg: 'saturation', kind: 'bool', label: 'Oxygen saturation <= 94% on room air' },
    ],
  },
  {
    id: 'egsys',
    summary: 'EGSYS score (Del Rosso 2008): abnormal ECG / heart disease (+3), palpitations (+4), syncope on effort (+3) or supine (+2), precipitating factors (-1), autonomic prodromes (-1); a total >= 3 suggests cardiac syncope.',
    compute: F.egsys,
    fields: [
      { dom: 'eg-ecg', arg: 'abnormalEcgOrHeartDisease', kind: 'bool', label: 'Abnormal ECG and/or heart disease' },
      { dom: 'eg-palp', arg: 'palpitations', kind: 'bool', label: 'Palpitations before syncope' },
      { dom: 'eg-effort', arg: 'effort', kind: 'bool', label: 'Syncope during effort' },
      { dom: 'eg-supine', arg: 'supine', kind: 'bool', label: 'Syncope in supine position' },
      { dom: 'eg-precip', arg: 'precipitating', kind: 'bool', label: 'Precipitating / predisposing factors' },
      { dom: 'eg-auto', arg: 'autonomicProdrome', kind: 'bool', label: 'Autonomic prodromes (nausea / vomiting)' },
    ],
  },
  {
    id: 'oesil',
    summary: 'OESIL risk score (Colivicchi 2003): one point each for age > 65, cardiovascular history, syncope without prodrome, and an abnormal ECG; the 0-4 total maps to rising 12-month total mortality.',
    compute: F.oesil,
    fields: [
      { dom: 'oe-age', arg: 'age65', kind: 'bool', label: 'Age > 65 years' },
      { dom: 'oe-cv', arg: 'cvHistory', kind: 'bool', label: 'Cardiovascular disease in history' },
      { dom: 'oe-prod', arg: 'noProdrome', kind: 'bool', label: 'Syncope without prodrome' },
      { dom: 'oe-ecg', arg: 'abnormalEcg', kind: 'bool', label: 'Abnormal electrocardiogram' },
    ],
  },
];
