// spec-v1629 MCP adapter: dropper-calibration in lib/dropper-calibration-v1629.js. The dom keys mirror
// views/group-v1629.js and META['dropper-calibration'].example. Arithmetic identity; administrative domain.

import * as DC from '../../lib/dropper-calibration-v1629.js';

export default [
  {
    id: 'dropper-calibration',
    summary: 'Drops per mL of one dropper from the reader\'s own count, and a dose in whole drops with its rounding error. The figure belongs to one dropper with one liquid; no standard drops-per-mL figure is assumed.',
    compute: DC.dropperCalibration,
    fields: [
      { dom: 'dc-drops', arg: 'drops', kind: 'number', required: true, label: 'Drops counted' },
      { dom: 'dc-vol', arg: 'volume', kind: 'number', required: true, label: 'Volume those drops made', unit: 'mL' },
      { dom: 'dc-dose', arg: 'dose', kind: 'number', required: false, label: 'Dose (optional)' },
      { dom: 'dc-unit', arg: 'doseUnit', kind: 'enum', required: false, values: DC.DOSE_UNITS.map((u) => u.value), label: 'Dose unit: mL, or mg with the concentration' },
      { dom: 'dc-conc', arg: 'concentration', kind: 'number', required: false, label: 'Concentration, when the dose is in mg', unit: 'mg/mL' },
    ],
  },
];
