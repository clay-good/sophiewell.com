// spec-v347 MCP wave: adapter for the Herring lateral pillar classification of Legg-Calve-Perthes
// disease in lib/herring-pillar-v347.js. The dom key mirrors the browser renderer
// (views/group-v347.js) and META['herring-pillar'].example. `group` is an enum (A / B / BC / C, where
// BC is the B/C border group). The compute reports the Herring group and its lateral-pillar-height
// description. The example sets group C; its expected "< 50%" round-trips through the default
// makeToArgs with no custom toArgs (the result echoes the 50 in the band text).

import * as C from '../../lib/herring-pillar-v347.js';

export default [
  {
    id: 'herring-pillar',
    summary: 'Herring lateral pillar classification (Herring 1992; B/C border added 2004) of Legg-Calve-Perthes disease — grades the childhood osteonecrosis of the femoral head by the height of the LATERAL PILLAR of the capital femoral epiphysis at fragmentation. A: lateral pillar not involved, no loss of height (best prognosis). B: lateral pillar maintains more than 50% of its original height. B/C border: a narrow (2-3 mm) or poorly ossified lateral pillar at about 50% height. C: lateral pillar is less than 50% of its original height (poorest prognosis). The prognosis also depends strongly on the age at onset; the group alone is not the outcome. Reports the group, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.herringPillar,
    fields: [
      { dom: 'herring-group', arg: 'group', kind: 'enum', values: ['A', 'B', 'BC', 'C'], label: 'Herring group' },
    ],
  },
];
