// spec-v1631 MCP adapter: sawchuk-zaske-dosing in lib/sawchuk-zaske-dosing-v1631.js. The dom keys
// mirror views/group-v1631.js and META['sawchuk-zaske-dosing'].example. Clinical domain. The
// one-compartment model of Sawchuk 1977; no target is built in.

import * as SZ from '../../lib/sawchuk-zaske-dosing-v1631.js';

export default [
  {
    id: 'sawchuk-zaske-dosing',
    summary: 'Half-life, volume of distribution and extrapolated peak and trough from two levels after an intermittent infusion. The Sawchuk-Zaske method. With a desired peak and trough it gives the new interval and the dose at the practical intervals on either side, with the trough each predicts. Drug-agnostic; the targets are the reader\'s.',
    compute: SZ.sawchukZaskeDosing,
    fields: [
      { dom: 'sz-state', arg: 'doseState', kind: 'enum', required: true, values: SZ.DOSE_STATES.map((d) => d.value), label: 'Levels follow a first dose (first) or a dose at steady state (steady)' },
      { dom: 'sz-dose', arg: 'dose', kind: 'number', required: true, label: 'Dose given', unit: 'mg' },
      { dom: 'sz-tinf', arg: 'infusionHours', kind: 'number', required: true, label: 'Infusion time', unit: 'hours' },
      { dom: 'sz-tau', arg: 'interval', kind: 'number', required: true, label: 'Dosing interval', unit: 'hours' },
      { dom: 'sz-c1', arg: 'level1', kind: 'number', required: true, label: 'First level', unit: 'mg/L' },
      { dom: 'sz-t1', arg: 'time1', kind: 'number', required: true, label: 'First level: hours after the infusion ended', unit: 'hours' },
      { dom: 'sz-c2', arg: 'level2', kind: 'number', required: true, label: 'Second level', unit: 'mg/L' },
      { dom: 'sz-t2', arg: 'time2', kind: 'number', required: true, label: 'Second level: hours after the infusion ended', unit: 'hours' },
      { dom: 'sz-pre', arg: 'preDose', kind: 'number', required: false, label: 'Pre-dose level (first dose only; optional)', unit: 'mg/L' },
      { dom: 'sz-weight', arg: 'weight', kind: 'number', required: false, label: 'Weight, for L/kg (optional)', unit: 'kg' },
      { dom: 'sz-peak', arg: 'desiredPeak', kind: 'number', required: false, label: 'Desired peak (optional, with a trough)', unit: 'mg/L' },
      { dom: 'sz-trough', arg: 'desiredTrough', kind: 'number', required: false, label: 'Desired trough (optional)', unit: 'mg/L' },
    ],
  },
];
