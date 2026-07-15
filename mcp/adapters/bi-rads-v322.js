// spec-v322 MCP wave: adapter for the ACR BI-RADS assessment categories in
// lib/bi-rads-v322.js. The dom key mirrors the browser renderer (views/group-v322.js) and
// META['bi-rads'].example. `category` is an enum (0 / 1 / 2 / 3 / 4 / 4A / 4B / 4C / 5 / 6).
// The compute reports the category, its likelihood-of-malignancy band, and the standard
// management. The example sets category 4B; its band carries the "10" and "50" example
// numbers, so it round-trips through the default makeToArgs with no custom toArgs.

import * as B from '../../lib/bi-rads-v322.js';

export default [
  {
    id: 'bi-rads',
    summary: 'ACR BI-RADS breast-imaging assessment categories (5th ed, 2013). 0: incomplete, need more imaging or prior comparison. 1: negative (~0%). 2: benign (~0%). 3: probably benign (> 0% to <= 2%), short-interval follow-up. 4: suspicious (> 2% to < 95%), biopsy, sub-divided 4A (> 2 to <= 10%), 4B (> 10 to <= 50%), 4C (> 50 to < 95%). 5: highly suggestive of malignancy (>= 95%), biopsy. 6: known biopsy-proven malignancy. Reports the radiologist assessment category and its standard management, not a diagnosis or an order.',
    compute: B.biRads,
    fields: [
      { dom: 'birads-cat', arg: 'category', kind: 'enum', values: ['0', '1', '2', '3', '4', '4A', '4B', '4C', '5', '6'], label: 'BI-RADS final assessment category' },
    ],
  },
];
