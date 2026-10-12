// spec-v1639 MCP adapter: otc-child-label-dose in lib/otc-child-label-dose-v1639.js. The dom keys
// mirror views/group-v1639.js and META['otc-child-label-dose'].example. Clinical domain. Eleven label
// rows (Drug Facts charts).

import * as CD from '../../lib/otc-child-label-dose-v1639.js';

export default [
  {
    id: 'otc-child-label-dose',
    summary: 'A child\'s row on the Drug Facts dosing chart, by weight or age. Children\'s and Infants\' Tylenol and Motrin (liquid, chewable, drops), Children\'s Benadryl, Delsym, Imodium A-D and pyrantel for pinworm. Returns the chart\'s volume or tablets, the milligrams, the repeat interval and the daily limit. "Ask a doctor" and "do not use" rows are returned as the answer. No mg/kg mode; no other strength is scaled.',
    compute: CD.otcChildLabelDose,
    fields: [
      { dom: 'ocd-product', arg: 'product', kind: 'enum', required: true, values: CD.PRODUCTS.map((p) => p.value), label: 'Product and strength on the label' },
      { dom: 'ocd-weight', arg: 'weight', kind: 'number', label: 'Child\'s weight' },
      { dom: 'ocd-unit', arg: 'weightUnit', kind: 'enum', values: CD.UNITS.map((u) => u.value), label: 'Weight is in' },
      { dom: 'ocd-years', arg: 'ageYears', kind: 'number', label: 'Age: whole years', unit: 'years' },
      { dom: 'ocd-months', arg: 'ageMonths', kind: 'number', label: 'Age: extra months (0 to 11)', unit: 'months', min: 0, max: 11 },
    ],
  },
];
