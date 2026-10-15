// spec-v1631 MCP adapter: fosphenytoin-load-rate in lib/fosphenytoin-load-rate-v1631.js. The dom keys
// mirror views/group-v1631.js and META['fosphenytoin-load-rate'].example. Clinical domain. The
// Cerebyx, phenytoin injection and Dilantin capsules labels, as label rows.

import * as FL from '../../lib/fosphenytoin-load-rate-v1631.js';

export default [
  {
    id: 'fosphenytoin-load-rate',
    summary: 'Loading dose of fosphenytoin (in mg PE) or IV phenytoin for a chosen mg/kg, set beside the range on the FDA label. Gives the volume of product, the label\'s maximum rate and the shortest infusion time, the dilution check, and when a phenytoin level is meaningful after fosphenytoin. With the oral choice, the Dilantin label\'s fixed 1 g adult oral load. Reports; it does not choose the dose.',
    compute: FL.fosphenytoinLoadRate,
    fields: [
      { dom: 'fl-drug', arg: 'drug', kind: 'enum', required: true, values: FL.DRUG_OPTIONS.map((d) => d.value), label: 'Drug: fosphenytoin (mg PE), phenytoin sodium injection (mg), or the oral phenytoin load' },
      { dom: 'fl-pop', arg: 'population', kind: 'enum', required: true, values: FL.POPULATIONS.map((p) => p.value), label: 'Adult or pediatric' },
      { dom: 'fl-ind', arg: 'indication', kind: 'enum', required: false, values: FL.INDICATIONS.map((i) => i.value), label: 'Status epilepticus (status) or non-emergent loading (non-emergent)' },
      { dom: 'fl-route', arg: 'route', kind: 'enum', required: false, values: FL.ROUTES.map((r) => r.value), label: 'Route: intravenous (iv) or intramuscular (im, fosphenytoin only)' },
      { dom: 'fl-weight', arg: 'weight', kind: 'number', required: false, label: 'Patient weight' },
      { dom: 'fl-wunit', arg: 'weightUnit', kind: 'enum', required: false, values: FL.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'fl-mgkg', arg: 'mgPerKg', kind: 'number', required: false, label: 'Dose chosen, per kg (mg PE/kg or mg/kg)' },
      { dom: 'fl-renal', arg: 'renalLiver', kind: 'enum', required: false, values: FL.RENAL_LIVER.map((x) => x.value), label: 'Oral load: history of renal or liver disease?' },
      { dom: 'fl-bag', arg: 'bagVolume', kind: 'number', required: false, label: 'Bag volume for the infusion (optional)', unit: 'mL' },
    ],
  },
];
