// spec-v371 MCP wave: adapter for the C-RADS colonic categories in lib/c-rads-v371.js. The dom key
// mirrors the browser renderer (views/group-v371.js) and META['c-rads'].example. `category` is an enum
// (C0/C1/C2a/C2b/C3/C4). The compute reports the C-RADS colonic category and its description. The
// example sets C3; its expected text is the category description (the numbers 10 and 6-9 are the polyp
// thresholds echoed in the band), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/c-rads-v371.js';

export default [
  {
    id: 'c-rads',
    summary: 'C-RADS (CT Colonography Reporting and Data System; Zalis 2005, 2023 update) colonic categories — the standardized reporting category for the colonic findings on a CT colonography, completing the RADS family (BI/LI/PI/O/TI/Lung-RADS). C0: inadequate or incomplete study (repeat CTC). C1: normal colon or unequivocally benign finding (routine screening). C2a: indeterminate 6-9 mm polyp(s), fewer than three (short-term follow-up or colonoscopy). C2b: mass-like but likely benign stricture (targeted follow-up). C3: one or more polyps 10 mm or larger, or three or more 6-9 mm polyps (colonoscopy). C4: colonic mass highly suspicious for malignancy (urgent colonoscopy). The extracolonic (E) axis is out of scope. Reports the category, not a diagnosis, a management order, or a prognosis.',
    compute: C.cRads,
    fields: [
      { dom: 'crads-cat', arg: 'category', kind: 'enum', values: ['C0', 'C1', 'C2a', 'C2b', 'C3', 'C4'], label: 'C-RADS colonic category' },
    ],
  },
];
