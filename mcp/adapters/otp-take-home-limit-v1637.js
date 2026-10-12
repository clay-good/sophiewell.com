// spec-v1637 MCP adapter: otp-take-home-limit in lib/otp-take-home-limit-v1637.js. The dom keys
// mirror views/group-v1637.js and META['otp-take-home-limit'].example. Administrative domain:
// it reports a regulatory ceiling and recommends no supply. No clock.

import * as TH from '../../lib/otp-take-home-limit-v1637.js';

export default [
  {
    id: 'otp-take-home-limit',
    summary: 'The federal ceiling on methadone take-home doses in an opioid treatment program. By treatment day (42 CFR 8.12(i)): 7 days during the first 14 days, 14 days from day 15, 28 days from day 31. Checks a proposed supply and a first-day dose over 50 mg. Buprenorphine has no federal ceiling. It reports the ceiling and recommends nothing.',
    compute: TH.otpTakeHomeLimit,
    fields: [
      { dom: 'oth-med', arg: 'medication', kind: 'enum', required: true, values: TH.MEDICATIONS.map((k) => k.value), label: 'Medication' },
      { dom: 'oth-admitted', arg: 'admitted', kind: 'string', label: 'Admission date (YYYY-MM-DD)' },
      { dom: 'oth-on', arg: 'dispensedOn', kind: 'string', label: 'Date the supply would be dispensed (YYYY-MM-DD)' },
      { dom: 'oth-day', arg: 'treatmentDay', kind: 'number', label: 'Treatment day, in place of the two dates' },
      { dom: 'oth-proposed', arg: 'proposedDays', kind: 'number', label: 'Proposed take-home supply', unit: 'days' },
      { dom: 'oth-state', arg: 'stateCeilingDays', kind: 'number', label: 'State ceiling, if lower', unit: 'days' },
      { dom: 'oth-dose', arg: 'firstDayDose', kind: 'number', label: 'Total methadone dose on the first day', unit: 'mg' },
    ],
  },
];
