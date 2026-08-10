// spec-v687 MCP adapter: elemental-iron toxic-dose estimator in
// lib/elemental-iron-ingested-v687.js. The dom keys mirror the browser renderer
// (views/group-v687.js) and META['elemental-iron-ingested'].example. Three numbers plus a
// salt-type enum; a conversion returns elemental mg and mg/kg. Clinical domain.

import { elementalIronIngested } from '../../lib/elemental-iron-ingested-v687.js';

export default [
  {
    id: 'elemental-iron-ingested',
    summary: 'Elemental iron ingested estimator: elemental mg = tablets x mg iron salt per tablet x percent elemental (ferrous sulfate 20%, gluconate 12%, fumarate 33%, or elemental=100%); dose mg/kg = elemental / weight. Thresholds: <20 minimal, 20-60 mild-moderate, >60 severe, >150 potentially lethal. Advisory triage estimate.',
    compute: elementalIronIngested,
    fields: [
      { dom: 'iron-tabs', arg: 'tablets', kind: 'number', required: true, label: 'Number of tablets ingested' },
      { dom: 'iron-mg', arg: 'mgPerTablet', kind: 'number', unit: 'mg', required: true, label: 'Iron salt per tablet (mg)' },
      { dom: 'iron-salt', arg: 'saltType', kind: 'enum', values: ['ferrous-sulfate', 'ferrous-gluconate', 'ferrous-fumarate', 'elemental'], required: true, label: 'Iron salt' },
      { dom: 'iron-wt', arg: 'weightKg', kind: 'number', unit: 'kg', required: true, label: 'Body weight (kg)' },
    ],
  },
];
