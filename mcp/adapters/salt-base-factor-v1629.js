// spec-v1629 MCP adapter: salt-base-factor in lib/salt-base-factor-v1629.js. The dom keys mirror
// views/group-v1629.js and META['salt-base-factor'].example. Stoichiometry; administrative domain.

import * as SB from '../../lib/salt-base-factor-v1629.js';

export default [
  {
    id: 'salt-base-factor',
    summary: 'Conversion factor between two forms of one drug (salt and base, hydrate and anhydrous), from formulas or weights. Converts a quantity either way; a label\'s own equivalency statement is the figure for that product.',
    compute: SB.saltBaseFactor,
    fields: [
      { dom: 'sb-af', arg: 'aFormula', kind: 'string', required: false, label: 'Form A: formula (give this or its molecular weight)' },
      { dom: 'sb-amw', arg: 'aMw', kind: 'number', required: false, label: 'Form A: molecular weight', unit: 'g/mol' },
      { dom: 'sb-an', arg: 'aMoieties', kind: 'number', required: false, label: 'Form A: active moieties per formula unit (blank is 1)' },
      { dom: 'sb-bf', arg: 'bFormula', kind: 'string', required: false, label: 'Form B: formula (give this or its molecular weight)' },
      { dom: 'sb-bmw', arg: 'bMw', kind: 'number', required: false, label: 'Form B: molecular weight', unit: 'g/mol' },
      { dom: 'sb-bn', arg: 'bMoieties', kind: 'number', required: false, label: 'Form B: active moieties per formula unit (blank is 1)' },
      { dom: 'sb-qty', arg: 'quantity', kind: 'number', required: false, label: 'Quantity to convert (optional)' },
      { dom: 'sb-of', arg: 'quantityOf', kind: 'enum', required: false, values: SB.QUANTITY_OF.map((q) => q.value), label: 'The quantity is a weight of form A (a) or of form B (b)' },
    ],
  },
];
