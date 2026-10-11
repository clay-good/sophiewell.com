// spec-v1630 MCP adapter: pn-calcium-phosphate-check in lib/pn-calcium-phosphate-check-v1630.js. The
// dom keys mirror views/group-v1630.js and META['pn-calcium-phosphate-check'].example. Clinical
// domain. No solubility curve ships; the limit is the reader's. Product strengths are label rows.

import * as CP from '../../lib/pn-calcium-phosphate-check-v1630.js';

export default [
  {
    id: 'pn-calcium-phosphate-check',
    summary: 'Calcium (mEq/L) and phosphate (mmol/L) concentrations in a PN bag, their sum, and the amino acid percent. Compares them with a limit the reader enters from the site\'s own solubility curve. No curve is built in, and a result under the limit never means compatible. Amounts can be entered as mL of calcium gluconate 10% or of potassium or sodium phosphates.',
    compute: CP.pnCalciumPhosphateCheck,
    fields: [
      { dom: 'cp-vol', arg: 'finalVolume', kind: 'number', required: true, label: 'Final volume', unit: 'mL' },
      { dom: 'cp-caunit', arg: 'calciumUnit', kind: 'enum', required: true, values: CP.CALCIUM_UNITS.map((u) => u.value), label: 'Calcium entered as mEq (mEq) or mL of calcium gluconate 10% (mL-gluconate)' },
      { dom: 'cp-ca', arg: 'calcium', kind: 'number', required: true, label: 'Calcium amount' },
      { dom: 'cp-punit', arg: 'phosphateUnit', kind: 'enum', required: true, values: CP.PHOSPHATE_UNITS.map((u) => u.value), label: 'Phosphate entered as mmol (mmol), mL of potassium phosphates (mL-kphos) or mL of sodium phosphates (mL-naphos)' },
      { dom: 'cp-p', arg: 'phosphate', kind: 'number', required: true, label: 'Phosphate amount' },
      { dom: 'cp-aa', arg: 'aminoAcidGrams', kind: 'number', required: false, label: 'Amino acids (optional)', unit: 'g' },
      { dom: 'cp-low', arg: 'lowestVolume', kind: 'number', required: false, label: 'Volume at the point of lowest dilution (optional)', unit: 'mL' },
      { dom: 'cp-kind', arg: 'limitKind', kind: 'enum', required: false, values: CP.LIMIT_KINDS.map((k) => k.value), label: 'Your limit is a maximum calcium at this phosphate (max-calcium) or a maximum sum (sum)' },
      { dom: 'cp-limit', arg: 'limit', kind: 'number', required: false, label: 'Your limit, from your own curve or software' },
      { dom: 'cp-caown', arg: 'calciumPerMl', kind: 'number', required: false, label: 'Calcium mEq per mL from the vial (only if the label figure is withheld)' },
      { dom: 'cp-pown', arg: 'phosphatePerMl', kind: 'number', required: false, label: 'Phosphate mmol per mL from the vial (only if the label figure is withheld)' },
    ],
  },
];
