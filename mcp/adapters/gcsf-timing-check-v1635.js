// spec-v1635 MCP adapter: gcsf-timing-check in lib/gcsf-timing-check-v1635.js. The dom keys mirror
// views/group-v1635.js and META['gcsf-timing-check'].example. Clinical domain. Two label rows:
// NEUPOGEN and Neulasta.

import * as GT from '../../lib/gcsf-timing-check-v1635.js';

export default [
  {
    id: 'gcsf-timing-check',
    summary: 'Filgrastim and pegfilgrastim timing against chemotherapy, as the reference labels state it. Filgrastim: at least 24 hours after chemotherapy and not within the 24 hours before it. Pegfilgrastim: not between 14 days before and 24 hours after, with the label dose (6 mg, or the pediatric weight table under 45 kg). It returns the allowed window and says when a cycle leaves none.',
    compute: (args) => GT.gcsfTimingCheck(args, new Date()),
    fields: [
      { dom: 'gtc-product', arg: 'product', kind: 'enum', required: true, values: GT.PRODUCTS.map((x) => x.value), label: 'Product' },
      { dom: 'gtc-chemo', arg: 'chemoEnd', kind: 'string', required: true, label: 'This cycle\'s chemotherapy, last given (YYYY-MM-DDTHH:MM)' },
      { dom: 'gtc-planned', arg: 'planned', kind: 'string', required: true, label: 'Planned growth-factor time (YYYY-MM-DDTHH:MM)' },
      { dom: 'gtc-next', arg: 'nextChemo', kind: 'string', label: 'Next cycle\'s chemotherapy start (YYYY-MM-DDTHH:MM, optional)' },
      { dom: 'gtc-pop', arg: 'population', kind: 'enum', values: GT.POPULATIONS.map((x) => x.value), label: 'Pegfilgrastim: adult or pediatric patient' },
      { dom: 'gtc-weight', arg: 'weight', kind: 'number', label: 'Pegfilgrastim: weight (needed for a pediatric patient)', unit: 'kg' },
    ],
  },
];
