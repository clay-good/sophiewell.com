// spec-v1417: MCP adapter. The dom keys mirror views/group-v1417.js and this tile's META example.

import * as SL from '../../lib/snyder-slap-v1417.js';

export default [
  {
    id: 'snyder-slap',
    summary: 'Classifies a SLAP lesion of the shoulder into Snyder types I to IV from two arthroscopic findings: the state of the superior labrum and whether the biceps tendon is involved. It notes that agreement between surgeons on the type is only fair.',
    compute: SL.snyderSlap,
    fields: [
      { dom: 'sl-labrum', arg: 'labrum', kind: 'enum', required: true, label: 'Superior labrum', values: SL.SLAP_LABRUM.map((x) => x.value) },
      { dom: 'sl-biceps', arg: 'biceps', kind: 'enum', label: 'Biceps tendon', values: SL.SLAP_BICEPS.map((x) => x.value) },
    ],
  },
];
