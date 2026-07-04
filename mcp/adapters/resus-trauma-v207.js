// spec-v183 MCP wave 29: adapters for the three resuscitation / early-warning
// instruments in lib/resus-trauma-v207.js — the BLS/ALS Termination-of-
// Resuscitation rules, the Rapid Emergency Medicine Score (REMS), and the
// Cardiac Arrest Risk Triage (CART) score. dom keys mirror views/group-v207.js.
// The TOR rule set is an enum; every other TOR input is a boolean arrest fact,
// and REMS and CART take plain numeric vitals.

import * as F from '../../lib/resus-trauma-v207.js';

export default [
  {
    id: 'tor-rule',
    summary: 'Termination-of-Resuscitation rules (Morrison 2006 BLS / 2007 ALS): field decision support for non-traumatic out-of-hospital cardiac arrest; TOR may be considered when none of the survival-favoring facts (EMS-witnessed, ROSC, shock, and for ALS bystander-witnessed / bystander CPR) is present.',
    compute: F.torRule,
    fields: [
      { dom: 'tor-rule', arg: 'rule', kind: 'enum', values: ['bls', 'als'], required: true, label: 'Rule (BLS 3-criteria or ALS 5-criteria)' },
      { dom: 'tor-ems', arg: 'emsWitnessed', kind: 'bool', required: false, label: 'Arrest witnessed by EMS' },
      { dom: 'tor-rosc', arg: 'rosc', kind: 'bool', required: false, label: 'ROSC before transport' },
      { dom: 'tor-shock', arg: 'shock', kind: 'bool', required: false, label: 'Shock delivered' },
      { dom: 'tor-bwit', arg: 'bystanderWitnessed', kind: 'bool', required: false, label: 'Arrest witnessed by a bystander (ALS only)' },
      { dom: 'tor-bcpr', arg: 'bystanderCpr', kind: 'bool', required: false, label: 'Bystander CPR provided (ALS only)' },
    ],
  },
  {
    id: 'rems',
    summary: 'Rapid Emergency Medicine Score (Olsson 2004): an abbreviated-APACHE-II in-hospital-mortality score needing no labs — age, mean arterial pressure, heart rate, respiratory rate, SpO₂, and GCS give a 0–26 score (low < 6, medium 6–13, high > 13).',
    compute: F.rems,
    fields: [
      { dom: 'rems-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'rems-map', arg: 'map', kind: 'number', required: true, label: 'Mean arterial pressure', unit: 'mmHg' },
      { dom: 'rems-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'rems-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'rems-spo2', arg: 'spo2', kind: 'number', required: true, label: 'SpO₂', unit: '%' },
      { dom: 'rems-gcs', arg: 'gcs', kind: 'number', required: true, label: 'Glasgow Coma Scale (3–15)' },
    ],
  },
  {
    id: 'cart-score',
    summary: 'Cardiac Arrest Risk Triage score (Churpek 2012): a ward early-warning model from respiratory rate, heart rate, diastolic BP, and age banded to 0–57; > 20 marks markedly elevated risk of ward cardiac arrest within 48 hours.',
    compute: F.cartScore,
    fields: [
      { dom: 'cart-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
      { dom: 'cart-hr', arg: 'hr', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'cart-dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic blood pressure', unit: 'mmHg' },
      { dom: 'cart-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
    ],
  },
];
