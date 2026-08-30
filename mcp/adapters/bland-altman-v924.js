// spec-v924 MCP adapter: Bland-Altman limits of agreement in lib/bland-altman-v924.js. The dom
// keys mirror the browser renderer (views/group-v924.js) and META['bland-altman'].example.
//
// The limits come back with their own confidence intervals, never bare. Clinical domain.

import { blandAltman } from '../../lib/bland-altman-v924.js';

export default [
  {
    id: 'bland-altman',
    summary: 'Computes Bland-Altman limits of agreement between two measurement methods. The bias is the mean of the differences; the limits are that bias plus and minus 1.96 standard deviations of the differences, and between them lie 95% of the differences expected in future pairs. A HIGH CORRELATION IS NOT AGREEMENT -- that is the sentence the 1986 paper exists to make: two methods can correlate almost perfectly and disagree by a clinically enormous margin, because correlation measures whether they move together and not whether they land in the same place. THE LIMITS DESCRIBE AND DO NOT JUDGE: whether the span is acceptable is a clinical decision the papers say should be set BEFORE the study, not read off the result. THE LIMITS ARE THEMSELVES ESTIMATES, so their confidence intervals come back beside them and are wide on a small sample. IF THE DIFFERENCE VARIES WITH THE SIZE OF THE MEASUREMENT a single pair of limits is the wrong summary, and only the plot can show that.',
    compute: blandAltman,
    fields: [
      { dom: 'ba-bias', arg: 'meanDifference', kind: 'number', required: true, label: 'Mean of the differences, in the units measured' },
      { dom: 'ba-sd', arg: 'sdOfDifferences', kind: 'number', required: true, label: 'Standard deviation of the differences' },
      { dom: 'ba-pairs', arg: 'pairs', kind: 'number', required: true, label: 'Number of paired measurements' },
    ],
  },
];
