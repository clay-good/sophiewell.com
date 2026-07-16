// spec-v335 MCP wave: adapter for the NICE classification in lib/nice-v335.js. The dom key mirrors
// the browser renderer (views/group-v335.js) and META['nice-classification'].example. `type` is an
// enum (1 / 2 / 3). The compute reports the NICE type and its usual histologic correlate. The
// example sets type 3; its expected text is the type description (the type number already appears
// in the field value, no other numeric facts), so it round-trips through the default makeToArgs
// with no custom toArgs.

import * as N from '../../lib/nice-v335.js';

export default [
  {
    id: 'nice-classification',
    summary: 'NICE classification (NBI International Colorectal Endoscopic; Hewett 2012 / Hayashi 2013) of a colorectal lesion, read on narrow-band imaging without requiring magnification, by color, vessels, and surface pattern. Type 1: same/lighter color, absent or lacy vessels, uniform or absent surface (hyperplastic, non-neoplastic). Type 2: browner, brown vessels around white structures, oval/tubular/branched white structures (adenoma, or superficial cancer). Type 3: brown to dark brown, disrupted/missing vessels, amorphous or absent surface (deep submucosal invasive cancer). Reports the NICE type and its histologic correlate, not a tissue diagnosis, a resection recommendation, or a cancer diagnosis.',
    compute: N.nice,
    fields: [
      { dom: 'nice-type', arg: 'type', kind: 'enum', values: ['1', '2', '3'], label: 'NICE type' },
    ],
  },
];
