// spec-v472 MCP wave: adapter for the Yerdel portal vein thrombosis grading in lib/yerdel-pvt-v472.js. The dom
// key mirrors the browser renderer (views/group-v472.js) and META['yerdel-pvt'].example. `grade` is an enum
// (1-4). The compute reports the grade and its thrombus-extent description. The example sets grade 2; its
// expected text carries the "50%" fact, so the default makeToArgs flows through with no custom toArgs.

import * as C from '../../lib/yerdel-pvt-v472.js';

export default [
  {
    id: 'yerdel-pvt',
    summary: 'The Yerdel classification of portal vein thrombosis, by the extent of thrombus in the portal vein and superior mesenteric vein (SMV), grades 1-4. 1: partial PVT, 50% or less of the lumen. 2: more than 50% occlusion (including total) of the portal vein. 3: complete portal vein and proximal SMV thrombosis, distal SMV patent. 4: complete portal vein and entire SMV thrombosis. Reports the imaging grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.yerdelPvt,
    fields: [
      { dom: 'yerdel-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3', '4'], label: 'Yerdel grade' },
    ],
  },
];
