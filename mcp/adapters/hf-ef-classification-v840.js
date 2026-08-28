// spec-v840 MCP adapter: heart failure classification by ejection fraction in
// lib/hf-ef-classification-v840.js. The dom keys mirror the browser renderer
// (views/group-v840.js) and META['hf-ef-classification'].example.
//
// baselineLvef is a first-class field: without it HFimpEF cannot be reached, and those
// patients get classified HFmrEF instead. Clinical domain.

import { hfEfClassification } from '../../lib/hf-ef-classification-v840.js';

export default [
  {
    id: 'hf-ef-classification',
    summary: 'Classifies symptomatic heart failure by ejection fraction under the 2021 universal definition. HFrEF at or below 40; HFmrEF 41-49; HFpEF 50 or above. HFimpEF needs ALL THREE of a baseline at or below 40, a rise of at least 10 points, and a current value above 40 - it is a trajectory, not a threshold, so a single ejection fraction cannot express it and those patients are quietly called HFmrEF.',
    compute: hfEfClassification,
    fields: [
      { dom: 'hfef-symptomatic', arg: 'symptomaticHeartFailure', kind: 'boolean', required: false, label: 'Symptomatic heart failure present' },
      { dom: 'hfef-current', arg: 'currentLvef', kind: 'number', required: false, label: 'Current LVEF, percent' },
      { dom: 'hfef-baseline', arg: 'baselineLvef', kind: 'number', required: false, label: 'Baseline LVEF, percent' },
    ],
  },
];
