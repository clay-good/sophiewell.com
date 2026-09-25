// spec-v1412: MCP adapter. The dom keys mirror views/group-v1412.js and this tile's META example.
// Height is canonical centimeters; the page's inch option converts before the library sees it.

import * as ETT from '../../lib/adult-ett-depth-v1412.js';

export default [
  {
    id: 'adult-ett-depth',
    summary: 'Estimates where an adult oral endotracheal tube should sit at the corner of the mouth, by sex and by height. Gives the Roberts 1995 mark (21 cm women, 23 cm men) and the Cherng 2002 height rule (height in cm / 5 - 13), and says both are starting points to confirm with capnography, breath sounds, and a chest radiograph.',
    compute: ETT.adultEttDepth,
    fields: [
      { dom: 'aed-sex', arg: 'sex', kind: 'enum', label: 'Sex', values: ETT.ETT_SEXES.map((s) => s.value) },
      { dom: 'aed-ht', arg: 'heightCm', kind: 'number', label: 'Height', unit: 'cm' },
    ],
  },
];
