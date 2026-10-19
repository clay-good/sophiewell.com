// spec-v1655 MCP adapter: hcp-illness-return-date in lib/hcp-illness-return-date-v1655.js. The dom keys mirror views/group-v1655.js and
// META['hcp-illness-return-date'].example.

import * as HCI from '../../lib/hcp-illness-return-date-v1655.js';

const YES_NO = ['yes', 'no'];

export default [
  {
    id: 'hcp-illness-return-date',
    summary: 'When CDC\'s work exclusion ends for a healthcare worker with an infection, from the onset date or the start of effective therapy. It covers measles, mumps, rubella, pertussis, varicella, group A streptococcal and meningococcal disease.',
    compute: HCI.hcpIllnessReturnDate,
    fields: [
      { dom: 'hci-condition', arg: 'condition', kind: 'enum', values: HCI.CONDITIONS.map((c) => c.value), required: true, label: 'Infection' },
      { dom: 'hci-onset', arg: 'onsetDate', kind: 'string', required: false, label: 'Onset date: rash, parotitis, first symptom or cough (YYYY-MM-DD)' },
      { dom: 'hci-therapy', arg: 'therapyStart', kind: 'string', required: false, label: 'Effective antimicrobial therapy started (YYYY-MM-DDTHH:MM)' },
      { dom: 'hci-crusted', arg: 'lesionsCrusted', kind: 'enum', values: YES_NO, required: false, label: 'Varicella: all lesions dried and crusted' },
    ]
  },
];
