// spec-v833 MCP adapter: FIGO placenta accreta spectrum grading in lib/figo-pas-v833.js.
// The dom keys mirror the browser renderer (views/group-v833.js) and META['figo-pas'].example.
// Every field is an observable operative finding, never a grade name. Clinical domain.

import { figoPas } from '../../lib/figo-pas-v833.js';

export default [
  {
    id: 'figo-pas',
    summary: 'Derives the FIGO clinical grade of placenta accreta spectrum from operative findings. Grade 1 adherent without distension; grade 2 adds the placental bulge, neovascularity and the dimple sign without serosal breach; 3a through the serosa with a clear bladder plane; 3b into the bladder; 3c into the parametrium or another pelvic organ. Note 3c outranks 3b, and the 3a/3b discriminator is the surgical plane rather than proximity.',
    compute: figoPas,
    fields: [
      { dom: 'pas-noseparation', arg: 'failsToSeparate', kind: 'boolean', required: false, label: 'Placenta does not separate' },
      { dom: 'pas-bleeding', arg: 'heavyBleedingOnRemoval', kind: 'boolean', required: false, label: 'Heavy bleeding on manual removal' },
      { dom: 'pas-bulge', arg: 'placentalBulge', kind: 'boolean', required: false, label: 'Bluish coloring or placental bulge' },
      { dom: 'pas-neovasc', arg: 'neovascularity', kind: 'boolean', required: false, label: 'Significant neovascularity' },
      { dom: 'pas-dimple', arg: 'dimpleSign', kind: 'boolean', required: false, label: 'Dimple sign on cord traction' },
      { dom: 'pas-serosa', arg: 'invadesThroughSerosa', kind: 'boolean', required: false, label: 'Invasion through the uterine serosa' },
      { dom: 'pas-plane', arg: 'clearSurgicalPlane', kind: 'boolean', required: false, label: 'Clear surgical plane between bladder and uterus' },
      { dom: 'pas-bladder', arg: 'bladderInvasion', kind: 'boolean', required: false, label: 'Invasion into the bladder wall' },
      { dom: 'pas-other', arg: 'otherPelvicOrgan', kind: 'boolean', required: false, label: 'Invasion into another pelvic organ' },
    ],
  },
];
