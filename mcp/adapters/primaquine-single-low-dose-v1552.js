// spec-v1552 MCP adapter: single low-dose primaquine in lib/primaquine-single-low-dose-v1552.js.
// The dom keys mirror views/group-v1552.js and META['primaquine-single-low-dose'].example. Clinical domain.

import * as P from '../../lib/primaquine-single-low-dose-v1552.js';

const yn = (dom, arg, label) => ({ dom, arg, kind: 'enum', required: true, label, values: P.YES_NO.map((d) => d.value) });

export default [
  {
    id: 'primaquine-single-low-dose',
    summary: 'Gives the WHO single low dose of primaquine with an ACT to cut falciparum transmission. 3.75, 7.5 or 15 mg by weight in low-transmission areas only, with no G6PD test, excluding pregnancy and infants under 1 month.',
    compute: P.primaquineSingleLowDose,
    fields: [
      { dom: 'pq-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 0.5, max: 250 },
      yn('pq-low', 'lowTransmission', 'Low-transmission area'),
      yn('pq-preg', 'pregnant', 'Pregnant'),
      yn('pq-infant', 'infant', 'Infant under 1 month'),
      yn('pq-bf', 'breastfeeding', 'Breastfeeding an infant under 1 month'),
    ],
  },
];
