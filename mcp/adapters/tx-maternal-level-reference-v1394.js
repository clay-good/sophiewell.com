// spec-v1394: MCP adapter. The dom keys mirror views/group-v1394.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as MLC from '../../lib/tx-maternal-level-reference-v1394.js';

export default [
  {
    id: 'tx-maternal-level-reference',
    summary: 'Gives the lowest Texas maternal level of care for a patient\'s risk, and what it must have (25 TAC 133.206-133.209). Every level must get key clinicians to the bedside within 30 minutes of an urgent request. Level III adds an OB/GYN on site at all times and maternal-fetal medicine. Level IV adds a placenta accreta team and an adult ICU on site.',
    compute: MLC.txMaternalLevelReference,
    fields: [
      { dom: 'mlc-risk', arg: 'risk', kind: 'enum', required: true, label: 'Maternal risk', values: MLC.RISK.map((r) => r.value) },
    ],
  },
];
