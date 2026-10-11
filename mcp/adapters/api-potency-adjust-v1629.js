// spec-v1629 MCP adapter: api-potency-adjust in lib/api-potency-adjust-v1629.js. The dom keys mirror
// views/group-v1629.js and META['api-potency-adjust'].example. Arithmetic identity; administrative domain.

import * as AP from '../../lib/api-potency-adjust-v1629.js';

export default [
  {
    id: 'api-potency-adjust',
    summary: 'Weight of an active-ingredient lot to weigh for a target of pure active, after the assay and the water correction. The basis of the assay (as is, anhydrous or dried) is a required choice with no default, because the answer differs by it.',
    compute: AP.apiPotencyAdjust,
    fields: [
      { dom: 'ap-target', arg: 'target', kind: 'number', required: true, label: 'Target amount of pure active' },
      { dom: 'ap-unit', arg: 'unit', kind: 'enum', required: true, values: AP.UNITS.map((u) => u.value), label: 'Unit of the target' },
      { dom: 'ap-assay', arg: 'assay', kind: 'number', required: true, label: 'Assay of the lot, percent (certificate of analysis)' },
      { dom: 'ap-basis', arg: 'basis', kind: 'enum', required: true, values: AP.BASES.map((b) => b.value), label: 'Basis the assay is stated on: as is, anhydrous or dried' },
      { dom: 'ap-water', arg: 'water', kind: 'number', required: false, label: 'Water content or loss on drying, percent (required for an anhydrous or dried assay)' },
      { dom: 'ap-salt', arg: 'saltFactor', kind: 'number', required: false, label: 'Salt factor: weight of salt per weight of base (optional)' },
    ],
  },
];
