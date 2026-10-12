// spec-v1636 MCP adapter: au-rate-saar in lib/au-rate-saar-v1636.js. The dom keys mirror
// views/group-v1636.js and META['au-rate-saar'].example. Administrative domain (surveillance).

import * as AU from '../../lib/au-rate-saar-v1636.js';

export default [
  {
    id: 'au-rate-saar',
    summary: 'Antimicrobial use rates in the CDC NHSN definitions: antimicrobial days per 1,000 days present, per 100 admissions (facility-wide inpatient only), and the SAAR as observed over predicted days. The predicted days are the reader\'s, from the facility\'s NHSN report; the tool does not predict. It prints the protocol\'s check on how facility-wide days present are counted.',
    compute: (args) => AU.auRateSaar(args),
    fields: [
      { dom: 'aur-scope', arg: 'scope', kind: 'enum', required: true, values: AU.SCOPES.map((x) => x.value), label: 'Scope' },
      { dom: 'aur-days', arg: 'antimicrobialDays', kind: 'number', required: true, label: 'Antimicrobial days' },
      { dom: 'aur-present', arg: 'daysPresent', kind: 'number', required: true, label: 'Days present' },
      { dom: 'aur-admissions', arg: 'admissions', kind: 'number', label: 'Admissions (facility-wide inpatient only; optional)' },
      { dom: 'aur-predicted', arg: 'predictedDays', kind: 'number', label: 'Predicted antimicrobial days from the NHSN report (optional, for the SAAR)' },
    ],
  },
];
