// spec-v1638 MCP adapter: ccm-time-units in lib/ccm-time-units-v1638.js. The dom keys mirror
// views/group-v1638.js and META['ccm-time-units'].example. Administrative domain. No clock.

import * as CC from '../../lib/ccm-time-units-v1638.js';

export default [
  {
    id: 'ccm-time-units',
    summary: 'Chronic care management codes from the minutes in a calendar month, by CMS\'s time thresholds. Staff time: 99490 for the first 20 minutes, 99439 per further 20. Practitioner\'s own time: 99491 for 30, 99437 per further 30. Complex: 99487 for 60, 99489 per further 30. Shows minutes used and minutes short of the next unit.',
    compute: CC.ccmTimeUnits,
    fields: [
      { dom: 'ccm-kind', arg: 'kind', kind: 'enum', required: true, values: CC.KINDS.map((k) => k.value), label: 'Codes being reported' },
      { dom: 'ccm-staff', arg: 'staffMinutes', kind: 'number', label: 'Clinical staff time this calendar month', unit: 'minutes' },
      { dom: 'ccm-own', arg: 'practitionerMinutes', kind: 'number', label: 'Time spent personally by the billing practitioner', unit: 'minutes' },
    ],
  },
];
