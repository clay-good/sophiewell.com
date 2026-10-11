// spec-v1631 MCP adapter: pk-steady-state-predict in lib/pk-steady-state-predict-v1631.js. The dom
// keys mirror views/group-v1631.js and META['pk-steady-state-predict'].example. Clinical domain.
// Algebra on the one-compartment model; every parameter is reader input.

import * as PK from '../../lib/pk-steady-state-predict-v1631.js';

export default [
  {
    id: 'pk-steady-state-predict',
    summary: 'Steady-state peak, trough and accumulation factor for an intermittent regimen in a linear one-compartment model. Also the time to steady state, the level at a time after any dose, the time for a level to fall to a target, the average concentration and AUC over 24 hours. Every parameter is entered by the reader. Not for phenytoin or a distribution phase.',
    compute: PK.pkSteadyStatePredict,
    fields: [
      { dom: 'pk-dose', arg: 'dose', kind: 'number', required: true, label: 'Dose', unit: 'mg' },
      { dom: 'pk-tinf', arg: 'infusionHours', kind: 'number', required: true, label: 'Infusion time (0 for a bolus)', unit: 'hours' },
      { dom: 'pk-tau', arg: 'interval', kind: 'number', required: true, label: 'Dosing interval', unit: 'hours' },
      { dom: 'pk-vd', arg: 'vd', kind: 'number', required: true, label: 'Volume of distribution', unit: 'L' },
      { dom: 'pk-half', arg: 'halfLife', kind: 'number', required: false, label: 'Half-life (enter one of half-life, k or clearance)', unit: 'hours' },
      { dom: 'pk-k', arg: 'k', kind: 'number', required: false, label: 'Elimination rate constant, per hour' },
      { dom: 'pk-cl', arg: 'clearance', kind: 'number', required: false, label: 'Clearance', unit: 'L/hour' },
      { dom: 'pk-n', arg: 'doseNumber', kind: 'number', required: false, label: 'Dose number (optional, with the time below)' },
      { dom: 'pk-t', arg: 'timeAfter', kind: 'number', required: false, label: 'Hours after that dose started (optional)', unit: 'hours' },
      { dom: 'pk-level', arg: 'level', kind: 'number', required: false, label: 'A level (optional, with a target)', unit: 'mg/L' },
      { dom: 'pk-target', arg: 'target', kind: 'number', required: false, label: 'Target to fall to (optional)', unit: 'mg/L' },
    ],
  },
];
