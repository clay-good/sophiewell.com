// spec-v326 MCP wave: adapter for the ACR O-RADS US v2022 risk categories in
// lib/o-rads-v326.js. The dom key mirrors the browser renderer (views/group-v326.js) and
// META['o-rads'].example. `category` is an enum (0 / 1 / 2 / 3 / 4 / 5). The compute reports
// the descriptor, risk-of-malignancy band, and management. The example sets category 4; its
// band carries the "10" and "50" example numbers, so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as O from '../../lib/o-rads-v326.js';

export default [
  {
    id: 'o-rads',
    summary: 'ACR O-RADS US v2022 ovarian-adnexal ultrasound risk categories. 0: incomplete evaluation, further imaging needed. 1: normal premenopausal ovary (0% risk of malignancy). 2: almost certainly benign (< 1%), none or optional follow-up. 3: low risk (1% to < 10%), specialist ultrasound or MRI. 4: intermediate risk (10% to < 50%), MRI or gynecology / gynecologic-oncology referral. 5: high risk (>= 50%), gynecologic-oncology referral. Management is guidance modified by symptoms and history. Reports the risk category and its general management, not a diagnosis or an order.',
    compute: O.oRads,
    fields: [
      { dom: 'orads-cat', arg: 'category', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'O-RADS risk category' },
    ],
  },
];
