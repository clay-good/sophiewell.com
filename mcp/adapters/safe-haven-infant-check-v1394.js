// spec-v1394: MCP adapter. The dom keys mirror views/group-v1394.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as SHI from '../../lib/safe-haven-infant-check-v1394.js';

export default [
  {
    id: 'safe-haven-infant-check',
    summary: 'Checks a safe-haven infant surrender in New York, New Jersey, or Texas and gives the notice deadline. Texas (Family Code 262.302) takes a child who appears 60 days old or younger and notifies DFPS by the close of the first business day after. New Jersey (N.J.S.A. 30:4C-15.7) takes a child 30 days old or younger, and the hospital notifies DCPP by the first business day after. New York (Penal Law 260.00) is a 30-day defense for the parent. California has its own tool.',
    compute: SHI.safeHavenInfantCheck,
    fields: [
      { dom: 'shi-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: SHI.SH_STATES.map((s) => s.value) },
      { dom: 'shi-age', arg: 'ageDays', kind: 'number', required: true, label: 'Infant\'s age (days, or an estimate)' },
      { dom: 'shi-return', arg: 'intentToReturn', kind: 'enum', label: 'Parent said they will come back (NJ, TX)', values: ['yes', 'no'] },
      { dom: 'shi-abuse', arg: 'abuse', kind: 'enum', label: 'Signs of abuse or neglect (TX)', values: ['yes', 'no'] },
      { dom: 'shi-time', arg: 'received', kind: 'string', label: 'Child received (YYYY-MM-DDTHH:MM; NJ, TX)' },
    ],
  },
];
