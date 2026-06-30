// spec-v183 MCP wave 3: adapters for the six lib/oneformula-v167.js one-formula
// tiles. dom keys mirror views/group-v167.js and META.example.fields; arg names
// mirror the lib signatures (o.pip, o.mca, o.toe, o.na, o.t500, o.finding, …).
// Five are pure numeric formulas; rutgeerts is a categorical endoscopic grade.

import * as F from '../../lib/oneformula-v167.js';

export default [
  {
    id: 'mean-airway-pressure',
    summary: 'Mean airway pressure, square-wave approximation (Marini 1992): [(PIP·Ti) + (PEEP·Te)] / (Ti + Te) in cmH₂O.',
    compute: F.meanAirwayPressure,
    fields: [
      { dom: 'maw-pip', arg: 'pip', kind: 'number', required: true, label: 'Peak inspiratory pressure (PIP)', unit: 'cmH₂O' },
      { dom: 'maw-peep', arg: 'peep', kind: 'number', required: true, label: 'PEEP', unit: 'cmH₂O' },
      { dom: 'maw-ti', arg: 'ti', kind: 'number', required: true, label: 'Inspiratory time (Ti)', unit: 's' },
      { dom: 'maw-te', arg: 'te', kind: 'number', required: true, label: 'Expiratory time (Te)', unit: 's' },
    ],
  },
  {
    id: 'cerebroplacental-ratio',
    summary: 'Cerebroplacental ratio (Gramellini 1992): MCA pulsatility index / umbilical-artery pulsatility index; < 1 indicates cerebral redistribution.',
    compute: F.cerebroplacentalRatio,
    fields: [
      { dom: 'cpr-mca', arg: 'mca', kind: 'number', required: true, label: 'Middle-cerebral-artery pulsatility index (MCA-PI)' },
      { dom: 'cpr-ua', arg: 'ua', kind: 'number', required: true, label: 'Umbilical-artery pulsatility index (UA-PI)' },
    ],
  },
  {
    id: 'toe-brachial-index',
    summary: 'Toe-brachial index (Aboyans 2012): toe systolic / higher brachial systolic pressure; < 0.70 supports peripheral arterial disease.',
    compute: F.toeBrachialIndex,
    fields: [
      { dom: 'tbi-toe', arg: 'toe', kind: 'number', required: true, label: 'Toe systolic pressure', unit: 'mmHg' },
      { dom: 'tbi-brachial', arg: 'brachial', kind: 'number', required: true, label: 'Brachial systolic pressure', unit: 'mmHg' },
    ],
  },
  {
    id: 'stool-osmotic-gap',
    summary: 'Stool osmotic gap (Eherer & Fordtran 1992): 290 − 2·(stool Na + stool K); > 100 osmotic, < 50 secretory diarrhea.',
    compute: F.stoolOsmoticGap,
    fields: [
      { dom: 'sog-na', arg: 'na', kind: 'number', required: true, label: 'Stool sodium', unit: 'mEq/L' },
      { dom: 'sog-k', arg: 'k', kind: 'number', required: true, label: 'Stool potassium', unit: 'mEq/L' },
    ],
  },
  {
    id: 'pure-tone-average',
    summary: 'Pure-tone average: mean of the air-conduction thresholds at 500/1000/2000 Hz (3FA), plus 4000 Hz for the 4FA, mapped to a hearing-loss severity band.',
    compute: F.pureToneAverage,
    fields: [
      { dom: 'pta-500', arg: 't500', kind: 'number', required: true, label: 'Air-conduction threshold at 500 Hz', unit: 'dB HL' },
      { dom: 'pta-1000', arg: 't1000', kind: 'number', required: true, label: 'Air-conduction threshold at 1000 Hz', unit: 'dB HL' },
      { dom: 'pta-2000', arg: 't2000', kind: 'number', required: true, label: 'Air-conduction threshold at 2000 Hz', unit: 'dB HL' },
      { dom: 'pta-4000', arg: 't4000', kind: 'number', label: 'Air-conduction threshold at 4000 Hz (optional, for the 4-frequency average)', unit: 'dB HL' },
    ],
  },
  {
    id: 'rutgeerts',
    summary: 'Rutgeerts score (Rutgeerts 1990): endoscopic grade of post-operative Crohn’s recurrence in the neoterminal ileum (i0–i4); ≥ i2 predicts clinical recurrence.',
    compute: F.rutgeerts,
    fields: [
      { dom: 'rutg-finding', arg: 'finding', kind: 'enum', values: ['i0', 'i1', 'i2', 'i3', 'i4'], required: true, label: 'Neoterminal-ileum endoscopic finding (Rutgeerts grade)' },
    ],
  },
];
