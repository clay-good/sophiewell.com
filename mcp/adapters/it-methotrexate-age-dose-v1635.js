// spec-v1635 MCP adapter: it-methotrexate-age-dose in lib/it-methotrexate-age-dose-v1635.js. The dom
// keys mirror views/group-v1635.js and META['it-methotrexate-age-dose'].example. Clinical domain.
// One label row: Methotrexate Injection (Accord).

import * as IT from '../../lib/it-methotrexate-age-dose-v1635.js';

export default [
  {
    id: 'it-methotrexate-age-dose',
    summary: 'Intrathecal methotrexate dose by age, as the Methotrexate Injection label states it. It returns the label\'s age band (6, 8, 10 or 12 mg, or 12 to 15 mg from 9 years), the preservative-free requirement, the 1 mg/mL dilution and the label\'s interval sentences. The top band stays a range. A treatment protocol may set a different dose.',
    compute: (args) => IT.itMethotrexateAgeDose(args, new Date()),
    fields: [
      { dom: 'itm-age', arg: 'age', kind: 'number', required: true, label: 'Age' },
      { dom: 'itm-unit', arg: 'ageUnit', kind: 'enum', required: true, values: IT.AGE_UNITS.map((x) => x.value), label: 'Age unit' },
    ],
  },
];
