// spec-v1419: MCP adapter. The dom keys mirror views/group-v1419.js and this tile's META example.

import * as AF from '../../lib/allen-ferguson-v1419.js';

export default [
  {
    id: 'allen-ferguson',
    summary: 'Decodes an Allen and Ferguson stage of a subaxial cervical spine injury into its published definition. Six presumed mechanisms (phylogenies) with 21 stages, from the 1982 radiographic series; it returns the stage definition, the neurologic findings the series reported for it, and the reliability data that led a 2024 review to advise against using it.',
    compute: AF.allenFerguson,
    fields: [
      { dom: 'alf-stage', arg: 'stage', kind: 'enum', required: true, label: 'Phylogeny and stage', values: AF.AF_STAGE.map((x) => x.value) },
    ],
  },
];
