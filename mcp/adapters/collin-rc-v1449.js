// spec-v1449: MCP adapter. The dom keys mirror views/group-v1449.js and this tile's META example.

import * as CO from '../../lib/collin-rc-v1449.js';

const YN = CO.COLLIN_YES_NO.map((x) => x.value);

export default [
  {
    id: 'collin-rc',
    summary: 'Classifies a massive rotator cuff tear into Collin types A to E from which of five cuff components are torn. A combination that matches no type is reported as such rather than forced into one.',
    compute: CO.collinRc,
    fields: [
      { dom: 'col-ssp', arg: 'ssp', kind: 'enum', required: true, label: 'Supraspinatus', values: YN },
      { dom: 'col-ssc', arg: 'ssc', kind: 'enum', required: true, label: 'Superior subscapularis', values: YN },
      { dom: 'col-isc', arg: 'isc', kind: 'enum', required: true, label: 'Inferior subscapularis', values: YN },
      { dom: 'col-isp', arg: 'isp', kind: 'enum', required: true, label: 'Infraspinatus', values: YN },
      { dom: 'col-tm', arg: 'tm', kind: 'enum', required: true, label: 'Teres minor', values: YN },
    ],
  },
];
