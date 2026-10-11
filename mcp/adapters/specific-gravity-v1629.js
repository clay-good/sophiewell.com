// spec-v1629 MCP adapter: specific-gravity in lib/specific-gravity-v1629.js. The dom keys mirror
// views/group-v1629.js and META['specific-gravity'].example. Definitions; administrative domain.

import * as SG from '../../lib/specific-gravity-v1629.js';

export default [
  {
    id: 'specific-gravity',
    summary: 'Weight of a volume, volume of a weight, specific gravity from three weighings, and % w/w to % w/v. Water is taken as 1 g/mL and the result says so.',
    compute: SG.specificGravity,
    fields: [
      { dom: 'sg-mode', arg: 'mode', kind: 'enum', required: true, values: SG.MODES.map((m) => m.value), label: 'What to work out: weight of a volume, volume of a weight, specific gravity from three weighings (measure), or % w/w to % w/v (strength)' },
      { dom: 'sg-sg', arg: 'specificGravity', kind: 'number', required: false, label: 'Specific gravity, or density in g/mL (all modes but measure)' },
      { dom: 'sg-vol', arg: 'volume', kind: 'number', required: false, label: 'Volume (weight mode)', unit: 'mL' },
      { dom: 'sg-wt', arg: 'weight', kind: 'number', required: false, label: 'Weight (volume mode)', unit: 'g' },
      { dom: 'sg-ww', arg: 'percentWw', kind: 'number', required: false, label: 'Strength in % w/w (strength mode)' },
      { dom: 'sg-empty', arg: 'empty', kind: 'number', required: false, label: 'Measure mode: weight of the empty container', unit: 'g' },
      { dom: 'sg-filled', arg: 'filled', kind: 'number', required: false, label: 'Measure mode: container filled with the liquid', unit: 'g' },
      { dom: 'sg-water', arg: 'water', kind: 'number', required: false, label: 'Measure mode: container filled with water', unit: 'g' },
    ],
  },
];
