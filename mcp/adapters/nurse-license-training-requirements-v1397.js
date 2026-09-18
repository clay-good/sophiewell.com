// spec-v1397: MCP adapter. The dom keys mirror views/group-v1397.js and this tile's META example.

import * as NLT from '../../lib/nurse-license-training-requirements-v1397.js';

export default [
  {
    id: 'nurse-license-training-requirements',
    summary: "Which mandated trainings a New York nurse needs, including the child-abuse update due November 17, 2026. Chapter 25 of the Laws of 2024 added identifying abuse of children with intellectual or developmental disabilities to the one-time child abuse identification course, and registered nurses and nurse practitioners must complete the updated curriculum by November 17, 2026: a 15-minute addendum for those trained between November 1, 2022 and August 31, 2025, the updated two-hour course for those trained earlier or never. NYSED does not list licensed practical nurses for this course. Infection control is due every four years for RNs and LPNs practicing in New York (Education Law 6505-b). New Jersey, California, and Texas follow once their rules are read.",
    compute: NLT.nurseLicenseTrainingRequirements,
    fields: [
      { dom: 'nlt-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: NLT.NLT_STATES.map((s) => s.value) },
      { dom: 'nlt-license', arg: 'license', kind: 'enum', required: true, label: 'License', values: NLT.LICENSES.map((s) => s.value) },
      { dom: 'nlt-practicing', arg: 'practicingNY', kind: 'enum', required: true, label: 'Practicing in New York', values: ['yes', 'no'] },
      { dom: 'nlt-abuse', arg: 'abuseDate', kind: 'string', label: 'Child abuse identification course completed (YYYY-MM-DD)' },
      { dom: 'nlt-exempt', arg: 'abuseExempt', kind: 'enum', label: 'Child abuse training exemption claimed', values: ['yes', 'no'] },
      { dom: 'nlt-infection', arg: 'infectionDate', kind: 'string', label: 'Infection control course completed (YYYY-MM-DD)' },
    ],
  },
];
