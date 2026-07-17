// spec-v358 MCP wave: adapter for the Ramsay Sedation Scale in lib/ramsay-sedation-v358.js. The dom key
// mirrors the browser renderer (views/group-v358.js) and META['ramsay-sedation'].example. `level` is an
// enum (1-6). The compute reports the Ramsay level, its awake/asleep state, and its description. The
// example sets level 2; its expected number (2) round-trips through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/ramsay-sedation-v358.js';

export default [
  {
    id: 'ramsay-sedation',
    summary: 'Ramsay Sedation Scale (Ramsay 1974) — the original clinical scale for the depth of sedation (levels 1-6). Awake: 1 anxious / agitated / restless; 2 cooperative, oriented, tranquil; 3 responds to commands only. Asleep: 4 brisk response to a light glabellar tap or loud auditory stimulus; 5 sluggish response; 6 no response. Levels 2-4 are the cooperative-to-lightly-sedated range; level 1 (agitation) and levels 5-6 (deep sedation) fall outside it. Reports the level, not a diagnosis, a titration order, or a target.',
    compute: C.ramsaySedation,
    fields: [
      { dom: 'ramsay-level', arg: 'level', kind: 'enum', values: ['1', '2', '3', '4', '5', '6'], label: 'Ramsay level' },
    ],
  },
];
