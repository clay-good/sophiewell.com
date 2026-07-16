// spec-v334 MCP wave: adapter for the Kudo pit-pattern classification in lib/kudo-v334.js. The dom
// key mirrors the browser renderer (views/group-v334.js) and META['kudo-pit-pattern'].example.
// `type` is an enum (I / II / IIIS / IIIL / IV / V). The compute reports the pit-pattern type and
// its usual histologic correlate. The example sets type V; its expected text is the type
// description (no numeric facts), so it round-trips through the default makeToArgs with no custom
// toArgs.

import * as K from '../../lib/kudo-v334.js';

export default [
  {
    id: 'kudo-pit-pattern',
    summary: 'Kudo pit-pattern classification (Kudo 1996) of a colorectal lesion, read on magnifying chromoendoscopy. I: roundish pits (normal, non-neoplastic). II: stellar/papillary (hyperplastic, non-neoplastic). IIIS: small tubular, smaller than type I (adenoma; often depressed, highest malignant potential of type III). IIIL: larger tubular (adenoma). IV: branch/gyrus-like (adenoma, often villous). V: non-structured/irregular (suggestive of invasive carcinoma / deep submucosal invasion). Types I-II non-neoplastic; IIIS-IV neoplastic adenomas; V raises concern for invasion. Reports the pit-pattern type and its histologic correlate, not a tissue diagnosis, a resection recommendation, or a cancer diagnosis.',
    compute: K.kudo,
    fields: [
      { dom: 'kudo-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'IIIS', 'IIIL', 'IV', 'V'], label: 'Kudo pit-pattern type' },
    ],
  },
];
