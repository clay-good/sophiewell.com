// spec-v1629 MCP adapter: meq-mmol-mg in lib/meq-mmol-mg-v1629.js. The dom keys mirror
// views/group-v1629.js and META['meq-mmol-mg'].example. Definitions; administrative domain. The
// valence and the particle count are reader input and are never inferred.

import * as MQ from '../../lib/meq-mmol-mg-v1629.js';

export default [
  {
    id: 'meq-mmol-mg',
    summary: 'Converts a salt quantity among mg, mmol, mEq and ideal mOsm, from its formula or molecular weight. The valence is entered, never assumed: a blank valence gives millimoles only.',
    compute: MQ.meqMmolMg,
    fields: [
      { dom: 'mq-qty', arg: 'quantity', kind: 'number', required: true, label: 'Quantity' },
      { dom: 'mq-unit', arg: 'unit', kind: 'enum', required: true, values: MQ.UNITS.map((u) => u.value), label: 'Unit of the quantity' },
      { dom: 'mq-formula', arg: 'formula', kind: 'string', required: false, label: 'Formula of the form weighed (give this or the molecular weight)' },
      { dom: 'mq-mw', arg: 'molecularWeight', kind: 'number', required: false, label: 'Molecular weight', unit: 'g/mol' },
      { dom: 'mq-val', arg: 'valence', kind: 'number', required: false, label: 'Valence: total positive charge per formula unit (blank gives millimoles only)' },
      { dom: 'mq-part', arg: 'particles', kind: 'number', required: false, label: 'Particles on complete dissociation (blank gives no milliosmoles)' },
      { dom: 'mq-vol', arg: 'volumeMl', kind: 'number', required: false, label: 'Volume, for per-liter values (optional)', unit: 'mL' },
    ],
  },
];
