// spec-v1397: MCP adapter. The dom keys mirror views/group-v1397.js and this tile's META example.

import * as PAA from '../../lib/tx-prescriptive-authority-agreement-v1397.js';

export default [
  {
    id: 'tx-prescriptive-authority-agreement',
    summary: "Whether a Texas prescriptive authority agreement meets the statute: the seven-FTE cap, nine required elements, and monthly meetings. Under Occupations Code section 157.0512 a physician may be party to agreements with no more than seven APRNs and PAs, or their full-time equivalent, except in a practice serving a medically underserved population or a hospital facility-based practice. The agreement must be written and signed, name the parties, state the practice, identify drugs that may or may not be prescribed, and plan for referral, emergencies, communication, alternate physicians, and quality assurance. Quality assurance meetings are documented and held at least once a month.",
    compute: PAA.txPrescriptiveAuthorityAgreement,
    fields: [
      { dom: 'paa-fte', arg: 'fte', kind: 'number', required: true, label: 'APRNs and PAs under agreement (FTE)' },
      { dom: 'paa-exempt', arg: 'exempt', kind: 'enum', required: true, label: 'Underserved or hospital facility-based practice', values: ['yes', 'no'] },
      { dom: 'paa-signed', arg: 'signed', kind: 'enum', label: 'Signed and dated in writing', values: ['yes', 'no'] },
      { dom: 'paa-parties', arg: 'parties', kind: 'enum', label: 'Parties named with addresses and licenses', values: ['yes', 'no'] },
      { dom: 'paa-practice', arg: 'practice', kind: 'enum', label: 'Practice, locations, or settings stated', values: ['yes', 'no'] },
      { dom: 'paa-drugs', arg: 'drugs', kind: 'enum', label: 'Drugs or devices that may or may not be prescribed', values: ['yes', 'no'] },
      { dom: 'paa-referral', arg: 'referral', kind: 'enum', label: 'Plan for consultation and referral', values: ['yes', 'no'] },
      { dom: 'paa-emergencies', arg: 'emergencies', kind: 'enum', label: 'Plan for patient emergencies', values: ['yes', 'no'] },
      { dom: 'paa-communication', arg: 'communication', kind: 'enum', label: 'Process for communication and sharing information', values: ['yes', 'no'] },
      { dom: 'paa-alternates', arg: 'alternates', kind: 'enum', label: 'Alternate physicians named, if used', values: ['yes', 'no'] },
      { dom: 'paa-qa', arg: 'qaPlan', kind: 'enum', label: 'Quality assurance plan (chart review, meetings)', values: ['yes', 'no'] },
      { dom: 'paa-meeting', arg: 'lastMeeting', kind: 'string', label: 'Last documented quality assurance meeting (YYYY-MM-DD)' },
      { dom: 'paa-asof', arg: 'asOf', kind: 'string', label: 'Check as of (YYYY-MM-DD)' },
    ],
  },
];
