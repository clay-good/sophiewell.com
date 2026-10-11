// spec-v1630 MCP adapter: mean-kinetic-temperature in lib/mean-kinetic-temperature-v1630.js. The dom
// keys mirror views/group-v1630.js and META['mean-kinetic-temperature'].example. ICH Q1A(R2) and
// Jenkins 2022; administrative domain. The activation energy is required; 83.144 kJ/mol is the
// paper's default.

import * as MK from '../../lib/mean-kinetic-temperature-v1630.js';

export default [
  {
    id: 'mean-kinetic-temperature',
    summary: 'Mean kinetic temperature of a storage temperature log, with the arithmetic mean, lowest and highest reading. Readings must be at equal intervals, or each line carries its own duration. The activation energy is required (83.144 kJ/mol is the usual default). No limit is applied unless the reader enters one. Not a verdict on a product after an excursion, and not for vaccines.',
    compute: MK.meanKineticTemperature,
    fields: [
      { dom: 'mk-unit', arg: 'unit', kind: 'enum', required: true, values: MK.UNITS.map((u) => u.value), label: 'Unit of the readings: Celsius (C) or Fahrenheit (F)' },
      { dom: 'mk-readings', arg: 'readings', kind: 'string', required: true, label: 'Readings, one per line (at equal intervals; or temperature, then hours, on every line)' },
      { dom: 'mk-ea', arg: 'activationEnergy', kind: 'number', required: true, label: 'Activation energy (83.144 when the manufacturer\'s data are not available)', unit: 'kJ/mol' },
      { dom: 'mk-limit', arg: 'limit', kind: 'number', required: false, label: 'Product\'s labeled limit, in the unit of the readings (optional)' },
    ],
  },
];
