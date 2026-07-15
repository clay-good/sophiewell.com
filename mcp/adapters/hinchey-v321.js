// spec-v321 MCP wave: adapter for the Hinchey classification of acute diverticulitis in
// lib/hinchey-v321.js. The dom key mirrors the browser renderer (views/group-v321.js) and
// META['hinchey'].example. `stage` is an enum (I / II / III / IV; the compute also accepts
// arabic 1-4). The compute reports the stage and its standard definition. The example sets
// stage III; its expected text is the stage definition (roman-graded, no numeric facts), so
// it round-trips through the default makeToArgs with no custom toArgs.

import * as H from '../../lib/hinchey-v321.js';

export default [
  {
    id: 'hinchey',
    summary: 'Original Hinchey classification of perforated/complicated diverticulitis (Hinchey 1978). Stage I: localized pericolic/mesocolic abscess or phlegmon. Stage II: pelvic, distant intra-abdominal, or retroperitoneal abscess. Stage III: generalized purulent peritonitis. Stage IV: generalized fecal (feculent) peritonitis. Stages I-II are often managed with antibiotics +/- image-guided drainage; III-IV generally require emergent surgery. Reports the stage the clinician has determined, not a diagnosis or a management order.',
    compute: H.hinchey,
    fields: [
      { dom: 'hinchey-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Hinchey stage (operative / CT findings)' },
    ],
  },
];
