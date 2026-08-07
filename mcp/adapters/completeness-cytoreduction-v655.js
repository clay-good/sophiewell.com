// spec-v655 MCP adapter: Completeness of Cytoreduction score in
// lib/completeness-cytoreduction-v655.js. The dom keys mirror the browser renderer
// (views/group-v655.js) and META['completeness-cytoreduction'].example. Decision-logic
// classifier from the largest residual nodule size (mm): 0 = CC-0, <2.5 = CC-1,
// 2.5-25 = CC-2, >25 = CC-3; a confluence bool forces CC-3. CC-0/1 = complete. Clinical domain.

import { completenessCytoreduction } from '../../lib/completeness-cytoreduction-v655.js';

export default [
  {
    id: 'completeness-cytoreduction',
    summary: 'Completeness of Cytoreduction (CC) score of Sugarbaker: largest residual tumor nodule after cytoreductive surgery. CC-0 none, CC-1 <2.5 mm, CC-2 2.5 mm-2.5 cm, CC-3 >2.5 cm or confluence. CC-0/CC-1 = complete cytoreduction. Companion to the Peritoneal Cancer Index.',
    compute: completenessCytoreduction,
    fields: [
      { dom: 'cc-residual', arg: 'residualMm', kind: 'number', required: false, label: 'Largest residual tumor nodule (mm): 0 = CC-0, <2.5 = CC-1, 2.5-25 = CC-2, >25 = CC-3' },
      { dom: 'cc-confluence', arg: 'confluence', kind: 'bool', required: false, label: 'Confluence of unresectable disease (forces CC-3)' },
    ],
  },
];
