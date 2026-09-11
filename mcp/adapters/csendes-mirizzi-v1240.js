// spec-v1240: MCP adapter. The dom keys mirror views/group-v1240.js and this tile's META example.
// The fistula extent carries the question and is required. The two modifiers are optional.

import { csendesMirizzi, CSENDES_FISTULA_EXTENT } from '../../lib/csendes-mirizzi-v1240.js';

export default [
{
    id: 'csendes-mirizzi',
    summary: 'Csendes classification of Mirizzi syndrome sorts the case by what the impacted stone has done to the bile duct. It is Csendes 1989, with type V added by Beltran 2008. Type I is external compression with the wall intact; types II, III and IV are a cholecystobiliary fistula taking less than a third, up to two thirds, or the whole of the duct circumference. TYPE V IS A SECOND AXIS, NOT A SIXTH RUNG: it is a cholecystoenteric fistula on top of any of I to IV, Vb if there is gallstone ileus, so a case recorded only as type V has not said how much bile duct is left -- the question the reconstruction turns on. This tool therefore reports the modifier and the base type together. Type I is also the minority: in the original 219-patient series it was 11 percent of cases.',
    compute: csendesMirizzi,
    fields: [
      { dom: 'csm-fistula', arg: 'fistula', kind: 'enum', required: true, label: 'Cholecystobiliary fistula', values: CSENDES_FISTULA_EXTENT.map((e) => e.value) },
      { dom: 'csm-enteric', arg: 'cholecystentericFistula', kind: 'boolean', required: false, label: 'Cholecystoenteric fistula present' },
      { dom: 'csm-ileus', arg: 'gallstoneIleus', kind: 'boolean', required: false, label: 'Gallstone ileus' },
    ],
  },
];
