// spec-v183 MCP wave 35: adapters for the five acute-injury / ED decision
// instruments in lib/acute-injury-v213.js — the HEART Pathway early-discharge
// rule, the Ottawa Heart Failure Risk Scale, Light's criteria for pleural
// exudate/transudate, and the Baux and revised-Baux burn-mortality scores. dom
// keys mirror views/group-v213.js. The HEART Pathway and Ottawa scale are
// boolean item panels (with a numeric HEART sub-score); Light's criteria and the
// Baux scores take plain numeric labs / measurements plus a boolean inhalation
// flag.

import * as F from '../../lib/acute-injury-v213.js';

export default [
  {
    id: 'heart-pathway',
    summary: 'HEART Pathway (Mahler 2015): the HEART score plus 0- and 3-hour troponins; a HEART ≤ 3 with both troponins non-elevated identifies an early-discharge candidate (~0.9–2% 30-day MACE).',
    compute: F.heartPathway,
    fields: [
      { dom: 'hp-heart', arg: 'heartScore', kind: 'number', required: true, label: 'HEART score (0–10)' },
      { dom: 'hp-trop0', arg: 'trop0', kind: 'bool', required: false, label: '0-hour troponin elevated' },
      { dom: 'hp-trop3', arg: 'trop3', kind: 'bool', required: false, label: '3-hour troponin elevated' },
    ],
  },
  {
    id: 'ottawa-heart-failure',
    summary: 'Ottawa Heart Failure Risk Scale (Stiell 2013): ten weighted history, exam, and lab items give a 0–15 score for ED heart-failure patients; serious-adverse-event risk rises across the range and the authors suggest an admission threshold above 1.',
    compute: F.ottawaHf,
    fields: [
      { dom: 'ohf-stroke', arg: 'strokeTia', kind: 'bool', required: false, label: 'History of stroke or TIA (+1)' },
      { dom: 'ohf-intub', arg: 'intubation', kind: 'bool', required: false, label: 'Prior intubation for respiratory distress (+2)' },
      { dom: 'ohf-hr-arr', arg: 'hrArrival', kind: 'bool', required: false, label: 'Heart rate ≥ 110 on ED arrival (+2)' },
      { dom: 'ohf-spo2', arg: 'spo2', kind: 'bool', required: false, label: 'SaO₂ < 90% on arrival (+1)' },
      { dom: 'ohf-hr-walk', arg: 'hrWalk', kind: 'bool', required: false, label: 'Heart rate ≥ 110 on 3-minute walk / too ill to walk (+1)' },
      { dom: 'ohf-ecg', arg: 'ischemia', kind: 'bool', required: false, label: 'New ischemic changes on ECG (+2)' },
      { dom: 'ohf-urea', arg: 'urea', kind: 'bool', required: false, label: 'Serum urea ≥ 12 mmol/L (+1)' },
      { dom: 'ohf-co2', arg: 'co2', kind: 'bool', required: false, label: 'Serum CO₂ ≥ 35 mmol/L (+2)' },
      { dom: 'ohf-trop', arg: 'troponin', kind: 'bool', required: false, label: 'Troponin elevated to MI level (+2)' },
      { dom: 'ohf-bnp', arg: 'ntprobnp', kind: 'bool', required: false, label: 'NT-proBNP ≥ 5000 ng/L (+1)' },
    ],
  },
  {
    id: 'light-criteria',
    summary: "Light's criteria (Light 1972): a pleural effusion is an exudate if the pleural/serum protein ratio > 0.5, the pleural/serum LDH ratio > 0.6, or pleural LDH exceeds two-thirds the upper limit of normal serum LDH; none met means a transudate.",
    compute: F.lightCriteria,
    fields: [
      { dom: 'lc-pprot', arg: 'pleuralProtein', kind: 'number', required: true, label: 'Pleural fluid total protein', unit: 'g/dL' },
      { dom: 'lc-sprot', arg: 'serumProtein', kind: 'number', required: true, label: 'Serum total protein', unit: 'g/dL' },
      { dom: 'lc-pldh', arg: 'pleuralLdh', kind: 'number', required: true, label: 'Pleural fluid LDH', unit: 'IU/L' },
      { dom: 'lc-sldh', arg: 'serumLdh', kind: 'number', required: true, label: 'Serum LDH', unit: 'IU/L' },
      { dom: 'lc-uln', arg: 'serumLdhUln', kind: 'number', required: true, label: 'Upper limit of normal for serum LDH', unit: 'IU/L' },
    ],
  },
  {
    id: 'baux-score',
    summary: 'Baux score (Baux 1961): a burn mortality estimate equal to age + burned %TBSA; a value near 100 was near-universally fatal in the pre-modern era, with modern burn care shifting survivable thresholds higher.',
    compute: F.bauxScore,
    fields: [
      { dom: 'bx-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'bx-tbsa', arg: 'tbsa', kind: 'number', required: true, label: 'Burned total body surface area', unit: '%TBSA' },
    ],
  },
  {
    id: 'revised-baux',
    summary: 'Revised Baux score (Osler 2010): age + burned %TBSA + 17 for inhalation injury; the LD50 in the best modern burn units is a score of ~130–140.',
    compute: F.revisedBaux,
    fields: [
      { dom: 'rbx-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'rbx-tbsa', arg: 'tbsa', kind: 'number', required: true, label: 'Burned total body surface area', unit: '%TBSA' },
      { dom: 'rbx-inh', arg: 'inhalation', kind: 'bool', required: false, label: 'Inhalation injury present (+17)' },
    ],
  },
];
