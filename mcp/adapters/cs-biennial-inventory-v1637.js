// spec-v1637 MCP adapter: cs-biennial-inventory in lib/cs-biennial-inventory-v1637.js. The dom keys
// mirror views/group-v1637.js and META['cs-biennial-inventory'].example. Administrative domain.

import * as BI from '../../lib/cs-biennial-inventory-v1637.js';

export default [
  {
    id: 'cs-biennial-inventory',
    summary: 'When the next controlled-substance inventory is due. Federal law (21 CFR 1304.11) allows any date within two years of the last one; a shorter state interval the caller enters governs. Also gives the count method for an opened container (exact for Schedule I or II; an estimate for III to V unless it holds more than 1,000 tablets or capsules) and how long to keep the inventory.',
    compute: (args) => BI.csBiennialInventory(args, new Date()),
    fields: [
      { dom: 'cbi-last', arg: 'lastInventory', kind: 'string', required: true, label: 'Date of the last inventory (YYYY-MM-DD)' },
      { dom: 'cbi-state', arg: 'stateIntervalMonths', kind: 'number', label: 'State inventory interval, if shorter', unit: 'months' },
      { dom: 'cbi-schedule', arg: 'schedule', kind: 'enum', values: BI.SCHEDULES.map((k) => k.value).filter(Boolean), label: 'Schedule of the drug in the container' },
      { dom: 'cbi-container', arg: 'container', kind: 'enum', values: BI.CONTAINERS.map((k) => k.value).filter(Boolean), label: 'Container' },
      { dom: 'cbi-count', arg: 'labeledCount', kind: 'number', label: 'Tablets or capsules the container holds' },
      { dom: 'cbi-effective', arg: 'newlyScheduledEffective', kind: 'string', label: 'Effective date of a rule newly scheduling the drug (YYYY-MM-DD)' },
    ],
  },
];
