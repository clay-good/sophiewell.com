// spec-v1630 MCP adapter: pn-order-summary in lib/pn-order-summary-v1630.js. The dom keys mirror
// views/group-v1630.js and META['pn-order-summary'].example. Clinical domain. Energy factors and the
// dextrose rate are label rows; nitrogen is reader input and no ratio target is shown.

import * as PS from '../../lib/pn-order-summary-v1630.js';

export default [
  {
    id: 'pn-order-summary',
    summary: 'Restates a parenteral nutrition order per kilogram, with GIR in mg/kg/min and energy by source. Gives g/kg/day of dextrose, amino acids and lipid, and mL/kg/day. Adds energy from each (dextrose 3.4 kcal/g, amino acids 4 kcal/g, lipid by product), kcal/kg/day, and non-protein kcal per gram of nitrogen when nitrogen is entered. Sets the dextrose rate beside the label\'s 0.5 g/kg/hour. No targets are applied.',
    compute: PS.pnOrderSummary,
    fields: [
      { dom: 'ps-weight', arg: 'weight', kind: 'number', required: true, label: 'Patient weight' },
      { dom: 'ps-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: PS.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'ps-dex', arg: 'dextroseGrams', kind: 'number', required: true, label: 'Dextrose, hydrous', unit: 'g' },
      { dom: 'ps-aa', arg: 'aminoAcidGrams', kind: 'number', required: true, label: 'Amino acids', unit: 'g' },
      { dom: 'ps-n', arg: 'nitrogenGrams', kind: 'number', required: false, label: 'Nitrogen, from the amino acid label (optional)', unit: 'g' },
      { dom: 'ps-lipid', arg: 'lipidProduct', kind: 'enum', required: false, values: PS.LIPID_OPTIONS.map((p) => p.value), label: 'Lipid product (needed when lipid grams are entered)' },
      { dom: 'ps-lipidg', arg: 'lipidGrams', kind: 'number', required: false, label: 'Lipid (optional)', unit: 'g' },
      { dom: 'ps-hours', arg: 'hours', kind: 'number', required: true, label: 'Infusion hours per day', unit: 'hours' },
      { dom: 'ps-vol', arg: 'volume', kind: 'number', required: true, label: 'Total volume per day', unit: 'mL' },
    ],
  },
];
