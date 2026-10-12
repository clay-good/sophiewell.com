// spec-v1639 MCP adapter: contraception-start-backup in lib/contraception-start-backup-v1639.js. The
// dom keys mirror views/group-v1639.js and META['contraception-start-backup'].example. No clock.

import * as SB from '../../lib/contraception-start-backup-v1639.js';

export default [
  {
    id: 'contraception-start-backup',
    summary: 'Days of back-up contraception when starting a method, by CDC\'s 2024 recommendations. Combined pill, patch or ring (5 days, then 7), norethindrone or norgestrel pill (5, then 2), drospirenone pill (day 1, then 7), DMPA (7, then 7), implant (5, then 7), levonorgestrel IUD (7, then 7). Gives the date back-up ends and CDC\'s Box 3.',
    compute: SB.contraceptionStartBackup,
    fields: [
      { dom: 'csb-method', arg: 'method', kind: 'enum', required: true, values: SB.METHODS.map((m) => m.value), label: 'Method being started' },
      { dom: 'csb-bleed', arg: 'bleedingStarted', kind: 'string', required: true, label: 'Date menstrual bleeding started (YYYY-MM-DD)' },
      { dom: 'csb-start', arg: 'startDate', kind: 'string', required: true, label: 'Date the method is started or placed (YYYY-MM-DD)' },
    ],
  },
];
