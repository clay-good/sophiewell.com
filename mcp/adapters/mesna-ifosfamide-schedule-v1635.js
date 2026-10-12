// spec-v1635 MCP adapter: mesna-ifosfamide-schedule in lib/mesna-ifosfamide-schedule-v1635.js. The dom
// keys mirror views/group-v1635.js and META['mesna-ifosfamide-schedule'].example. Clinical domain.
// One label row: MESNEX.

import * as MS from '../../lib/mesna-ifosfamide-schedule-v1635.js';

export default [
  {
    id: 'mesna-ifosfamide-schedule',
    summary: 'Mesna doses and times from a bolus ifosfamide dose, as the MESNEX label states them. All intravenous is 20% of the ifosfamide dose at 0, 4 and 8 hours; intravenous then oral is 20% at 0 hours and 40% by mouth at 2 and 6 hours. Above 2 g/m² of ifosfamide a day the label has not established the oral ratio, and the result says so. Continuous-infusion mesna is not in the label.',
    compute: (args) => MS.mesnaIfosfamideSchedule(args, new Date()),
    fields: [
      { dom: 'mis-dose', arg: 'dose', kind: 'number', required: true, label: 'Ifosfamide dose' },
      { dom: 'mis-unit', arg: 'unit', kind: 'enum', required: true, values: MS.UNITS.map((x) => x.value), label: 'Dose unit' },
      { dom: 'mis-bsa', arg: 'bsa', kind: 'number', label: 'Body surface area (needed for a dose per m²)', unit: 'm²' },
      { dom: 'mis-plan', arg: 'plan', kind: 'enum', required: true, values: MS.PLANS.map((x) => x.value), label: 'Route plan' },
      { dom: 'mis-start', arg: 'start', kind: 'string', label: 'Ifosfamide start (YYYY-MM-DDTHH:MM, optional)' },
    ],
  },
];
