// spec-v1629 MCP adapter: alligation in lib/alligation-v1629.js. The dom keys mirror views/group-v1629.js
// and META.alligation.example. Arithmetic identity; administrative domain.

import * as AL from '../../lib/alligation-v1629.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'alligation',
    summary: 'Alligation: how much of two strengths to mix to reach a target strength, or the strength of several lots mixed together. Gives the parts ratio, each quantity, the total and a mass-balance check; refuses a target outside the two strengths.',
    compute: AL.alligation,
    fields: [
      { dom: 'al-mode', arg: 'mode', kind: 'enum', required: true, values: vals(AL.MODES), label: 'What to work out: two strengths to a target, or several lots mixed together (medial)' },
      { dom: 'al-su', arg: 'strengthUnit', kind: 'enum', required: true, values: vals(AL.STRENGTH_UNITS), label: 'Strength unit, the same for every strength' },
      { dom: 'al-qu', arg: 'quantityUnit', kind: 'enum', required: true, values: vals(AL.QUANTITY_UNITS), label: 'Quantity unit' },
      { dom: 'al-high', arg: 'higher', kind: 'number', required: false, label: 'Two strengths: the higher strength (100% for pure drug)' },
      { dom: 'al-low', arg: 'lower', kind: 'number', required: false, label: 'Two strengths: the lower strength (0 for a plain diluent)' },
      { dom: 'al-target', arg: 'target', kind: 'number', required: false, label: 'Two strengths: the target strength' },
      { dom: 'al-total', arg: 'total', kind: 'number', required: false, label: 'Two strengths: total wanted (give exactly one of this and the two amounts on hand)' },
      { dom: 'al-highqty', arg: 'higherQty', kind: 'number', required: false, label: 'Two strengths: amount of the higher strength on hand' },
      { dom: 'al-lowqty', arg: 'lowerQty', kind: 'number', required: false, label: 'Two strengths: amount of the lower strength on hand' },
      { dom: 'al-lots', arg: 'lots', kind: 'string', required: false, label: 'Several lots: one per line, strength then quantity, separated by a comma' },
    ],
  },
];
