// MCP wave 12: adapters for lib/rheum-periop-v89.js — the DAS28 rheumatoid
// activity score, the King's College Criteria (acetaminophen pathway), the ASA
// physical-status class, and the Surgical Apgar Score. dom keys mirror
// views/group-v15.js.

import * as F from '../../lib/rheum-periop-v89.js';

export default [
  {
    id: 'das28',
    summary: 'DAS28 rheumatoid-arthritis disease-activity score from the 28-joint tender and swollen counts, the ESR or CRP marker (form-specific), and the patient global VAS; banded by EULAR cutoffs.',
    compute: F.das28,
    fields: [
      { dom: 'da-tjc', arg: 'tjc28', kind: 'number', required: true, label: '28-joint tender count' },
      { dom: 'da-sjc', arg: 'sjc28', kind: 'number', required: true, label: '28-joint swollen count' },
      { dom: 'da-form', arg: 'form', kind: 'enum', values: ['esr', 'crp'], required: false, label: 'Inflammatory-marker form' },
      { dom: 'da-esr', arg: 'esr', kind: 'number', required: false, label: 'ESR (if form = esr)', unit: 'mm/hr' },
      { dom: 'da-crp', arg: 'crp', kind: 'number', required: false, label: 'CRP (if form = crp)', unit: 'mg/L' },
      { dom: 'da-gh', arg: 'globalHealth', kind: 'number', required: true, label: 'Patient global health VAS (0–100)' },
    ],
  },
  {
    id: 'kings-college',
    summary: 'King’s College Criteria for transplant referral in acetaminophen-induced acute liver failure: the arterial pH limb, the INR/creatinine/encephalopathy three-part limb, or the modified lactate limb.',
    compute: F.kingsCollege,
    fields: [
      { dom: 'kc-ph', arg: 'ph', kind: 'number', required: false, label: 'Arterial pH (after resuscitation)' },
      { dom: 'kc-lac', arg: 'lactate', kind: 'number', required: false, label: 'Arterial lactate', unit: 'mmol/L' },
      { dom: 'kc-lactime', arg: 'lactateTiming', kind: 'enum', values: ['early', 'resuscitated'], required: false, label: 'Lactate timing' },
      { dom: 'kc-inr', arg: 'inr', kind: 'number', required: false, label: 'INR' },
      { dom: 'kc-pt', arg: 'pt', kind: 'number', required: false, label: 'Prothrombin time', unit: 's' },
      { dom: 'kc-cr', arg: 'creatinine', kind: 'number', required: false, label: 'Creatinine' },
      { dom: 'kc-crunit', arg: 'creatinineUnit', kind: 'enum', values: ['mg/dl', 'umol/l'], required: false, label: 'Creatinine unit' },
      { dom: 'kc-enc', arg: 'encephalopathy', kind: 'enum', values: ['yes', 'no'], required: false, label: 'Grade III/IV encephalopathy' },
    ],
  },
  {
    id: 'asa-ps',
    summary: 'ASA Physical Status classification (I–VI) with the optional emergency (E) modifier, which is not assignable to class I or VI.',
    compute: F.asaPs,
    fields: [
      { dom: 'as-class', arg: 'asaClass', kind: 'number', required: true, label: 'ASA class (1–6)' },
      { dom: 'as-emerg', arg: 'emergency', kind: 'bool', required: false, label: 'Emergency (E modifier)' },
    ],
  },
  {
    id: 'surgical-apgar',
    summary: 'Surgical Apgar Score (0–10) from estimated blood loss and the lowest intraoperative mean arterial pressure and heart rate; ≤ 4 flags high major-complication/death risk.',
    compute: F.surgicalApgar,
    fields: [
      { dom: 'sa-ebl', arg: 'ebl', kind: 'number', required: true, label: 'Estimated blood loss', unit: 'mL' },
      { dom: 'sa-map', arg: 'lowestMap', kind: 'number', required: true, label: 'Lowest MAP', unit: 'mmHg' },
      { dom: 'sa-hr', arg: 'lowestHr', kind: 'number', required: true, label: 'Lowest heart rate', unit: 'bpm' },
    ],
  },
];
