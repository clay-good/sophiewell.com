// spec-v1630 MCP adapter: pn-amino-acid-order in lib/pn-amino-acid-order-v1630.js. The dom keys
// mirror views/group-v1630.js and META['pn-amino-acid-order'].example. Clinical domain. Label
// figures are label rows: withheld when a label is superseded or lapsed.

import * as AA from '../../lib/pn-amino-acid-order-v1630.js';

export default [
  {
    id: 'pn-amino-acid-order',
    summary: 'Sets a PN amino acid order beside the product\'s FDA label, as g/kg/day against the range for the age band. Gives the product volume and the grams of nitrogen at the label\'s own nitrogen content (not grams ÷ 6.25), and the Elcys (cysteine) amount when it is added. Covers Travasol 10%, Prosol 20% and TrophAmine 10%. Reports only.',
    compute: AA.pnAminoAcidOrder,
    fields: [
      { dom: 'aa-product', arg: 'product', kind: 'enum', required: true, values: AA.PRODUCT_OPTIONS.map((p) => p.value), label: 'Product' },
      { dom: 'aa-age', arg: 'ageBand', kind: 'enum', required: true, values: AA.AGE_BANDS.map((a) => a.value), label: 'Age band: under 1 month (neonate), 1 month to under 1 year (infant), 1 to 10 years (child), over 10 to under 17 (adolescent), adult-stable, adult-critical' },
      { dom: 'aa-weight', arg: 'weight', kind: 'number', required: true, label: 'Patient weight' },
      { dom: 'aa-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: AA.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'aa-order', arg: 'order', kind: 'number', required: true, label: 'Amino acids ordered' },
      { dom: 'aa-ounit', arg: 'orderUnit', kind: 'enum', required: true, values: AA.ORDER_UNITS.map((u) => u.value), label: 'Order unit: g/kg/day (g-kg-day) or g per day (g)' },
      { dom: 'aa-cys', arg: 'cysteine', kind: 'enum', required: true, values: AA.CYSTEINE.map((c) => c.value), label: 'Elcys (cysteine): not added (no), added and under 12 years (under-12), added and 12 or older (12-plus)' },
    ],
  },
];
