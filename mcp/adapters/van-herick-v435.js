// spec-v435 MCP wave: adapter for the Van Herick angle grade in lib/van-herick-v435.js. The dom key mirrors
// the browser renderer (views/group-v435.js) and META['van-herick'].example. `grade` is an enum (0-4). The
// compute reports the grade and its PACD:CT description. The example sets grade 2; its expected fraction
// (1/4) appears in the result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/van-herick-v435.js';

export default [
  {
    id: 'van-herick',
    summary: 'The Van Herick grade of the peripheral anterior chamber angle, estimated at the slit lamp by the ratio of the peripheral anterior chamber depth (PACD) to the corneal thickness (CT), grades 0/1/2/3/4. 0: PACD = 0, angle closed. 1: < 1/4 CT, closure likely. 2: 1/4 CT, closure possible. 3: 1/4 to 1/2 CT, closure unlikely. 4: at least 1 CT, wide open. Reports the grade, not a diagnosis of angle-closure, a treatment decision, or a prognosis.',
    compute: C.vanHerick,
    fields: [
      { dom: 'vh-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Van Herick grade' },
    ],
  },
];
