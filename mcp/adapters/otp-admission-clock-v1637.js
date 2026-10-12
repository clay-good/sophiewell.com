// spec-v1637 MCP adapter: otp-admission-clock in lib/otp-admission-clock-v1637.js. The dom keys
// mirror views/group-v1637.js and META['otp-admission-clock'].example. Administrative domain.
// No clock: lateness is judged against the dates entered.

import * as OA from '../../lib/otp-admission-clock-v1637.js';

export default [
  {
    id: 'otp-admission-clock',
    summary: 'Opioid treatment program admission dates under 42 CFR 8.12. From the admission date: the full examination and the psychosocial assessment are due within 14 days; an outside screening examination may be no more than 7 days old and labs no more than 30. Interim treatment: a plan by day 120 and a 180-day limit. Checks the dates entered.',
    compute: OA.otpAdmissionClock,
    fields: [
      { dom: 'oac-admitted', arg: 'admitted', kind: 'string', required: true, label: 'Admission date (YYYY-MM-DD)' },
      { dom: 'oac-screened', arg: 'screened', kind: 'string', label: 'Date of the screening examination (YYYY-MM-DD)' },
      { dom: 'oac-by', arg: 'screenedBy', kind: 'enum', values: OA.SCREENERS.map((k) => k.value), label: 'Who did the screening examination' },
      { dom: 'oac-labs', arg: 'labsDrawn', kind: 'string', label: 'Date the labs were drawn (YYYY-MM-DD)' },
      { dom: 'oac-exam', arg: 'fullExam', kind: 'string', label: 'Date of the full in-person examination (YYYY-MM-DD)' },
      { dom: 'oac-assessment', arg: 'assessment', kind: 'string', label: 'Date of the psychosocial assessment and care plan (YYYY-MM-DD)' },
      { dom: 'oac-interim', arg: 'interimStart', kind: 'string', label: 'Interim treatment start date (YYYY-MM-DD)' },
    ],
  },
];
