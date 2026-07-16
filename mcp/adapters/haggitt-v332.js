// spec-v332 MCP wave: adapter for the Haggitt classification in lib/haggitt-v332.js. The dom key
// mirrors the browser renderer (views/group-v332.js) and META['haggitt-level'].example. `level` is
// an enum (0 / 1 / 2 / 3 / 4). The compute reports the invasion level and its description. The
// example sets level 4; its expected text is the level description (a level number that already
// appears in the field value, no other numeric facts), so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as H from '../../lib/haggitt-v332.js';

export default [
  {
    id: 'haggitt-level',
    summary: 'Haggitt classification (Haggitt 1985) of invasion in a malignant colorectal polyp. 0: carcinoma limited to the mucosa (in situ / intramucosal, not truly invasive). 1: submucosa of the polyp head. 2: neck (head-stalk junction). 3: stalk. 4: bowel-wall submucosa below the stalk. Levels 1-3 (pedunculated, favorable histology) carry a low risk of adverse outcome and are often managed by polypectomy alone; level 4 (and ALL sessile invasive polyps, which are level 4 by definition) carries a higher lymph-node-metastasis risk. Reports the invasion level, not a diagnosis, a resection recommendation, or a metastasis prediction.',
    compute: H.haggitt,
    fields: [
      { dom: 'hag-level', arg: 'level', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Haggitt level' },
    ],
  },
];
