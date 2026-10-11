// spec-v1630 MCP adapter: pn-micronutrient-volume in lib/pn-micronutrient-volume-v1630.js. The dom
// keys mirror views/group-v1630.js and META['pn-micronutrient-volume'].example. Clinical domain.
// Volumes and contents are label rows; where a label's table and sentence disagree, both are shown.

import * as MV from '../../lib/pn-micronutrient-volume-v1630.js';

export default [
  {
    id: 'pn-micronutrient-volume',
    summary: 'Daily volume of a parenteral trace element or pediatric multivitamin product for a weight, as its FDA label gives it. For Tralement and Multrys it lists the zinc, copper, selenium and manganese that volume provides and the shortfall against the label\'s daily amounts. For Infuvite Pediatric it gives the Vial 1 and Vial 2 volumes. Reports only.',
    compute: MV.pnMicronutrientVolume,
    fields: [
      { dom: 'mv-product', arg: 'product', kind: 'enum', required: true, values: MV.PRODUCT_OPTIONS.map((p) => p.value), label: 'Product' },
      { dom: 'mv-weight', arg: 'weight', kind: 'number', required: true, label: 'Patient weight' },
      { dom: 'mv-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: MV.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
    ],
  },
];
