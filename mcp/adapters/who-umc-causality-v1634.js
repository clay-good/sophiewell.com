// spec-v1634 MCP adapter: who-umc-causality in lib/who-umc-causality-v1634.js. The dom keys mirror
// views/group-v1634.js and META['who-umc-causality'].example. Clinical domain.

import * as WU from '../../lib/who-umc-causality-v1634.js';

const vals = (list) => list.map((x) => x.value);
export default [
  {
    id: 'who-umc-causality',
    summary: 'WHO-UMC causality category for a suspected adverse drug reaction. From the time relationship, other causes, the response to withdrawal and the other points, it gives the first category whose points are all met, and what keeps it from the next one up.',
    compute: WU.whoUmcCausality,
    fields: [
      { dom: 'wu-time', arg: 'time', kind: 'enum', required: true, values: vals(WU.TIME), label: 'Time relationship to drug intake' },
      { dom: 'wu-alt', arg: 'alternative', kind: 'enum', required: true, values: vals(WU.ALTERNATIVE), label: 'Other causes (disease or other drugs)' },
      { dom: 'wu-wd', arg: 'withdrawal', kind: 'enum', required: true, values: vals(WU.WITHDRAWAL), label: 'Response to withdrawal' },
      { dom: 'wu-def', arg: 'definitive', kind: 'enum', required: true, values: vals(WU.YES_NO), label: 'Event definitive pharmacologically or phenomenologically' },
      { dom: 'wu-rc', arg: 'rechallenge', kind: 'enum', required: true, values: vals(WU.RECHALLENGE), label: 'Rechallenge' },
      { dom: 'wu-more', arg: 'moreData', kind: 'enum', required: true, values: vals(WU.YES_NO), label: 'More data needed or under examination' },
      { dom: 'wu-insuff', arg: 'insufficient', kind: 'enum', required: true, values: vals(WU.YES_NO), label: 'Information insufficient, cannot be supplemented' },
    ],
  },
];
