// spec-v1630 MCP adapter: lipid-emulsion-dose-check in lib/lipid-emulsion-dose-check-v1630.js. The
// dom keys mirror views/group-v1630.js and META['lipid-emulsion-dose-check'].example. Clinical
// domain. Label figures are label rows: withheld when a label is superseded or lapsed.

import * as LE from '../../lib/lipid-emulsion-dose-check-v1630.js';

export default [
  {
    id: 'lipid-emulsion-dose-check',
    summary: 'Sets an IV lipid emulsion order beside the product\'s own FDA label, as g/kg/day and mL/kg/hour. Compares the dose with the label maximum for the age band and the rate with the label maximum rate. Also checks infusion duration and lipid share of energy where the label states one. Covers Intralipid 20% and 30%, SMOFlipid, Clinolipid and Omegaven, whose maximums differ. Reports only; it does not say what to give.',
    compute: LE.lipidEmulsionDoseCheck,
    fields: [
      { dom: 'le-product', arg: 'product', kind: 'enum', required: true, values: LE.PRODUCT_OPTIONS.map((p) => p.value), label: 'Product' },
      { dom: 'le-age', arg: 'ageBand', kind: 'enum', required: true, values: LE.AGE_BANDS.map((a) => a.value), label: 'Age band: birth to under 2 years (birth-2), 2 to under 12 (2-11), 12 to 17 (12-17), adult' },
      { dom: 'le-weight', arg: 'weight', kind: 'number', required: true, label: 'Patient weight' },
      { dom: 'le-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: LE.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'le-order', arg: 'order', kind: 'number', required: true, label: 'Ordered lipid' },
      { dom: 'le-ounit', arg: 'orderUnit', kind: 'enum', required: true, values: LE.ORDER_UNITS.map((u) => u.value), label: 'Order unit: g/kg/day (g-kg-day), g per day (g) or mL per day (mL)' },
      { dom: 'le-hours', arg: 'hours', kind: 'number', required: true, label: 'Infusion duration', unit: 'hours' },
      { dom: 'le-route', arg: 'route', kind: 'enum', required: true, values: LE.ROUTES.map((r) => r.value), label: 'Runs by Y-connector (y-site) or inside a PN admixture (admixture)' },
      { dom: 'le-kcal', arg: 'totalKcal', kind: 'number', required: false, label: 'Total daily energy (optional)', unit: 'kcal' },
      { dom: 'le-own', arg: 'ownMax', kind: 'number', required: false, label: 'Label maximum from the label in hand (only if the label figures are withheld)', unit: 'g/kg/day' },
    ],
  },
];
