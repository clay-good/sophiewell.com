// spec-v1482: MCP adapter. The dom keys mirror views/group-v1482.js and this tile's META example.

import * as CR from '../../lib/cairo-recession-v1482.js';

export default [
  {
    id: 'cairo-recession',
    summary: 'Cairo classification of gingival recession, RT1 to RT3, from the interproximal and buccal attachment loss.',
    compute: CR.cairoRecession,
    fields: [
      { dom: 'cr-buccal', arg: 'buccalCal', kind: 'number', required: true, label: 'Buccal attachment loss at the recession', unit: 'mm' },
      { dom: 'cr-inter', arg: 'interproximalCal', kind: 'number', required: true, label: 'Interproximal attachment loss (0 if none)', unit: 'mm' },
    ],
  },
];
