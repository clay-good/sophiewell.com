// spec-v790 MCP adapter: 2018 Lake Louise Criteria in lib/lake-louise-cmr-v790.js.
// The dom keys mirror the browser renderer (views/group-v790.js) and
// META['lake-louise-cmr'].example. Six booleans in two prongs; one from EACH is required.
// Clinical domain. Distinct from lake-louise-ams, the mountain sickness score.

import { lakeLouiseCmr } from '../../lib/lake-louise-cmr-v790.js';

export default [
  {
    id: 'lake-louise-cmr',
    summary: '2018 Lake Louise Criteria (Ferreira 2018) for myocarditis on cardiac MRI. A positive study needs at least one marker from EACH of two prongs, never two from the same one. T2-based (edema): raised myocardial T2 relaxation time, visible edema on T2-weighted images, raised T2 signal intensity ratio. T1-based (injury): raised myocardial T1 relaxation time, raised extracellular volume fraction, late gadolinium enhancement in a non-ischemic pattern. Sensitivity approx 88%, specificity approx 96% against biopsy. Not the mountain sickness score of the same name.',
    compute: lakeLouiseCmr,
    fields: [
      { dom: 'llc-t2map', arg: 't2Mapping', kind: 'boolean', required: false, label: 'T2: raised T2 relaxation time' },
      { dom: 'llc-t2edema', arg: 't2Edema', kind: 'boolean', required: false, label: 'T2: visible myocardial edema' },
      { dom: 'llc-t2ratio', arg: 't2Ratio', kind: 'boolean', required: false, label: 'T2: raised signal intensity ratio' },
      { dom: 'llc-t1map', arg: 't1Mapping', kind: 'boolean', required: false, label: 'T1: raised T1 relaxation time' },
      { dom: 'llc-ecv', arg: 'ecv', kind: 'boolean', required: false, label: 'T1: raised extracellular volume' },
      { dom: 'llc-lge', arg: 'lge', kind: 'boolean', required: false, label: 'T1: non-ischemic late enhancement' },
    ],
  },
];
