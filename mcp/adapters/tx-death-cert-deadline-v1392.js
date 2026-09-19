// spec-v1392: MCP adapter. The dom keys mirror views/group-v1392.js and this tile's META example.
// Dates are 'YYYY-MM-DD' and times 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as TXD from '../../lib/tx-death-cert-deadline-v1392.js';

export default [
  {
    id: 'tx-death-cert-deadline',
    summary: 'Gives the Texas deadline for the medical certification of death: five days after the certifier receives the death certificate (Health and Safety Code 193.005). It names who certifies: the attending physician, PA, or APRN, or, if all are unavailable and one approves, an associate physician, the chief medical officer, or the autopsy physician for a natural death.',
    compute: TXD.txDeathCertDeadline,
    fields: [
      { dom: 'txd-received', arg: 'received', kind: 'string', required: true, label: 'Death certificate received (YYYY-MM-DD)' },
      { dom: 'txd-available', arg: 'attendingAvailable', kind: 'enum', label: 'Attending physician, PA, or APRN available', values: ['yes', 'no'] },
    ],
  },
];
