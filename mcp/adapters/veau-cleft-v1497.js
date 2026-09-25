// spec-v1497: MCP adapter. The dom keys mirror views/group-v1497.js and this tile's META example.

import * as VC from '../../lib/veau-cleft-v1497.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'veau-cleft',
    summary: 'Veau classification of cleft palate, I to IV, from the palatal extent and whether the cleft runs through the lip and alveolus.',
    compute: VC.veauCleft,
    fields: [
      { dom: 'vc-palate', arg: 'palate', kind: 'enum', required: true, values: vals(VC.PALATE), label: 'Extent of the palatal cleft' },
      { dom: 'vc-lip', arg: 'lip', kind: 'enum', required: true, values: vals(VC.LIP), label: 'Cleft through the lip and alveolus' },
    ],
  },
];
