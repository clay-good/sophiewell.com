// spec-v1629 MCP adapter: apothecary-household-measures in lib/apothecary-household-measures-v1629.js.
// The dom keys mirror views/group-v1629.js and META['apothecary-household-measures'].example.
// NIST Handbook 44 (2026) Appendix C and 21 CFR 101.9(b)(5)(viii); administrative domain.

import * as AH from '../../lib/apothecary-household-measures-v1629.js';

export default [
  {
    id: 'apothecary-household-measures',
    summary: 'Converts grains, scruples, drams, apothecaries ounces, minims, fluid drams, fluid ounces, spoons and cups to metric. Also avoirdupois ounces and pounds, pints, quarts and gallons. Where NIST and the FDA labeling rule define a unit differently, both values are shown with their sources.',
    compute: AH.apothecaryHouseholdMeasures,
    fields: [
      { dom: 'ah-qty', arg: 'quantity', kind: 'number', required: true, label: 'Quantity' },
      { dom: 'ah-unit', arg: 'unit', kind: 'enum', required: true, values: AH.UNITS.map((u) => u.value), label: 'Unit to convert from' },
    ],
  },
];
