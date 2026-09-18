// spec-v1397: MCP adapter. The dom keys mirror views/group-v1397.js and this tile's META example.

import * as NP from '../../lib/ca-np-103-104-tracker-v1397.js';

export default [
  {
    id: 'ca-np-103-104-tracker',
    summary: "When a California nurse practitioner reaches 103 and 104 status. Under Business and Professions Code 2837.103, a 103 NP practices without standardized procedures in a group setting with physicians after national board examination and certification, board-standard education, and a California transition to practice of three full-time years or 4,600 hours. Under 2837.104, a 104 NP practices outside those settings after also holding an active California RN license and a master's or doctoral nursing degree, and practicing as an NP in good standing for three more years not counting the transition to practice.",
    compute: NP.caNp103104Tracker,
    fields: [
      { dom: 'np-asof', arg: 'asOf', kind: 'string', required: true, label: 'Check as of (YYYY-MM-DD)' },
      { dom: 'np-ttp-start', arg: 'ttpStart', kind: 'string', label: 'Full-time transition to practice began (YYYY-MM-DD)' },
      { dom: 'np-ttp-hours', arg: 'ttpHours', kind: 'number', label: 'Transition-to-practice hours completed' },
      { dom: 'np-exam', arg: 'boardExam', kind: 'enum', label: 'Passed the national NP board examination', values: ['yes', 'no'] },
      { dom: 'np-cert', arg: 'nationalCert', kind: 'enum', label: 'Holds national NP certification', values: ['yes', 'no'] },
      { dom: 'np-edu', arg: 'education', kind: 'enum', label: 'Education meets board standards', values: ['yes', 'no'] },
      { dom: 'np-rn', arg: 'rnActive', kind: 'enum', label: 'Active California RN license', values: ['yes', 'no'] },
      { dom: 'np-degree', arg: 'degree', kind: 'enum', label: "Master's or doctoral nursing degree", values: ['yes', 'no'] },
      { dom: 'np-post', arg: 'postTtpYears', kind: 'number', label: 'Years of NP practice after the transition to practice' },
    ],
  },
];
