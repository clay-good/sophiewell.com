// spec-v1629 MCP adapter: min-weighable-quantity in lib/min-weighable-quantity-v1629.js. The dom keys
// mirror views/group-v1629.js and META['min-weighable-quantity'].example. Arithmetic identity;
// administrative domain. The sensitivity and the error limit are reader input with no default.

import * as MW from '../../lib/min-weighable-quantity-v1629.js';

export default [
  {
    id: 'min-weighable-quantity',
    summary: 'Smallest quantity a balance or measuring device can measure inside an error limit, and the percent error of a measurement. The sensitivity and the error limit are supplied by the reader; no default is assumed.',
    compute: MW.minWeighableQuantity,
    fields: [
      { dom: 'mw-mode', arg: 'mode', kind: 'enum', required: true, values: MW.MODES.map((m) => m.value), label: 'What to work out: the smallest quantity (minimum), the potential error of a quantity (potential), or the percent error of a measurement made (error)' },
      { dom: 'mw-unit', arg: 'unit', kind: 'enum', required: true, values: MW.UNITS.map((u) => u.value), label: 'Unit the device measures in' },
      { dom: 'mw-sens', arg: 'sensitivity', kind: 'number', required: false, label: 'Sensitivity of the device, from its certificate or calibration (minimum and potential modes)' },
      { dom: 'mw-limit', arg: 'errorLimit', kind: 'number', required: false, label: 'Largest error accepted, percent (required in minimum mode; optional otherwise)' },
      { dom: 'mw-qty', arg: 'quantity', kind: 'number', required: false, label: 'Quantity to be measured (potential mode)' },
      { dom: 'mw-wanted', arg: 'wanted', kind: 'number', required: false, label: 'Quantity wanted (error mode)' },
      { dom: 'mw-got', arg: 'obtained', kind: 'number', required: false, label: 'Quantity actually obtained (error mode)' },
    ],
  },
];
