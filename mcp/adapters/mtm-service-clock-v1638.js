// spec-v1638 MCP adapter: mtm-service-clock in lib/mtm-service-clock-v1638.js. The dom keys mirror
// views/group-v1638.js and META['mtm-service-clock'].example. Administrative domain. No clock: the
// as-of date is an input.

import { mtmServiceClock } from '../../lib/mtm-service-clock-v1638.js';

export default [
  {
    id: 'mtm-service-clock',
    summary: 'Part D MTM review dates and the CMR completion rate from a list of enrollees. Gives each CMR offer due date (60 days after enrollment, or one year after the last offer, by CMS guidance), the quarters with no targeted medication review, enrollees with no CMR this year, and the completion rate by CMS\'s method with each exclusion.',
    compute: mtmServiceClock,
    fields: [
      { dom: 'msc-year', arg: 'contractYear', kind: 'number', required: true, label: 'Contract year', min: 2020, max: 2100 },
      { dom: 'msc-asof', arg: 'asOf', kind: 'string', required: true, label: 'As-of date (YYYY-MM-DD)' },
      { dom: 'msc-enrollees', arg: 'enrollees', kind: 'string', required: true, label: 'Enrollees, one per line: enrollee, enrolled, prior year (yes/no), last CMR offer, CMR dates, TMR dates, opt-out, age, hospice (yes/no), met CMS criteria (yes/no)' },
    ],
  },
];
