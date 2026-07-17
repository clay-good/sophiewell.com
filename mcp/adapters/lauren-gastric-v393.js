// spec-v393 MCP wave: adapter for the Lauren classification of gastric carcinoma in
// lib/lauren-gastric-v393.js. The dom key mirrors the browser renderer (views/group-v393.js) and
// META['lauren-gastric'].example. `type` is an enum (intestinal/diffuse/mixed). The compute reports the
// type and its histological description. The example sets diffuse; its expected text is the type
// description (no numeric facts to round-trip), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/lauren-gastric-v393.js';

export default [
  {
    id: 'lauren-gastric',
    summary: 'Lauren classification (Lauren 1965) of gastric carcinoma (intestinal / diffuse / mixed) - the classic histological typing of gastric adenocarcinoma by growth pattern. intestinal: cohesive cells that retain glandular / tubular structure; associated with chronic gastritis, gastric atrophy, and intestinal metaplasia (the "epidemic" type). diffuse: poorly cohesive cells that infiltrate the stroma singly or in small groups, often with signet-ring cells and no gland formation; classically a worse prognosis. mixed: a tumor with both intestinal and diffuse components. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.laurenGastric,
    fields: [
      { dom: 'lauren-type', arg: 'type', kind: 'enum', values: ['intestinal', 'diffuse', 'mixed'], label: 'Lauren type' },
    ],
  },
];
