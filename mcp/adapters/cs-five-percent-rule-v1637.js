// spec-v1637 MCP adapter: cs-five-percent-rule in lib/cs-five-percent-rule-v1637.js. The dom keys
// mirror views/group-v1637.js and META['cs-five-percent-rule'].example. Administrative domain.

import { csFivePercentRule } from '../../lib/cs-five-percent-rule-v1637.js';

export default [
  {
    id: 'cs-five-percent-rule',
    summary: 'The five percent rule for a dispenser that distributes controlled substances. It computes the share of dosage units distributed to other registrants this calendar year, out of all distributed and dispensed (21 CFR 1307.11). Gives the percentage, the units of headroom left under 5%, and whether a planned transfer fits. The denominator is distributed plus dispensed.',
    compute: csFivePercentRule,
    fields: [
      { dom: 'cfr-dispensed', arg: 'dispensed', kind: 'number', required: true, label: 'Dosage units dispensed this calendar year' },
      { dom: 'cfr-distributed', arg: 'distributed', kind: 'number', required: true, label: 'Dosage units distributed to other registrants this calendar year' },
      { dom: 'cfr-ads', arg: 'ltcAds', kind: 'number', label: 'Of those, units sent to the pharmacy\'s own long-term care automated dispensing systems' },
      { dom: 'cfr-planned', arg: 'planned', kind: 'number', label: 'A planned transfer, in dosage units' },
    ],
  },
];
