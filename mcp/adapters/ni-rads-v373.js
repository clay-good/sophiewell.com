// spec-v373 MCP wave: adapter for the NI-RADS categories in lib/ni-rads-v373.js. The dom key mirrors the
// browser renderer (views/group-v373.js) and META['ni-rads'].example. `category` is an enum
// (1/2A/2B/3/4). The compute reports the NI-RADS category and its description. The example sets 3; its
// expected text is the category description (the numeral 3, no other numeric facts), so it round-trips
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/ni-rads-v373.js';

export default [
  {
    id: 'ni-rads',
    summary: 'NI-RADS (ACR Neck Imaging Reporting and Data System; Aiken 2018) categories for POST-TREATMENT head-and-neck-cancer surveillance imaging, assigned separately to the primary site and the neck (nodes) — completing the RADS family. 1: no evidence of recurrence; expected post-treatment change (routine surveillance). 2A: low suspicion, mucosal or superficial abnormality (visual inspection or short-interval follow-up). 2B: low suspicion, deep abnormality (short-interval follow-up imaging). 3: high suspicion for recurrence, new or enlarging lesion (biopsy if clinically indicated). 4: definite recurrence, biopsy-proven or unequivocal (clinical management). Reports the category, not a diagnosis, a management order, or a prognosis.',
    compute: C.niRads,
    fields: [
      { dom: 'nirads-cat', arg: 'category', kind: 'enum', values: ['1', '2A', '2B', '3', '4'], label: 'NI-RADS category' },
    ],
  },
];
