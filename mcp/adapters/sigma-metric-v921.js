// spec-v921 MCP adapter: the sigma metric in lib/sigma-metric-v921.js. The dom keys mirror the
// browser renderer (views/group-v921.js) and META['sigma-metric'].example.
//
// The result always names the goal the answer belongs to. Clinical domain.

import { sigmaMetric } from '../../lib/sigma-metric-v921.js';

export default [
  {
    id: 'sigma-metric',
    summary: 'Computes the sigma metric of a laboratory method. Sigma is the total allowable error minus the absolute bias, divided by the imprecision, with all three as percentages. THE ANSWER IS ONLY AS GOOD AS THE GOAL: sigma is a property of a method AND a goal together, never of the method alone, and CLIA, the biological-variation goals, RCPA and EFLM all publish different allowable errors for the same analyte, so the same method can be six sigma against one and three against another. Nothing here chooses a goal, and every result names the one the answer belongs to. BIAS EATS THE BUDGET BEFORE IMPRECISION DOES, because it is subtracted from the goal first, so a method with a large bias can fail while looking precise -- and when the bias alone exceeds the allowable error there is no budget left, which is not a small sigma but a method that cannot meet the goal. BELOW THREE IS NOT A BIT WORSE: three is the floor at which the standard control rules can be run at all. Published bands: 6+ world class, 5-6 excellent, 4-5 good, 3-4 marginal, below 3 unacceptable.',
    compute: sigmaMetric,
    fields: [
      { dom: 'sm-tea', arg: 'totalAllowableError', kind: 'number', required: true, label: 'Total allowable error, the goal', unit: '%' },
      { dom: 'sm-bias', arg: 'bias', kind: 'number', required: true, label: 'Bias, signed; it enters as its size', unit: '%' },
      { dom: 'sm-cv', arg: 'cv', kind: 'number', required: true, label: 'Imprecision', unit: 'CV %' },
    ],
  },
];
