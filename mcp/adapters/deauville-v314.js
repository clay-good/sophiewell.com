// spec-v314 MCP wave: adapter for the Deauville 5-point score (FDG-PET metabolic
// response in lymphoma) in lib/deauville-v314.js. The dom key mirrors the browser
// renderer (views/group-v314.js) and META['deauville-score'].example. `score` is an
// enum (1-5), required (the compute throws without it). The compute returns the
// score with its uptake description and the Lugano interpretation. The band carries
// the "score 4 -> positive" example, so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as D from '../../lib/deauville-v314.js';

export default [
  {
    id: 'deauville-score',
    summary: 'Deauville 5-point score (Lugano classification, Barrington 2014) for FDG-PET response assessment in lymphoma: 1 = no uptake above background; 2 = uptake <= mediastinum; 3 = uptake > mediastinum but <= liver; 4 = uptake moderately > liver; 5 = uptake markedly > liver and/or new lesions. Scores 1-2 are negative (complete metabolic response), 4-5 are positive; score 3 is read in the clinical context. Reports the score and interpretation, not a treatment decision.',
    compute: D.deauvilleScore,
    fields: [
      { dom: 'deauville-score-in', arg: 'score', kind: 'enum', required: true, values: ['1', '2', '3', '4', '5'], label: 'Deauville score (uptake vs reference regions)' },
    ],
  },
];
