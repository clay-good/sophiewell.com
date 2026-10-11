// spec-v1629 MCP adapter: dilution-c1v1 in lib/dilution-c1v1-v1629.js. The dom keys mirror
// views/group-v1629.js and META['dilution-c1v1'].example. Arithmetic identity; administrative domain.

import * as DL from '../../lib/dilution-c1v1-v1629.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'dilution-c1v1',
    summary: 'Dilution by C1 × Q1 = C2 × Q2: give any three of stock strength, stock quantity, final strength and final quantity. Converts between % w/v, mg/mL, mcg/mL, ratio 1:X and ppm, and takes a % w/w stock into a weight-in-volume product through its specific gravity.',
    compute: DL.dilutionC1V1,
    fields: [
      { dom: 'dl-c1', arg: 'stockStrength', kind: 'number', required: false, label: 'Stock strength (for a ratio 1:X, give X)' },
      { dom: 'dl-u1', arg: 'stockUnit', kind: 'enum', required: true, values: vals(DL.UNITS), label: 'Stock strength unit' },
      { dom: 'dl-q1', arg: 'stockQuantity', kind: 'number', required: false, label: 'Stock quantity (mL, or g for % w/w)' },
      { dom: 'dl-c2', arg: 'finalStrength', kind: 'number', required: false, label: 'Final strength (for a ratio 1:X, give X)' },
      { dom: 'dl-u2', arg: 'finalUnit', kind: 'enum', required: true, values: vals(DL.UNITS), label: 'Final strength unit' },
      { dom: 'dl-q2', arg: 'finalQuantity', kind: 'number', required: false, label: 'Final quantity (mL, or g for % w/w)' },
      { dom: 'dl-sg', arg: 'specificGravity', kind: 'number', required: false, label: 'Specific gravity of the stock (only for a % w/w stock made into a weight-in-volume product)' },
    ],
  },
];
