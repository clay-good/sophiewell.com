// spec-v299 MCP wave: adapter for the Cosyntropin (ACTH) stimulation test
// interpretation in lib/cosyntropin-v299.js. The dom keys mirror the browser
// renderer (views/group-v299.js) and META['cosyntropin-stim'].example. `cortisol`
// is the required peak stimulated serum cortisol; `unit` is an optional enum
// (µg/dL default, or nmol/L). The compute returns the threshold comparison and
// normal/abnormal flag. The `band` carries the "22 µg/dL / 18" example, so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/cosyntropin-v299.js';

export default [
  {
    id: 'cosyntropin-stim',
    summary: 'Cosyntropin (ACTH) stimulation test interpretation: given the peak stimulated serum cortisol (30 or 60 min after 250 µg cosyntropin) and its unit, compares it with the standard-immunoassay threshold of 18 µg/dL (500 nmol/L) and reports a normal adrenal response or a value below threshold suggestive of adrenal insufficiency, with a caveat that newer LC-MS/MS assays use lower cutoffs. Reports the cited threshold interpretation, not a diagnosis.',
    compute: C.cosyntropinTest,
    fields: [
      { dom: 'csy-cortisol', arg: 'cortisol', kind: 'number', required: true, label: 'Peak stimulated cortisol' },
      { dom: 'csy-unit', arg: 'unit', kind: 'enum', required: false, values: ['µg/dL', 'nmol/L'], label: 'Unit' },
    ],
  },
];
