// spec-v1629 MCP adapter: formula-scale in lib/formula-scale-v1629.js. The dom keys mirror
// views/group-v1629.js and META['formula-scale'].example. Arithmetic identity; administrative domain.

import * as FS from '../../lib/formula-scale-v1629.js';

export default [
  {
    id: 'formula-scale',
    summary: 'Reduce or enlarge a master formula to a wanted yield, or to a wanted quantity of one ingredient. Handles formulas in parts and a "qs" line, and checks that the scaled quantities add to the yield; weights and volumes are not added to each other.',
    compute: FS.formulaScale,
    fields: [
      { dom: 'fs-formula', arg: 'formula', kind: 'string', required: true, label: 'Master formula, one ingredient per line: name, quantity, unit (the quantity may be "qs"; the unit may be "parts")' },
      { dom: 'fs-master', arg: 'masterYield', kind: 'number', required: false, label: 'Yield of the master formula (not needed for a formula in parts)' },
      { dom: 'fs-yunit', arg: 'yieldUnit', kind: 'enum', required: false, values: FS.YIELD_UNITS.map((u) => u.value), label: 'Unit of the yield' },
      { dom: 'fs-wanted', arg: 'wantedYield', kind: 'number', required: false, label: 'Yield wanted (give this, or one ingredient and its wanted quantity)' },
      { dom: 'fs-ing', arg: 'ingredient', kind: 'string', required: false, label: 'Or: the ingredient to scale by, as written in the formula' },
      { dom: 'fs-ingqty', arg: 'ingredientQuantity', kind: 'number', required: false, label: 'Quantity of that ingredient wanted, in its own unit' },
    ],
  },
];
