// spec-v1552 MCP adapter: IPTp-SP schedule in lib/iptp-sp-schedule-v1552.js.
// The dom keys mirror views/group-v1552.js and META['iptp-sp-schedule'].example. Clinical domain.

import * as I from '../../lib/iptp-sp-schedule-v1552.js';

export default [
  {
    id: 'iptp-sp-schedule',
    summary: 'Says whether an IPTp-SP dose for malaria in pregnancy is due today. Not before week 13, at least a month apart, 3 tablets of SP observed, and not with cotrimoxazole or another contraindication.',
    compute: I.iptpSpSchedule,
    fields: [
      { dom: 'ip-weeks', arg: 'weeks', kind: 'number', required: true, label: 'Gestational age, completed weeks', min: 4, max: 44 },
      { dom: 'ip-days', arg: 'days', kind: 'number', label: 'Plus days (0-6)', min: 0, max: 6 },
      { dom: 'ip-contra', arg: 'contra', kind: 'enum', required: true, label: 'Contraindication', values: I.CONTRA_OPTIONS.map((d) => d.value) },
      { dom: 'ip-prev', arg: 'previous', kind: 'enum', required: true, label: 'Previous IPTp dose', values: I.PREVIOUS_OPTIONS.map((d) => d.value) },
      { dom: 'ip-since', arg: 'since', kind: 'number', label: 'Weeks since the last dose', min: 0, max: 40 },
      { dom: 'ip-folic', arg: 'folic', kind: 'enum', label: 'Folic acid', values: I.FOLIC_OPTIONS.map((d) => d.value) },
    ],
  },
];
