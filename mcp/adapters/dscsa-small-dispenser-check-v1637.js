// spec-v1637 MCP adapter: dscsa-small-dispenser-check in lib/dscsa-small-dispenser-check-v1637.js.
// The dom key mirrors views/group-v1637.js and META['dscsa-small-dispenser-check'].example.
// Administrative domain. The clock is read only for the exemption's end date.

import * as SD from '../../lib/dscsa-small-dispenser-check-v1637.js';

export default [
  {
    id: 'dscsa-small-dispenser-check',
    summary: 'Whether a pharmacy is a small business dispenser under FDA\'s DSCSA exemptions. The test is 25 or fewer full-time pharmacists and pharmacy technicians across the company that owns it, as of November 27, 2026. Lists what the exemption covers and that it runs until November 27, 2027 (FDA letter of August 6, 2026).',
    compute: (args) => SD.dscsaSmallDispenserCheck(args, new Date()),
    fields: [
      { dom: 'dsd-staff', arg: 'fullTimeStaff', kind: 'number', required: true, label: 'Full-time pharmacists and pharmacy technicians, company-wide' },
    ],
  },
];
