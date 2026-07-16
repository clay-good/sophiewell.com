// spec-v325 MCP wave: adapter for the ACR Lung-RADS v2022 assessment categories in
// lib/lung-rads-v325.js. The dom key mirrors the browser renderer (views/group-v325.js) and
// META['lung-rads'].example. `category` is an enum (0 / 1 / 2 / 3 / 4A / 4B / 4X). The
// compute reports the category descriptor and its management. The example sets category 4A;
// its band carries the "3" (month) and "8" (mm) example numbers, so it round-trips through
// the default makeToArgs with no custom toArgs.

import * as L from '../../lib/lung-rads-v325.js';

export default [
  {
    id: 'lung-rads',
    summary: 'ACR Lung-RADS v2022 lung-cancer-screening (LDCT) assessment categories. 0: incomplete (comparison or additional imaging; 1-3 month LDCT if infectious or inflammatory). 1: negative, 12-month LDCT. 2: benign appearance or behavior, 12-month LDCT. 3: probably benign, 6-month LDCT. 4A: suspicious, 3-month LDCT (PET or CT if a solid component >= 8 mm). 4B: very suspicious, diagnostic CT, PET or CT, tissue sampling, and, or referral. 4X: a category 3 or 4 nodule with additional suspicious features, managed as 4B. v2022 removed the risk-of-malignancy column. Reports the assessment category and its management, not a diagnosis or an order.',
    compute: L.lungRads,
    fields: [
      { dom: 'lungrads-cat', arg: 'category', kind: 'enum', values: ['0', '1', '2', '3', '4A', '4B', '4X'], label: 'Lung-RADS assessment category' },
    ],
  },
];
