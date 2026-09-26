// spec-v1511: MCP adapter for the compounded preparation beyond-use date. The dom keys mirror views/group-v1511.js.

import * as CB from '../../lib/compounding-bud-v1511.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'compounding-bud',
    summary: 'Beyond-use date of a compounded preparation. Applies the USP <797> and <795> limits from compounding, capped by the earliest component expiration.',
    compute: CB.compoundingBud,
    fields: [
      { dom: 'cbud-type', arg: 'prepType', kind: 'enum', required: true, values: vals(CB.PREP_TYPES), label: 'Sterile or nonsterile' },
      { dom: 'cbud-made', arg: 'compounded', kind: 'string', required: true, label: 'Compounded (YYYY-MM-DDTHH:MM)' },
      { dom: 'cbud-cat', arg: 'category', kind: 'enum', required: false, values: vals(CB.CATEGORIES), label: 'Sterile: <797> category' },
      { dom: 'cbud-method', arg: 'method', kind: 'enum', required: false, values: vals(CB.METHODS), label: 'Sterile: method' },
      { dom: 'cbud-tested', arg: 'sterilityTested', kind: 'enum', required: false, values: vals(CB.YES_NO), label: 'Sterile: passed sterility testing' },
      { dom: 'cbud-nonsterile', arg: 'nonsterileComponent', kind: 'enum', required: false, values: vals(CB.YES_NO), label: 'Sterile: any nonsterile starting component' },
      { dom: 'cbud-store', arg: 'storage', kind: 'enum', required: false, values: vals(CB.STORAGE), label: 'Sterile: storage' },
      { dom: 'cbud-form', arg: 'form', kind: 'enum', required: false, values: vals(CB.FORMS), label: 'Nonsterile: dosage form and water activity' },
      { dom: 'cbud-exp', arg: 'componentExpiry', kind: 'string', required: false, label: 'Earliest component expiration (YYYY-MM-DD)' },
    ],
  },
];
