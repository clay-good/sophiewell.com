// spec-v183 MCP wave 54: adapters for the two thrombosis/coagulation bedside scores
// in lib/coagscore-v232.js — the Villalta post-thrombotic-syndrome scale and the
// ISTH sepsis-induced coagulopathy (SIC) score. dom keys mirror views/group-v232.js.
// Villalta's 11 symptom/sign items each carry a 0-3 severity (numeric select) and
// default to 0 when omitted, so they are optional; the venous-ulcer flag is a
// checkbox. SIC's three components are numeric 0-2 selects.

import * as F from '../../lib/coagscore-v232.js';

export default [
  {
    id: 'villalta',
    summary: 'Villalta scale (Kahn 2009): grades post-thrombotic syndrome from 5 symptoms and 6 signs (each 0-3, max 33) plus a venous-ulcer override — 0-4 none, 5-9 mild, 10-14 moderate, >= 15 or ulcer severe.',
    compute: F.villalta,
    fields: [
      { dom: 'vil-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain (0-3)' },
      { dom: 'vil-cramps', arg: 'cramps', kind: 'number', required: false, label: 'Cramps (0-3)' },
      { dom: 'vil-heavy', arg: 'heaviness', kind: 'number', required: true, label: 'Heaviness (0-3)' },
      { dom: 'vil-par', arg: 'paresthesia', kind: 'number', required: false, label: 'Paresthesia (0-3)' },
      { dom: 'vil-pru', arg: 'pruritus', kind: 'number', required: false, label: 'Pruritus (0-3)' },
      { dom: 'vil-edema', arg: 'edema', kind: 'number', required: true, label: 'Pretibial edema (0-3)' },
      { dom: 'vil-ind', arg: 'induration', kind: 'number', required: true, label: 'Skin induration (0-3)' },
      { dom: 'vil-hyp', arg: 'hyperpigmentation', kind: 'number', required: true, label: 'Hyperpigmentation (0-3)' },
      { dom: 'vil-red', arg: 'redness', kind: 'number', required: false, label: 'Redness (0-3)' },
      { dom: 'vil-ect', arg: 'ectasia', kind: 'number', required: true, label: 'Venous ectasia (0-3)' },
      { dom: 'vil-comp', arg: 'compressionPain', kind: 'number', required: false, label: 'Pain on calf compression (0-3)' },
      { dom: 'vil-ulcer', arg: 'ulcer', kind: 'bool', required: false, label: 'Venous ulcer (open or healed)' },
    ],
  },
  {
    id: 'sic',
    summary: 'ISTH sepsis-induced coagulopathy score (Iba 2019): platelet count, PT-INR, and total SOFA each scored 0-2; a total >= 4 meets the definition of sepsis-induced coagulopathy.',
    compute: F.sic,
    fields: [
      { dom: 'sic-plt', arg: 'platelet', kind: 'number', required: true, label: 'Platelet count band (0-2)' },
      { dom: 'sic-inr', arg: 'inr', kind: 'number', required: true, label: 'PT-INR band (0-2)' },
      { dom: 'sic-sofa', arg: 'sofa', kind: 'number', required: true, label: 'Total SOFA band (0-2)' },
    ],
  },
];
