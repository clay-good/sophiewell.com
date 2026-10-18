// spec-v1634 MCP adapter: dips-interaction in lib/dips-interaction-v1634.js. The dom keys mirror
// views/group-v1634.js and META['dips-interaction'].example. Clinical domain.

import * as DI from '../../lib/dips-interaction-v1634.js';

const ans = DI.ANSWERS.map((x) => x.value);
const DOM = { reports: 'dip-1', precipitant: 'dip-2', object: 'dip-3', timeCourse: 'dip-4', dechallenge: 'dip-5', rechallenge: 'dip-6', alternatives: 'dip-7', levels: 'dip-8', objective: 'dip-9', doseResponse: 'dip-10' };
export default [
  {
    id: 'dips-interaction',
    summary: 'Drug Interaction Probability Scale (Horn 2007) for one suspected interaction. Ten yes, no or unknown answers give a score and a band: doubtful, possible, probable or highly probable.',
    compute: DI.dipsInteraction,
    fields: DI.QUESTIONS.map(([arg, label]) => ({ dom: DOM[arg], arg, kind: 'enum', required: arg !== 'rechallenge', values: ans, label })),
  },
];
