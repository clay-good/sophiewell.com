// spec-v1394: MCP adapter. The dom keys mirror views/group-v1394.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as SS from '../../lib/ca-safe-surrender-v1394.js';

export default [
  {
    id: 'ca-safe-surrender',
    summary: 'Checks a California safe surrender under Health and Safety Code 1255.7: eligible at 72 hours old or younger. The site places a coded ankle bracelet, offers the medical questionnaire, and ensures a medical screening exam. It notifies child protective services within 48 hours of accepting custody. The person who surrendered the child may reclaim them within 14 days.',
    compute: SS.caSafeSurrender,
    fields: [
      { dom: 'ss-age', arg: 'ageHours', kind: 'number', required: true, label: 'Infant\'s age at surrender (hours)' },
      { dom: 'ss-time', arg: 'surrendered', kind: 'string', required: true, label: 'Custody accepted (YYYY-MM-DDTHH:MM)' },
      { dom: 'ss-bracelet', arg: 'bracelet', kind: 'enum', label: 'Coded ankle bracelet placed', values: ['yes', 'no'] },
    ],
  },
];
