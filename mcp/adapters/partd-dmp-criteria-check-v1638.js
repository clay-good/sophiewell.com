// spec-v1638 MCP adapter: partd-dmp-criteria-check in lib/partd-dmp-criteria-check-v1638.js. The dom
// keys mirror views/group-v1638.js and META['partd-dmp-criteria-check'].example. Administrative
// domain: a claims-history rule, not a clinical score. No clock.

import * as DM from '../../lib/partd-dmp-criteria-check-v1638.js';

export default [
  {
    id: 'partd-dmp-criteria-check',
    summary: 'Whether a member meets the Part D drug management program criteria. Minimum criterion 1 is an average daily MME over 90 with 3 or more opioid prescribers and pharmacies, or 5 or more prescribers; criterion 2 is an overdose claim plus an opioid fill. Also the supplemental criteria and the exemptions (CMS guidance Rev. 7; 42 CFR 423.100).',
    compute: DM.partdDmpCriteriaCheck,
    fields: [
      { dom: 'dmp-exempt', arg: 'exemption', kind: 'enum', required: true, values: DM.EXEMPT.map((k) => k.value), label: 'Exemption' },
      { dom: 'dmp-mme', arg: 'averageDailyMme', kind: 'number', label: 'Highest average daily MME in the most recent 6 months, buprenorphine left out', unit: 'MME' },
      { dom: 'dmp-prescribers', arg: 'prescribers', kind: 'number', label: 'Opioid prescribers in the most recent 6 months' },
      { dom: 'dmp-pharmacies', arg: 'pharmacies', kind: 'number', label: 'Opioid dispensing pharmacies in the most recent 6 months' },
      { dom: 'dmp-opioid', arg: 'opioidFill', kind: 'enum', values: ['yes', 'no'], label: 'A Part D opioid fill, not for opioid use disorder, in the most recent 6 months' },
      { dom: 'dmp-overdose', arg: 'overdoseClaim', kind: 'enum', values: ['yes', 'no'], label: 'An opioid-related overdose claim in the most recent 12 months' },
    ],
  },
];
