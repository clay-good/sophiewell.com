// spec-v183 MCP wave: adapters for the four radiologic measurements & scores in
// lib/radmeasure-v253.js — NASCET carotid stenosis, the Helsinki CT score (TBI),
// the Genant vertebral-fracture grade, and testicular volume. dom keys mirror
// views/group-v253.js.

import * as F from '../../lib/radmeasure-v253.js';

export default [
  {
    id: 'nascet-carotid-stenosis',
    summary: 'NASCET carotid stenosis (NEJM 1991): % stenosis = (1 - narrowest residual lumen / normal distal ICA diameter) x 100; >= 70% is severe.',
    compute: F.nascetCarotidStenosis,
    fields: [
      { dom: 'ns-narrow', arg: 'narrowest', kind: 'number', required: true, label: 'Narrowest residual lumen', unit: 'mm' },
      { dom: 'ns-distal', arg: 'distal', kind: 'number', required: true, label: 'Normal distal ICA diameter', unit: 'mm' },
    ],
  },
  {
    id: 'helsinki-ct-score',
    summary: 'Helsinki CT score (Raj 2014): mass lesion type + volume + intraventricular hemorrhage + suprasellar cisterns; a higher score predicts higher TBI mortality.',
    compute: F.helsinkiCtScore,
    fields: [
      { dom: 'hel-mass', arg: 'massType', kind: 'number', required: true, label: 'Mass lesion type' },
      { dom: 'hel-size', arg: 'largeMass', kind: 'bool', required: false, label: 'Mass lesion volume > 25 mL (+2)' },
      { dom: 'hel-ivh', arg: 'ivh', kind: 'bool', required: true, label: 'Intraventricular hemorrhage (+3)' },
      { dom: 'hel-cist', arg: 'cisterns', kind: 'number', required: true, label: 'Suprasellar cisterns' },
    ],
  },
  {
    id: 'genant-vertebral-fracture',
    summary: 'Genant semiquantitative vertebral-fracture grade (1993): grade 0-3 by vertebral height loss (< 20%, 20-25%, 26-40%, > 40%).',
    compute: F.genantVertebralFracture,
    fields: [
      { dom: 'ge-loss', arg: 'heightLoss', kind: 'number', required: true, label: 'Vertebral height loss', unit: '%' },
    ],
  },
  {
    id: 'testicular-volume',
    summary: 'Testicular volume (Lambert formula) = length x width x height (cm) x 0.71; normal adult ~12-30 mL.',
    compute: F.testicularVolume,
    fields: [
      { dom: 'tv-l', arg: 'length', kind: 'number', required: true, label: 'Length', unit: 'cm' },
      { dom: 'tv-w', arg: 'width', kind: 'number', required: true, label: 'Width', unit: 'cm' },
      { dom: 'tv-h', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
    ],
  },
];
