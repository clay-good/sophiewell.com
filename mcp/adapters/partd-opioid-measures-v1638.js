// spec-v1638 MCP adapter: partd-opioid-measures in lib/partd-opioid-measures-v1638.js. The dom keys
// mirror views/group-v1638.js and META['partd-opioid-measures'].example. Administrative domain. No
// clock.

import { partdOpioidMeasures } from '../../lib/partd-opioid-measures-v1638.js';

export default [
  {
    id: 'partd-opioid-measures',
    summary: 'The Part D opioid display measures by CMS\'s published method: high dosage (average 90 MME or more over 90 days or longer), multiple providers (4 or more prescribers and 4 or more pharmacies within 180 days) and initial long duration (more than 7 days\' supply in the first 3 days after 90 opioid-free days). From members and opioid fills it gives each member\'s status and the member-year rates.',
    compute: partdOpioidMeasures,
    fields: [
      { dom: 'pom-year', arg: 'measurementYear', kind: 'number', required: true, label: 'Measurement year', min: 2020, max: 2100 },
      { dom: 'pom-members', arg: 'members', kind: 'string', required: true, label: 'Members, one per line: member, age, months enrolled, enrolled through (YYYY-MM-DD), exclusion (optional)' },
      { dom: 'pom-fills', arg: 'fills', kind: 'string', required: true, label: 'Opioid fills, one per line: member, fill date (YYYY-MM-DD), days supply, MME per day, prescriber, pharmacy' },
    ],
  },
];
