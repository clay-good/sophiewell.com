// spec-v1634 MCP adapter: stoppfall-check in lib/stoppfall-check-v1634.js. The dom keys mirror
// views/group-v1634.js and META['stoppfall-check'].example. Clinical domain. All 14 classes required.

import * as SF from '../../lib/stoppfall-check-v1634.js';

export default [
  {
    id: 'stoppfall-check',
    summary: 'The STOPPFall fall-risk-increasing drug classes present in a medication list. For each of the 14 classes an expert panel agreed on (psychotropics, opioids, antiepileptics, anticholinergics, several blood pressure and bladder drugs), it lists which are present and counts them. The paper defines no score or cutoff, and a class being present is not advice to stop it.',
    compute: SF.stoppfallCheck,
    fields: SF.CLASSES.map((c) => ({ dom: `spf-${c.dom}`, arg: c.arg, kind: 'enum', required: true, values: ['yes', 'no'], label: c.text })),
  },
];
