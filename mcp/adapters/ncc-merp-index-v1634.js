// spec-v1634 MCP adapter: ncc-merp-index in lib/ncc-merp-index-v1634.js. The dom keys mirror
// views/group-v1634.js and META['ncc-merp-index'].example. Operational domain. Only the first
// question is always needed; each later one is asked when the path reaches it.

import * as NM from '../../lib/ncc-merp-index-v1634.js';

export default [
  {
    id: 'ncc-merp-index',
    summary: 'The NCC MERP medication error category, A to I, from the algorithm\'s questions. It walks the published algorithm in order (did an error occur, did it reach the patient, death, harm, monitoring or intervention, life-sustaining intervention, permanence, hospitalization) and returns the category with the Index\'s own definition and its group: no error; error, no harm; error, harm; error, death.',
    compute: NM.nccMerpIndex,
    fields: NM.QUESTIONS.map((q, i) => ({ dom: `nmi-${q.dom}`, arg: q.arg, kind: 'enum', values: ['yes', 'no'], ...(i === 0 ? { required: true } : {}), label: q.text })),
  },
];
