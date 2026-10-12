// spec-v1636 MCP adapter: botulism-antitoxin-dose in lib/botulism-antitoxin-dose-v1636.js. The dom
// keys mirror views/group-v1636.js and META['botulism-antitoxin-dose'].example. Clinical domain.

import * as BA from '../../lib/botulism-antitoxin-dose-v1636.js';

export default [
  {
    id: 'botulism-antitoxin-dose',
    summary: 'Botulism antitoxin dose and infusion rates from the labels. BAT: one vial for adults, the label\'s weight table (a percent of a vial) from 1 to under 17 years, and 10% under 1 year, with the starting and maximum rates. BabyBIG: 1.0 mL/kg with its two rates. The BAT table is used where it differs from the rule in its footnote, and the rule\'s figure is shown beside it.',
    compute: (args) => BA.botulismAntitoxinDose(args, new Date()),
    fields: [
      { dom: 'bad-product', arg: 'product', kind: 'enum', required: true, values: BA.PRODUCTS.map((x) => x.value), label: 'Product' },
      { dom: 'bad-age', arg: 'age', kind: 'number', required: true, label: 'Age (a fraction for an infant: 6 months is 0.5)', unit: 'years' },
      { dom: 'bad-weight', arg: 'weight', kind: 'number', label: 'Weight (needed under 17 years, and for BabyBIG)', unit: 'kg' },
    ],
  },
];
