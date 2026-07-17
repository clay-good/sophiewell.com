// spec-v367 MCP wave: adapter for the Penetration-Aspiration Scale in lib/pas-swallow-v367.js. The dom
// key mirrors the browser renderer (views/group-v367.js) and META['pas-swallow'].example. `score` is an
// enum (1-8). The compute reports the PAS score, its penetration/aspiration category, and the
// description. The example sets score 6; its expected number (6) round-trips through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/pas-swallow-v367.js';

export default [
  {
    id: 'pas-swallow',
    summary: 'Penetration-Aspiration Scale (Rosenbek 1996) — the standard 8-point ordinal scale for the depth of airway invasion during a swallow study (videofluoroscopy / FEES). 1: material does not enter the airway (no airway invasion). 2-5: penetration (material enters the airway above or at the level of the vocal folds; ejected or not). 6-8: aspiration (material passes below the vocal folds). 8: silent aspiration (no effort to eject). Reports the score and its penetration/aspiration category, not a diagnosis, a diet/management decision, or a prognosis.',
    compute: C.pasSwallow,
    fields: [
      { dom: 'pas-score', arg: 'score', kind: 'enum', values: ['1', '2', '3', '4', '5', '6', '7', '8'], label: 'PAS score' },
    ],
  },
];
