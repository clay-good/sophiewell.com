// spec-v668 MCP adapter: CAC Agatston score interpretation in lib/cac-agatston-v668.js.
// The dom key mirrors the browser renderer (views/group-v668.js) and
// META['cac-agatston'].example. One integer total Agatston score -> category (0 none,
// 1-99 mild, 100-399 moderate, >=400 severe). The statin-decision context is advisory.
// Clinical domain.

import { cacAgatston } from '../../lib/cac-agatston-v668.js';

export default [
  {
    id: 'cac-agatston',
    summary: 'Coronary artery calcium (CAC) Agatston score interpretation (Agatston 1990): a total score of 0 = no plaque, 1-99 = mild, 100-399 = moderate, >=400 = severe/extensive. In borderline/intermediate-risk primary prevention, the 2018 ACC/AHA guideline uses CAC to guide statin decisions (0 defer, 1-99 favor esp >=55, >=100 or >=75th percentile favor). Advisory, not an order.',
    compute: cacAgatston,
    fields: [
      { dom: 'cac-score', arg: 'score', kind: 'number', required: true, label: 'Total coronary artery calcium (Agatston) score' },
    ],
  },
];
