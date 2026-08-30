// spec-v923 MCP adapter: analytical performance specifications from biological variation in
// lib/biological-variation-goals-v923.js. The dom keys mirror the browser renderer
// (views/group-v923.js) and META['biological-variation-goals'].example.
//
// All three tiers come back on every result. Clinical domain.

import { biologicalVariationGoals } from '../../lib/biological-variation-goals-v923.js';

export default [
  {
    id: 'biological-variation-goals',
    summary: 'Derives analytical performance specifications from biological variation. Imprecision is a quarter, a half and three quarters of the within-subject variation at the optimum, desirable and minimum tiers. Bias is an eighth, a quarter and three eighths of the square root of the within- and between-subject variations squared and summed. Total error at each tier is 1.65 times that tier\'s imprecision plus its bias. THERE ARE THREE TIERS, NOT ONE SPECIFICATION: "the" biological-variation goal almost always means the desirable tier, and quoting it without saying so hides that optimum is twice as hard and minimum is half, so all three are returned every time. THESE ARE GOALS FROM BIOLOGY, NOT FROM WHAT AN ANALYZER CAN DO -- a method that misses them is not thereby unusable and a method that meets them is not thereby clinically sufficient, and the Milan hierarchy places outcome-based specifications above them. The bias and total-error goals need the between-subject variation; with only the within-subject one, the imprecision goals stand and the rest are returned as null.',
    compute: biologicalVariationGoals,
    fields: [
      { dom: 'bvg-cvi', arg: 'cvWithinSubject', kind: 'number', required: true, label: 'Within-subject biological variation', unit: 'CV %' },
      { dom: 'bvg-cvg', arg: 'cvBetweenSubject', kind: 'number', required: false, label: 'Between-subject biological variation, for the bias goals', unit: 'CV %' },
    ],
  },
];
