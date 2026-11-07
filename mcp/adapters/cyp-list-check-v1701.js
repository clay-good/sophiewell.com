// spec-v1701 MCP adapter: cyp-list-check in lib/cyp-list-check-v1701.js. The dom key mirrors
// views/group-v1701.js and META['cyp-list-check'].example. FDA's Table 1 is the data/fda-ddi-examples files the
// website ships, read from disk (mcp/fda-ddi-disk.js).

import * as CLC from '../../lib/cyp-list-check-v1701.js';
import { fdaDdiFromDisk } from '../fda-ddi-disk.js';

export default [
  {
    id: 'cyp-list-check',
    summary: 'Which drugs on a medication list FDA names as CYP inhibitors, inducers or substrates in its examples table. Pairs on one enzyme are listed. A drug not found means not on FDA\'s examples, never no interaction.',
    compute: (a) => CLC.cypListCheck(a, fdaDdiFromDisk(), new Date()),
    fields: [
      { dom: 'clc-drugs', arg: 'drugs', kind: 'string', required: true, label: 'Medications, one per line (generic names)' },
    ],
  },
];
