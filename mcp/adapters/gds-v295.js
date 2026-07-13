// spec-v295 MCP wave: adapter for the Reisberg Global Deterioration Scale tile
// in lib/gds-v295.js. The single dom key mirrors the browser renderer
// (views/group-v295.js) and META['global-deterioration-scale'].example.fields.
// `stage` is a required enum over the 7 global stages; the compute returns the
// stage label and clinical descriptor and, at stage 5 and beyond, the
// needs-assistance flag. The `band` carries the "GDS stage 5" example, so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as G from '../../lib/gds-v295.js';

export default [
  {
    id: 'global-deterioration-scale',
    summary: 'Reisberg Global Deterioration Scale (GDS) for dementia: given the most appropriate global stage (1-7), reports the published stage label and clinical characteristics and, at stage 5 and beyond, that the patient can no longer survive without assistance. Stages 1-3 are pre-dementia (normal, age-associated memory impairment, mild cognitive impairment); 4-7 are dementia (mild, moderate, moderately severe, severe). Reports the guideline descriptor, not a diagnosis.',
    compute: G.gdsStage,
    fields: [
      { dom: 'gds-stage', arg: 'stage', kind: 'enum', required: true, values: ['1', '2', '3', '4', '5', '6', '7'], label: 'Most appropriate GDS global stage' },
    ],
  },
];
