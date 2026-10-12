// spec-v1637 MCP adapter: dscsa-suspect-sample-size in lib/dscsa-suspect-sample-size-v1637.js. The
// dom keys mirror views/group-v1637.js and META['dscsa-suspect-sample-size'].example.
// Administrative domain. The clock is read only for the exemption's end date.

import * as SS from '../../lib/dscsa-suspect-sample-size-v1637.js';

export default [
  {
    id: 'dscsa-suspect-sample-size',
    summary: 'How many packages of a suspect lot a dispenser must verify under the DSCSA. At least 3 packages or 10 percent, whichever is greater, rounded up, or all of them if fewer than 3 (21 U.S.C. 360eee-1(d)(4)(A)(ii)(II)). Says when a small business dispenser is exempted, which FDA has granted until November 27, 2027.',
    compute: (args) => SS.dscsaSuspectSampleSize(args, new Date()),
    fields: [
      { dom: 'dss-packages', arg: 'packages', kind: 'number', required: true, label: 'Packages of the suspect product in your possession' },
      { dom: 'dss-dispenser', arg: 'dispenser', kind: 'enum', required: true, values: SS.SMALL.map((k) => k.value), label: 'Small business dispenser?' },
    ],
  },
];
