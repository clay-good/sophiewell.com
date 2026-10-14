// spec-v1631 MCP adapter: tmic-beta-lactam in lib/tmic-beta-lactam-v1631.js. The dom keys mirror
// views/group-v1631.js and META['tmic-beta-lactam'].example. Clinical domain. Algebra on the
// one-compartment model; no target is applied.

import * as TM from '../../lib/tmic-beta-lactam-v1631.js';

export default [
  {
    id: 'tmic-beta-lactam',
    summary: 'Percent of the dosing interval that free drug stays above the MIC at steady state, in a one-compartment model. Shows the free peak and trough, the same dose as a 3-hour and a 4-hour infusion, and the same amount as a continuous infusion (free steady-state concentration against the MIC). No target is applied: the target is the reader\'s. Vd, half-life and unbound fraction are entered from the product label.',
    compute: TM.tmicBetaLactam,
    fields: [
      { dom: 'tm-dose', arg: 'dose', kind: 'number', required: true, label: 'Dose', unit: 'mg' },
      { dom: 'tm-tinf', arg: 'infusionHours', kind: 'number', required: true, label: 'Infusion time (0 for a bolus)', unit: 'hours' },
      { dom: 'tm-tau', arg: 'interval', kind: 'number', required: true, label: 'Dosing interval', unit: 'hours' },
      { dom: 'tm-vd', arg: 'vd', kind: 'number', required: true, label: 'Volume of distribution', unit: 'L' },
      { dom: 'tm-half', arg: 'halfLife', kind: 'number', required: false, label: 'Half-life (or enter k)', unit: 'hours' },
      { dom: 'tm-k', arg: 'k', kind: 'number', required: false, label: 'Elimination rate constant, per hour' },
      { dom: 'tm-fu', arg: 'unboundFraction', kind: 'number', required: true, label: 'Unbound fraction, from 0 to 1' },
      { dom: 'tm-mic', arg: 'mic', kind: 'number', required: true, label: 'MIC', unit: 'mg/L' },
    ],
  },
];
