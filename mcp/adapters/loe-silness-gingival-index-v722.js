// spec-v722 MCP adapter: Loe-Silness Gingival Index in
// lib/loe-silness-gingival-index-v722.js. The dom keys mirror the browser renderer
// (views/group-v722.js) and META['loe-silness-gingival-index'].example. Four surface counts
// (scored 0/1/2/3); the weighted mean maps to a gingivitis band. Clinical domain.

import { loeSilnessGingivalIndex } from '../../lib/loe-silness-gingival-index-v722.js';

export default [
  {
    id: 'loe-silness-gingival-index',
    summary: 'Loe-Silness Gingival Index (Loe & Silness 1963): index of gingival inflammation. Each surface scored 0 (normal), 1 (mild, no bleeding on probing), 2 (moderate, bleeds on probing), 3 (severe, spontaneous bleeding). Index = mean of surface scores. Bands: 0 healthy, 0.1-1.0 mild, 1.1-2.0 moderate, 2.1-3.0 severe gingivitis.',
    compute: loeSilnessGingivalIndex,
    fields: [
      { dom: 'gi-0', arg: 'score0', kind: 'number', required: false, label: 'Surfaces scored 0 (normal)' },
      { dom: 'gi-1', arg: 'score1', kind: 'number', required: false, label: 'Surfaces scored 1 (mild)' },
      { dom: 'gi-2', arg: 'score2', kind: 'number', required: false, label: 'Surfaces scored 2 (moderate)' },
      { dom: 'gi-3', arg: 'score3', kind: 'number', required: false, label: 'Surfaces scored 3 (severe)' },
    ],
  },
];
