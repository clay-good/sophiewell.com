// spec-v1630 MCP adapter: hazardous-drug-list-check in lib/hazardous-drug-list-check-v1630.js. The dom
// keys mirror views/group-v1630.js and META['hazardous-drug-list-check'].example. NIOSH List of
// Hazardous Drugs in Healthcare Settings, 2024; administrative domain. No clock.

import { hazardousDrugListCheck } from '../../lib/hazardous-drug-list-check-v1630.js';

export default [
  {
    id: 'hazardous-drug-list-check',
    summary: 'Whether a drug, or each drug on a formulary list, is on the NIOSH 2024 hazardous drug list, and in which table. Matches on the generic name. A miss means not on this edition of this list, never that the drug is safe to handle; handling is set by USP <800> and the site\'s assessment.',
    compute: hazardousDrugListCheck,
    fields: [
      { dom: 'hdl-drug', arg: 'drug', kind: 'string', required: false, label: 'Generic drug name' },
      { dom: 'hdl-list', arg: 'list', kind: 'string', required: false, label: 'Or a list of generic names, one per line' },
    ],
  },
];
