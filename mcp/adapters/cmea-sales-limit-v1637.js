// spec-v1637 MCP adapter: cmea-sales-limit in lib/cmea-sales-limit-v1637.js. The dom keys mirror
// views/group-v1637.js and META['cmea-sales-limit'].example. Administrative domain. No clock.

import * as CM from '../../lib/cmea-sales-limit-v1637.js';

export default [
  {
    id: 'cmea-sales-limit',
    summary: 'Pseudoephedrine and ephedrine retail sales limits under the Combat Methamphetamine Epidemic Act. Converts the labeled salt to base grams, then checks the 3.6 g daily limit and, for mobile vendors and mail order, the 7.5 g 30-day limit (21 CFR 1314.20, 1314.100). Gives the grams left and the most packages that fit.',
    compute: CM.cmeaSalesLimit,
    fields: [
      { dom: 'cms-ingredient', arg: 'ingredient', kind: 'enum', required: true, values: CM.INGREDIENTS.map((k) => k.value), label: 'Ingredient' },
      { dom: 'cms-salt', arg: 'salt', kind: 'enum', required: true, values: CM.SALTS.map((k) => k.value), label: 'Salt on the label' },
      { dom: 'cms-form', arg: 'form', kind: 'enum', required: true, values: CM.FORMS.map((k) => k.value), label: 'Form' },
      { dom: 'cms-strength', arg: 'strengthMg', kind: 'number', required: true, label: 'Labeled strength', unit: 'mg' },
      { dom: 'cms-per', arg: 'perMl', kind: 'number', label: 'Liquid: the mL the strength is stated in', unit: 'mL' },
      { dom: 'cms-units', arg: 'unitsPerPackage', kind: 'number', required: true, label: 'Tablets, capsules or mL in each package' },
      { dom: 'cms-packages', arg: 'packages', kind: 'number', required: true, label: 'Number of packages' },
      { dom: 'cms-seller', arg: 'seller', kind: 'enum', required: true, values: CM.SELLERS.map((k) => k.value), label: 'Seller' },
      { dom: 'cms-today', arg: 'soldToday', kind: 'number', required: true, label: 'Base already sold to this purchaser today (0 if none)', unit: 'g' },
      { dom: 'cms-thirty', arg: 'soldThirtyDays', kind: 'number', label: 'Base sold to this purchaser in the past 30 days, today included', unit: 'g' },
      { dom: 'cms-state', arg: 'stateThirtyDayLimit', kind: 'number', label: 'State 30-day limit, if any', unit: 'g' },
    ],
  },
];
