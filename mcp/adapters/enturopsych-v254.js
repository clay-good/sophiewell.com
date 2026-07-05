// spec-v183 MCP wave: adapters for the ENT / urology / psychiatry screening tools
// in lib/enturopsych-v254.js — the Reflux Symptom Index (RSI), the Lund-Mackay CT
// sinus score, the bladder-outlet-obstruction / contractility indices, and the
// Fagerstrom Test for Nicotine Dependence. dom keys mirror views/group-v254.js.

import * as F from '../../lib/enturopsych-v254.js';

export default [
  {
    id: 'reflux-symptom-index',
    summary: 'Reflux Symptom Index (Belafsky 2002): 9 symptom items each 0-5; total 0-45 and > 13 suggests laryngopharyngeal reflux.',
    compute: F.refluxSymptomIndex,
    fields: [
      { dom: 'rsi-1', arg: 'hoarseness', kind: 'number', required: true, label: 'Hoarseness / voice problem (0-5)' },
      { dom: 'rsi-2', arg: 'clearing', kind: 'number', required: true, label: 'Throat clearing (0-5)' },
      { dom: 'rsi-3', arg: 'mucus', kind: 'number', required: true, label: 'Excess mucus / postnasal drip (0-5)' },
      { dom: 'rsi-4', arg: 'swallowing', kind: 'number', required: true, label: 'Difficulty swallowing (0-5)' },
      { dom: 'rsi-5', arg: 'cough1', kind: 'number', required: true, label: 'Cough after eating or lying down (0-5)' },
      { dom: 'rsi-6', arg: 'breathing', kind: 'number', required: false, label: 'Breathing difficulty / choking (0-5)' },
      { dom: 'rsi-7', arg: 'cough2', kind: 'number', required: false, label: 'Troublesome / annoying cough (0-5)' },
      { dom: 'rsi-8', arg: 'globus', kind: 'number', required: false, label: 'Globus / lump in throat (0-5)' },
      { dom: 'rsi-9', arg: 'heartburn', kind: 'number', required: false, label: 'Heartburn / chest pain / reflux (0-5)' },
    ],
  },
  {
    id: 'lund-mackay',
    summary: 'Lund-Mackay CT sinus score (Lund & Mackay 1993): 5 sinus systems scored 0/1/2 per side plus the ostiomeatal complex; total 0-24, higher = more radiologic sinus disease.',
    compute: F.lundMackay,
    fields: [
      { dom: 'lm-maxr', arg: 'maxR', kind: 'number', required: true, label: 'Maxillary (R)' },
      { dom: 'lm-aethr', arg: 'aethR', kind: 'number', required: true, label: 'Anterior ethmoid (R)' },
      { dom: 'lm-pethr', arg: 'pethR', kind: 'number', required: false, label: 'Posterior ethmoid (R)' },
      { dom: 'lm-sphr', arg: 'sphR', kind: 'number', required: false, label: 'Sphenoid (R)' },
      { dom: 'lm-frontr', arg: 'frontR', kind: 'number', required: false, label: 'Frontal (R)' },
      { dom: 'lm-maxl', arg: 'maxL', kind: 'number', required: true, label: 'Maxillary (L)' },
      { dom: 'lm-aethl', arg: 'aethL', kind: 'number', required: false, label: 'Anterior ethmoid (L)' },
      { dom: 'lm-pethl', arg: 'pethL', kind: 'number', required: false, label: 'Posterior ethmoid (L)' },
      { dom: 'lm-sphl', arg: 'sphL', kind: 'number', required: false, label: 'Sphenoid (L)' },
      { dom: 'lm-frontl', arg: 'frontL', kind: 'number', required: false, label: 'Frontal (L)' },
      { dom: 'lm-omcr', arg: 'omcR', kind: 'bool', required: true, label: 'Ostiomeatal complex occluded, right' },
      { dom: 'lm-omcl', arg: 'omcL', kind: 'bool', required: false, label: 'Ostiomeatal complex occluded, left' },
    ],
  },
  {
    id: 'bladder-outlet-obstruction-index',
    summary: 'Bladder outlet obstruction index (Abrams 1999): BOOI = PdetQmax - 2 x Qmax and BCI = PdetQmax + 5 x Qmax; pressure-flow indices of obstruction and detrusor contractility.',
    compute: F.bladderOutletObstructionIndex,
    fields: [
      { dom: 'boo-pdet', arg: 'pdet', kind: 'number', required: true, label: 'Detrusor pressure at max flow (PdetQmax)', unit: 'cmH2O' },
      { dom: 'boo-qmax', arg: 'qmax', kind: 'number', required: true, label: 'Maximum flow rate (Qmax)', unit: 'mL/s' },
    ],
  },
  {
    id: 'fagerstrom-ftnd',
    summary: 'Fagerstrom Test for Nicotine Dependence (Heatherton 1991): 6 items summed 0-10, where higher totals reflect greater nicotine dependence.',
    compute: F.fagerstromFtnd,
    fields: [
      { dom: 'ftnd-time', arg: 'timeToFirst', kind: 'number', required: true, label: 'Time to first cigarette' },
      { dom: 'ftnd-refrain', arg: 'refrain', kind: 'bool', required: false, label: 'Hard to refrain in forbidden places' },
      { dom: 'ftnd-morning', arg: 'firstMorning', kind: 'bool', required: false, label: 'First-of-morning cigarette is hardest to give up' },
      { dom: 'ftnd-perday', arg: 'perDay', kind: 'number', required: true, label: 'Cigarettes per day' },
      { dom: 'ftnd-more', arg: 'moreMorning', kind: 'bool', required: false, label: 'Smoke more in the first hours after waking' },
      { dom: 'ftnd-ill', arg: 'whenIll', kind: 'bool', required: false, label: 'Smoke when ill in bed' },
    ],
  },
];
