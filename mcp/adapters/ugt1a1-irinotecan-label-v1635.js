// spec-v1635 MCP adapter: ugt1a1-irinotecan-label in lib/ugt1a1-irinotecan-label-v1635.js. The dom keys
// mirror views/group-v1640.js and META['ugt1a1-irinotecan-label'].example. One label row.

import * as UI from '../../lib/ugt1a1-irinotecan-label-v1635.js';

export default [
  {
    id: 'ugt1a1-irinotecan-label',
    summary: 'What the irinotecan label says for a UGT1A1 genotype. For *28/*28, *6/*6 and *6/*28 it says to consider a starting dose at least one level lower; for the others it states nothing.',
    compute: (a) => UI.ugt1a1IrinotecanLabel(a, new Date()),
    fields: [
      { dom: 'uil-genotype', arg: 'genotype', kind: 'enum', required: true, values: UI.GENOTYPES.map((g) => g.value), label: 'UGT1A1 genotype on the report' },
    ],
  },
];
