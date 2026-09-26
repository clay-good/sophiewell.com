// spec-v1507: MCP adapter for the Medicare enrollment window. The dom keys mirror views/group-v1507.js.

import * as MW from '../../lib/medicare-enrollment-window-v1507.js';

export default [
  {
    id: 'medicare-enrollment-window',
    summary: 'Which Medicare Part B enrollment window is open on a date, and when coverage starts. Covers the initial, special and general periods.',
    compute: MW.medicareEnrollmentWindow,
    fields: [
      { dom: 'mew-birth', arg: 'birthDate', kind: 'string', required: false, label: 'Date of birth (YYYY-MM-DD)' },
      { dom: 'mew-elig', arg: 'eligibleFrom', kind: 'string', required: false, label: 'Disability: first month of eligibility (YYYY-MM-DD)' },
      { dom: 'mew-enroll', arg: 'enrollDate', kind: 'string', required: true, label: 'Date of signing up or to check (YYYY-MM-DD)' },
      { dom: 'mew-cov', arg: 'employerCoverageEnd', kind: 'string', required: false, label: 'Last day of employer coverage from current work (YYYY-MM-DD)' },
    ],
  },
];
