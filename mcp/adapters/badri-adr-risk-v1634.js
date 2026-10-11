// spec-v1634 MCP adapter: badri-adr-risk in lib/badri-adr-risk-v1634.js. The dom keys mirror
// views/group-v1634.js and META['badri-adr-risk'].example. Clinical domain. All five items required.

import * as BA from '../../lib/badri-adr-risk-v1634.js';

export default [
  {
    id: 'badri-adr-risk',
    summary: 'BADRI score for adverse drug reaction risk in hospitalized older adults. One point each for hyperlipidemia, 8 or more medications, a stay of 12 days or more, antidiabetic agents, and a high white cell count on admission (0 to 5), compared with the paper\'s cutoff of more than 1 and its reported sensitivity and specificity. A low score does not rule out a reaction.',
    compute: BA.badriAdrRisk,
    fields: BA.ITEMS.map((it) => ({ dom: `bad-${it.dom}`, arg: it.arg, kind: 'enum', required: true, values: ['yes', 'no'], label: it.text })),
  },
];
