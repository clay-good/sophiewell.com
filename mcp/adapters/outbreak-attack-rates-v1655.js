// spec-v1655 MCP adapter: outbreak-attack-rates in lib/outbreak-attack-rates-v1655.js. The dom keys mirror views/group-v1655.js and
// META['outbreak-attack-rates'].example.

import * as OAR from '../../lib/outbreak-attack-rates-v1655.js';

export default [
  {
    id: 'outbreak-attack-rates',
    summary: 'Outbreak attack rates as CDC\'s Principles of Epidemiology defines them: the attack rate among exposed and unexposed persons for each exposure with the risk ratio and its 95% interval, the overall attack rate, and the secondary attack rate among contacts.',
    compute: OAR.outbreakAttackRates,
    fields: [
      { dom: 'oar-rows', arg: 'rows', kind: 'string', required: false, label: 'Exposures, one per line: name, ill exposed, total exposed, optionally ill unexposed, total unexposed' },
      { dom: 'oar-total-ill', arg: 'totalIll', kind: 'number', required: false, label: 'Total ill' },
      { dom: 'oar-total-persons', arg: 'totalPersons', kind: 'number', required: false, label: 'Total persons at risk' },
      { dom: 'oar-members', arg: 'householdMembers', kind: 'number', required: false, label: 'Household or contact group members' },
      { dom: 'oar-primary', arg: 'primaryCases', kind: 'number', required: false, label: 'Primary cases' },
      { dom: 'oar-secondary', arg: 'secondaryCases', kind: 'number', required: false, label: 'Secondary cases among contacts' },
    ]
  },
];
