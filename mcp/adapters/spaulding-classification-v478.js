// spec-v478 MCP wave: adapter for the Spaulding device-reprocessing classification in
// lib/spaulding-classification-v478.js. The dom key mirrors the browser renderer (views/group-v478.js) and
// META['spaulding-classification'].example. `category` is an enum (critical/semicritical/noncritical). The
// compute reports the category and its required reprocessing. The example sets semicritical; its expected text
// carries no numeric facts (the description is word-only), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/spaulding-classification-v478.js';

export default [
  {
    id: 'spaulding-classification',
    summary: 'The Spaulding classification of medical devices for reprocessing, by the infection risk of the site the device contacts. Critical: enters sterile tissue or the bloodstream, requires sterilization. Semicritical: contacts mucous membranes or non-intact skin, requires at least high-level disinfection. Noncritical: contacts intact skin only, requires low-level disinfection. Reports the reprocessing category, not a diagnosis, a treatment decision, or a prognosis; always follow the device instructions for use.',
    compute: C.spauldingClassification,
    fields: [
      { dom: 'spaulding-category', arg: 'category', kind: 'enum', values: ['critical', 'semicritical', 'noncritical'], label: 'Spaulding category' },
    ],
  },
];
