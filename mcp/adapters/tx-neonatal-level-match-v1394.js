// spec-v1394: MCP adapter. The dom keys mirror views/group-v1394.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as NLC from '../../lib/tx-neonatal-level-match-v1394.js';

export default [
  {
    id: 'tx-neonatal-level-match',
    summary: 'Finds the lowest Texas neonatal level of care whose rule covers an infant (25 TAC 133.186-133.189, amended June 22, 2023). Level I is generally 35 weeks or more with routine problems. Level II is generally 32 weeks and 1,500 g or more, with CPAP or ventilation under 24 hours. Level III covers all gestational ages and sustained life support, and Level IV the most complex conditions. It also states the Level II exception for a facility more than 75 miles from a Level III or IV.',
    compute: NLC.txNeonatalLevelMatch,
    fields: [
      { dom: 'nlc-ga', arg: 'ga', kind: 'number', required: true, label: 'Gestational age (weeks)' },
      { dom: 'nlc-weight', arg: 'weightG', kind: 'number', required: true, label: 'Birth weight (g)' },
      { dom: 'nlc-resp', arg: 'resp', kind: 'enum', required: true, label: 'Expected respiratory support', values: NLC.RESP.map((r) => r.value) },
      { dom: 'nlc-illness', arg: 'illness', kind: 'enum', required: true, label: 'Illness', values: NLC.ILLNESS.map((x) => x.value) },
      { dom: 'nlc-far', arg: 'far', kind: 'enum', label: 'More than 75 miles from a Level III or IV', values: ['yes', 'no'] },
    ],
  },
];
