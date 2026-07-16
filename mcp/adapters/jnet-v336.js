// spec-v336 MCP wave: adapter for the JNET classification in lib/jnet-v336.js. The dom key mirrors
// the browser renderer (views/group-v336.js) and META['jnet-classification'].example. `type` is an
// enum (1 / 2A / 2B / 3). The compute reports the JNET type and its usual histologic correlate. The
// example sets type 2B; its expected text is the type description (no numeric facts), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as J from '../../lib/jnet-v336.js';

export default [
  {
    id: 'jnet-classification',
    summary: 'JNET classification (Japan NBI Expert Team; Sano 2016) of a colorectal lesion, read on magnifying narrow-band imaging by vessel pattern and surface pattern. Type 1: invisible vessels, regular spots (hyperplastic / sessile-serrated, non-neoplastic). Type 2A: regular vessels and surface (low-grade adenoma). Type 2B: irregular vessels and surface (high-grade neoplasia / shallow submucosal cancer). Type 3: loose/interrupted vessels, amorphous surface (deep submucosal invasive cancer). Refines NICE by splitting type 2 into 2A / 2B. Reports the JNET type and its histologic correlate, not a tissue diagnosis, a resection recommendation, or a cancer diagnosis.',
    compute: J.jnet,
    fields: [
      { dom: 'jnet-type', arg: 'type', kind: 'enum', values: ['1', '2A', '2B', '3'], label: 'JNET type' },
    ],
  },
];
