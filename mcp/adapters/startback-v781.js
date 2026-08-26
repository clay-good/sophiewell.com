// spec-v781 MCP adapter: STarT Back in lib/startback-v781.js.
// The dom keys mirror the browser renderer (views/group-v781.js) and META['startback'].example.
// Eight agree booleans plus a five-level bothersomeness enum; the risk group needs both the
// total and the items 5-9 subscore. Clinical domain.

import { startBack } from '../../lib/startback-v781.js';

export default [
  {
    id: 'startback',
    summary: 'STarT Back Screening Tool (Hill 2008, Keele): stratifies low back pain in primary care into low, medium and high risk of persisting disability. Items 1-8 score 1 for agree; item 9 (bothersomeness) scores 1 only for "very much" or "extremely". Total 0-9, psychosocial subscore over items 5-9 is 0-5. Total <=3 low; total >=4 with subscore <=3 medium; total >=4 with subscore >=4 high. The GROUP, not the total, drives stratified care.',
    compute: startBack,
    fields: [
      { dom: 'sb-q1', arg: 'q1', kind: 'boolean', required: false, label: 'Pain spread down the leg' },
      { dom: 'sb-q2', arg: 'q2', kind: 'boolean', required: false, label: 'Pain in the shoulder or neck' },
      { dom: 'sb-q3', arg: 'q3', kind: 'boolean', required: false, label: 'Walked only short distances' },
      { dom: 'sb-q4', arg: 'q4', kind: 'boolean', required: false, label: 'Dressed more slowly than usual' },
      { dom: 'sb-q5', arg: 'q5', kind: 'boolean', required: false, label: 'Activity feels unsafe (subscore)' },
      { dom: 'sb-q6', arg: 'q6', kind: 'boolean', required: false, label: 'Worrying thoughts (subscore)' },
      { dom: 'sb-q7', arg: 'q7', kind: 'boolean', required: false, label: 'Pain will never improve (subscore)' },
      { dom: 'sb-q8', arg: 'q8', kind: 'boolean', required: false, label: 'Loss of enjoyment (subscore)' },
      { dom: 'sb-bother', arg: 'bother', kind: 'enum', values: ['not-at-all', 'slightly', 'moderately', 'very-much', 'extremely'], required: false, label: 'Bothersomeness (subscore)' },
    ],
  },
];
