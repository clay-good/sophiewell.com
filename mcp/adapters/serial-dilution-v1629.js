// spec-v1629 MCP adapter: serial-dilution in lib/serial-dilution-v1629.js. The dom keys mirror
// views/group-v1629.js and META['serial-dilution'].example. Arithmetic identity; administrative domain.

import * as SD from '../../lib/serial-dilution-v1629.js';

export default [
  {
    id: 'serial-dilution',
    summary: 'Serial dilution plan from a stock strength to a target: the steps, each transfer and the strength after each. Takes a fixed factor per step, or the smallest measurable volume and finds the fewest steps in which every transfer is at or above it.',
    compute: SD.serialDilution,
    fields: [
      { dom: 'sd-unit', arg: 'unit', kind: 'enum', required: true, values: SD.UNITS.map((u) => u.value), label: 'Strength unit, the same for the stock and the target' },
      { dom: 'sd-stock', arg: 'stock', kind: 'number', required: true, label: 'Stock strength' },
      { dom: 'sd-target', arg: 'target', kind: 'number', required: true, label: 'Target strength' },
      { dom: 'sd-vol', arg: 'finalVolume', kind: 'number', required: true, label: 'Volume wanted at the last step', unit: 'mL' },
      { dom: 'sd-factor', arg: 'factor', kind: 'number', required: false, label: 'Dilution factor per step (give this or the smallest measurable volume, not both)' },
      { dom: 'sd-min', arg: 'minVolume', kind: 'number', required: false, label: 'Smallest volume that can be measured', unit: 'mL' },
      { dom: 'sd-step', arg: 'stepVolume', kind: 'number', required: false, label: 'Volume of each earlier step (blank uses the last step\'s volume)', unit: 'mL' },
    ],
  },
];
