// spec-v1635 MCP adapter: glucarpidase-dose in lib/glucarpidase-dose-v1635.js. The dom keys mirror
// views/group-v1635.js and META['glucarpidase-dose'].example. Clinical domain. One label row: VORAXAZE.

import * as GD from '../../lib/glucarpidase-dose-v1635.js';

export default [
  {
    id: 'glucarpidase-dose',
    summary: 'Glucarpidase dose, vials and leucovorin spacing, as the VORAXAZE label states them. It gives 50 Units/kg and the 1,000-Unit vials that cover it, tests the labeled indication (methotrexate above 1 µmol/L with delayed clearance, which the reader states), and checks that leucovorin is at least 2 hours before or after. It does not compute the methotrexate excretion curve.',
    compute: (args) => GD.glucarpidaseDose(args, new Date()),
    fields: [
      { dom: 'gcd-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'gcd-mtx', arg: 'methotrexate', kind: 'number', required: true, label: 'Plasma methotrexate', unit: 'µmol/L' },
      { dom: 'gcd-delayed', arg: 'delayed', kind: 'enum', required: true, values: GD.DELAYED.map((x) => x.value), label: 'Delayed methotrexate clearance from impaired renal function' },
      { dom: 'gcd-when', arg: 'glucarpidaseTime', kind: 'string', label: 'Planned glucarpidase time (YYYY-MM-DDTHH:MM, optional)' },
      { dom: 'gcd-last', arg: 'lastLeucovorin', kind: 'string', label: 'Last leucovorin dose (YYYY-MM-DDTHH:MM, optional)' },
      { dom: 'gcd-next', arg: 'nextLeucovorin', kind: 'string', label: 'Next leucovorin dose (YYYY-MM-DDTHH:MM, optional)' },
    ],
  },
];
