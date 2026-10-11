// spec-v1630 MCP adapter: admixture-concentration in lib/admixture-concentration-v1630.js. The dom
// keys mirror views/group-v1630.js and META['admixture-concentration'].example. Arithmetic on the
// reader's numbers; administrative domain. No overfill table ships.

import * as AC from '../../lib/admixture-concentration-v1630.js';

export default [
  {
    id: 'admixture-concentration',
    summary: 'True strength of an IV bag after additions, counting overfill, volume withdrawn and additive volume. Compares it with the strength on the nominal volume, and can solve the additive volume for a target strength. A baseline field covers fluid that already holds the additive (dialysis and CRRT bags). Overfill is reader input; left blank, the result is on the nominal volume only.',
    compute: AC.admixtureConcentration,
    fields: [
      { dom: 'ac-unit', arg: 'unit', kind: 'enum', required: true, values: AC.UNITS.map((u) => u.value), label: 'Unit of the additive amount' },
      { dom: 'ac-per', arg: 'per', kind: 'enum', required: true, values: AC.PER.map((p) => p.value), label: 'State the strength per mL (mL) or per liter (L)' },
      { dom: 'ac-nominal', arg: 'nominalVolume', kind: 'number', required: true, label: 'Nominal bag volume', unit: 'mL' },
      { dom: 'ac-overfill', arg: 'overfill', kind: 'number', required: false, label: 'Overfill, from the manufacturer (blank if not known)', unit: 'mL' },
      { dom: 'ac-withdrawn', arg: 'withdrawn', kind: 'number', required: false, label: 'Volume withdrawn before adding (optional)', unit: 'mL' },
      { dom: 'ac-adds', arg: 'additives', kind: 'string', required: true, label: 'Additions of the drug, one per line: amount, then its volume in mL' },
      { dom: 'ac-other', arg: 'otherVolume', kind: 'number', required: false, label: 'Other volume added that holds none of the drug (optional)', unit: 'mL' },
      { dom: 'ac-base', arg: 'baseline', kind: 'number', required: false, label: 'Strength already in the bag fluid, in the strength unit chosen (optional)' },
      { dom: 'ac-target', arg: 'target', kind: 'number', required: false, label: 'Target strength, in the strength unit chosen (optional)' },
    ],
  },
];
