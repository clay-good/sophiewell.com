// spec-v723 MCP adapter: Silness-Loe Plaque Index in
// lib/silness-loe-plaque-index-v723.js. The dom keys mirror the browser renderer
// (views/group-v723.js) and META['silness-loe-plaque-index'].example. Four surface counts
// (scored 0/1/2/3); the weighted mean maps to an oral-hygiene band. Clinical domain.

import { silnessLoePlaqueIndex } from '../../lib/silness-loe-plaque-index-v723.js';

export default [
  {
    id: 'silness-loe-plaque-index',
    summary: 'Silness-Loe Plaque Index (Silness & Loe 1964): index of plaque thickness at the gingival margin. Each surface scored 0 (no plaque), 1 (film, only after disclosing/probing), 2 (moderate, visible), 3 (abundant soft matter). Index = mean of surface scores. Advisory bands: 0 excellent, 0.1-0.9 good, 1.0-1.9 fair, 2.0-3.0 poor oral hygiene.',
    compute: silnessLoePlaqueIndex,
    fields: [
      { dom: 'pli-0', arg: 'score0', kind: 'number', required: false, label: 'Surfaces scored 0 (no plaque)' },
      { dom: 'pli-1', arg: 'score1', kind: 'number', required: false, label: 'Surfaces scored 1 (film)' },
      { dom: 'pli-2', arg: 'score2', kind: 'number', required: false, label: 'Surfaces scored 2 (moderate)' },
      { dom: 'pli-3', arg: 'score3', kind: 'number', required: false, label: 'Surfaces scored 3 (abundant)' },
    ],
  },
];
