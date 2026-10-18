// spec-v1634 MCP adapter: mai-score in lib/mai-score-v1634.js. The dom keys mirror views/group-v1634.js and
// META['mai-score'].example. Clinical domain.

import * as MA from '../../lib/mai-score-v1634.js';

const r = MA.RATINGS.map((x) => x.value);
const DOM = { indication: 'mai-ind', effectiveness: 'mai-eff', dosage: 'mai-dose', directionsCorrect: 'mai-dirc', interactionsDrug: 'mai-ddi', interactionsDisease: 'mai-ddx', directionsPractical: 'mai-dirp', duplication: 'mai-dup', duration: 'mai-dur', expense: 'mai-exp' };
export default [
  {
    id: 'mai-score',
    summary: 'Medication Appropriateness Index, summated, for one drug. Ten criteria rated appropriate, marginal or inappropriate; each inappropriate rating adds its weight, 0 to 18 per drug, with an optional regimen total.',
    compute: MA.maiScore,
    fields: [
      ...MA.CRITERIA.map(([arg, label]) => ({ dom: DOM[arg], arg, kind: 'enum', required: true, values: r, label })),
      { dom: 'mai-others', arg: 'otherScores', kind: 'string', required: false, label: 'Other drugs\' MAI scores for a regimen total (optional)' },
    ],
  },
];
