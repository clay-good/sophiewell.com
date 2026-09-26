// spec-v1511: MCP adapter for the iPLEDGE dispense window. The dom keys mirror views/group-v1511.js.

import * as IP from '../../lib/ipledge-v1511.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'ipledge-dispense-window',
    summary: 'The last day isotretinoin may be dispensed under iPLEDGE. Day 7 from the pregnancy test specimen, or 30 days from the visit, with the 2026 modification.',
    compute: IP.ipledgeWindow,
    fields: [
      { dom: 'ipl-can', arg: 'canGetPregnant', kind: 'enum', required: true, values: vals(IP.YES_NO), label: 'Patient can get pregnant' },
      { dom: 'ipl-start', arg: 'startDate', kind: 'string', required: true, label: 'Specimen collection date, or office visit date if the patient cannot get pregnant (YYYY-MM-DD)' },
      { dom: 'ipl-first', arg: 'firstPrescription', kind: 'enum', required: false, values: vals(IP.YES_NO), label: 'First prescription of the course' },
      { dom: 'ipl-check', arg: 'checkDate', kind: 'string', required: false, label: 'Date to check (YYYY-MM-DD; blank for today)' },
    ],
  },
];
