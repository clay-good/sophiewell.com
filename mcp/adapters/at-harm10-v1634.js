// spec-v1634 MCP adapter: at-harm10 in lib/at-harm10-v1634.js. The dom keys mirror
// views/group-v1634.js and META['at-harm10'].example. Operational domain. Questions are answered in
// order; the first yes ends the assessment, so later answers may be left out.

import * as AH from '../../lib/at-harm10-v1634.js';

export default [
  {
    id: 'at-harm10',
    summary: 'AT-HARM10: was this hospital admission possibly medication-related? Ten yes or no questions in order; a yes at U1 to U3 means unlikely, a yes at P4 to P10 means possibly, and the first yes ends the assessment. It reports the class, the deciding question and the paper\'s validity figures. A screening classification for research and audit, not a finding of cause.',
    compute: AH.atHarm10,
    fields: AH.QUESTIONS.map((q, i) => ({ dom: `ath-${q.arg}`, arg: q.arg, kind: 'enum', values: ['yes', 'no'], ...(i === 0 ? { required: true } : {}), label: AH.SHORT[q.arg] })),
  },
];
