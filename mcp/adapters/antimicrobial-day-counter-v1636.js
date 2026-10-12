// spec-v1636 MCP adapter: antimicrobial-day-counter in lib/antimicrobial-day-counter-v1636.js. The
// dom keys mirror views/group-v1636.js and META['antimicrobial-day-counter'].example.
// Administrative domain: counts over the caller's own rows. No clock, no label row.

import { antimicrobialDayCounter } from '../../lib/antimicrobial-day-counter-v1636.js';

export default [
  {
    id: 'antimicrobial-day-counter',
    summary: 'Counts NHSN antimicrobial days and days present from rows. One day per patient, agent and calendar day, by location and facility-wide, with the four routes; days present count admission, discharge and transfer days, and a transfer day counts in both locations. Rows it cannot place are listed. It does not check agents against the NHSN list or count admissions.',
    compute: antimicrobialDayCounter,
    fields: [
      { dom: 'adc-admins', arg: 'administrations', kind: 'string', label: 'Administrations, one per line: patient, agent, route, date (YYYY-MM-DD), location' },
      { dom: 'adc-stays', arg: 'stays', kind: 'string', label: 'Stays, one per line: patient, location, date in, date out (YYYY-MM-DD)' },
      { dom: 'adc-out', arg: 'outpatientLocations', kind: 'string', label: 'Locations to leave out of the facility-wide counts, separated by commas' },
    ],
  },
];
