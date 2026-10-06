// spec-v1554 MCP adapter: infant-hiv-test-schedule in lib/infant-hiv-test-schedule-v1554.js.
// The dom keys mirror views/group-v1554.js and META['infant-hiv-test-schedule'].example. Clinical domain.

import * as M from '../../lib/infant-hiv-test-schedule-v1554.js';

export default [
  {
    id: 'infant-hiv-test-schedule',
    summary: 'Says when the next HIV test is due for an HIV-exposed infant and which test: NAT at 4-6 weeks and 9 months, then the final antibody test at 18 months or 3 months after weaning, whichever is later.',
    compute: M.infantHivTestSchedule,
    fields: [
      { dom: 'ih-age', arg: 'age', kind: 'number', required: true, label: 'Infant age in weeks', min: 0, max: 260 },
      { dom: 'ih-feeding', arg: 'feeding', kind: 'enum', required: true, label: 'Breastfeeding', values: M.FEEDING_OPTIONS.map((d) => d.value) },
      { dom: 'ih-stopped', arg: 'stoppedAt', kind: 'number', label: 'Age in weeks when breastfeeding stopped', min: 0, max: 260 },
      { dom: 'ih-nat6', arg: 'nat6', kind: 'enum', required: true, label: 'NAT at 4-6 weeks', values: M.RESULT_OPTIONS.map((d) => d.value) },
      { dom: 'ih-nat9', arg: 'nat9', kind: 'enum', required: true, label: 'NAT at 9 months', values: M.RESULT_OPTIONS.map((d) => d.value) },
    ],
  },
];
