// spec-v801 MCP adapter: Hodapp-Parrish-Anderson staging in lib/hpa-glaucoma-v801.js.
// The dom keys mirror the browser renderer (views/group-v801.js) and
// META['hpa-glaucoma'].example. Four criteria; the MOST SEVERE sets the grade.
// Clinical domain.

import { hpaGlaucoma } from '../../lib/hpa-glaucoma-v801.js';

export default [
  {
    id: 'hpa-glaucoma',
    summary: 'Stages a glaucomatous visual field defect (Hodapp-Parrish-Anderson). Four readings come off one test and the MOST SEVERE sets the overall grade: mean deviation better than -6 dB early, -6 to -12 moderate, worse than -12 severe; and any depression in both hemifields within the central 5 degrees, or a point at 0 dB, is severe.',
    compute: hpaGlaucoma,
    fields: [
      { dom: 'hpa-md', arg: 'meanDeviation', kind: 'number', required: false, label: 'Mean deviation', unit: 'dB' },
      { dom: 'hpa-pct5', arg: 'percentBelow5', kind: 'number', required: false, label: 'Points below 5% level', unit: '%' },
      { dom: 'hpa-count1', arg: 'countBelow1', kind: 'number', required: false, label: 'Points below 1% level (of 76)' },
      { dom: 'hpa-central', arg: 'central', kind: 'enum', values: ['all-above-15', 'one-hemifield', 'both-or-zero'], required: false, label: 'Central 5 degrees' },
    ],
  },
];
