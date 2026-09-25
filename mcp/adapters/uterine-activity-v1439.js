// spec-v1439: MCP adapter. The dom keys mirror views/group-v1439.js and this tile's META example.

import * as UA from '../../lib/uterine-activity-v1439.js';

export default [
  {
    id: 'uterine-activity',
    summary: 'Averages contractions over three 10-minute windows to call tachysystole, more than 5 per 10 minutes as ACOG defines it. With intrauterine pressure values it adds Montevideo units, and it says that frequency alone is a partial assessment.',
    compute: UA.uterineActivity,
    fields: [
      { dom: 'ua-w1', arg: 'w1', kind: 'number', required: true, label: 'Contractions, first 10 minutes' },
      { dom: 'ua-w2', arg: 'w2', kind: 'number', required: true, label: 'Contractions, second 10 minutes' },
      { dom: 'ua-w3', arg: 'w3', kind: 'number', required: true, label: 'Contractions, third 10 minutes' },
      { dom: 'ua-mvu-n', arg: 'mvuCount', kind: 'number', label: 'Contractions in one 10-minute window (for Montevideo units)' },
      { dom: 'ua-peak', arg: 'peak', kind: 'number', label: 'Average peak pressure', unit: 'mmHg' },
      { dom: 'ua-tone', arg: 'tone', kind: 'number', label: 'Baseline tone', unit: 'mmHg' },
    ],
  },
];
