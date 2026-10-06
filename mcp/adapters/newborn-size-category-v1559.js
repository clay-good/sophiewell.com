// spec-v1559 MCP adapter: newborn-size-category in lib/newborn-size-category-v1559.js.
// The dom keys mirror views/group-v1559.js and META['newborn-size-category'].example. Clinical domain.

import * as M from '../../lib/newborn-size-category-v1559.js';

export default [
  {
    id: 'newborn-size-category',
    summary: 'Gives the WHO low-birth-weight and preterm categories for a birth weight and gestational age. Low, very low and extremely low weight, preterm grades and post-term, with kangaroo mother care when it applies.',
    compute: M.newbornSizeCategory,
    fields: [
      { dom: 'nsc-weight', arg: 'weight', kind: 'number', required: true, label: 'Birth weight in grams', min: 300, max: 6000 },
      { dom: 'nsc-weeks', arg: 'weeks', kind: 'number', label: 'Gestational age at birth, completed weeks', min: 20, max: 45 },
      { dom: 'nsc-days', arg: 'days', kind: 'number', label: 'Plus days (0-6)', min: 0, max: 6 },
    ],
  },
];
