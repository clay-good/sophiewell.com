// spec-v327 MCP wave: adapter for the ACR LI-RADS v2018 CT/MRI diagnostic categories in
// lib/li-rads-v327.js. The dom key mirrors the browser renderer (views/group-v327.js) and
// META['li-rads'].example. `category` is an enum (LR-1 .. LR-5, LR-M, LR-TIV, LR-NC). The
// compute reports the descriptor and management. The example sets LR-3; its band carries the
// "3" and "6" (month) example numbers, so it round-trips through the default makeToArgs with
// no custom toArgs.

import * as L from '../../lib/li-rads-v327.js';

export default [
  {
    id: 'li-rads',
    summary: 'ACR LI-RADS v2018 CT/MRI diagnostic categories (liver observations in patients at risk for HCC). LR-1: definitely benign. LR-2: probably benign. LR-3: intermediate probability of malignancy (repeat or alternative imaging in 3 to 6 months). LR-4: probably HCC. LR-5: definitely HCC (may be treated as HCC without biopsy after multidisciplinary discussion). LR-M: probably or definitely malignant, not HCC specific (biopsy often considered). LR-TIV: definite tumor in vein. LR-NC: not categorizable. Reports the category and its general management, not a diagnosis or an order.',
    compute: L.liRads,
    fields: [
      { dom: 'lirads-cat', arg: 'category', kind: 'enum', values: ['LR-1', 'LR-2', 'LR-3', 'LR-4', 'LR-5', 'LR-M', 'LR-TIV', 'LR-NC'], label: 'LI-RADS diagnostic category' },
    ],
  },
];
