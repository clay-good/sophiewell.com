// spec-v695 MCP adapter: Manning Criteria for IBS in lib/manning-ibs-v695.js.
// The dom keys mirror the browser renderer (views/group-v695.js) and
// META['manning-ibs'].example. Six booleans; a count 0-6 maps to an IBS-likelihood band.
// Clinical domain.

import { manningIbs } from '../../lib/manning-ibs-v695.js';

export default [
  {
    id: 'manning-ibs',
    summary: 'Manning Criteria for IBS (Manning 1978): count six symptoms - pain with more frequent stools, looser stools with pain onset, pain relieved by defecation, abdominal bloating, incomplete evacuation >25% of the time, mucus per rectum >25% of the time. Count 0-6; >= 3 supports IBS provided alarm features are absent. Companion to Rome IV.',
    compute: manningIbs,
    fields: [
      { dom: 'manning-freq', arg: 'painFrequentBm', kind: 'boolean', required: false, label: 'Pain linked to more frequent bowel movements' },
      { dom: 'manning-loose', arg: 'painLooserStool', kind: 'boolean', required: false, label: 'Looser stools with the onset of pain' },
      { dom: 'manning-relief', arg: 'painRelievedByStool', kind: 'boolean', required: false, label: 'Pain relieved by passage of stool' },
      { dom: 'manning-bloat', arg: 'bloating', kind: 'boolean', required: false, label: 'Noticeable abdominal bloating' },
      { dom: 'manning-incomplete', arg: 'incompleteEvac', kind: 'boolean', required: false, label: 'Incomplete evacuation >25% of the time' },
      { dom: 'manning-mucus', arg: 'mucus', kind: 'boolean', required: false, label: 'Mucus with stool >25% of the time' },
    ],
  },
];
