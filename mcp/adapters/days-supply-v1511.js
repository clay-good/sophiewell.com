// spec-v1511: MCP adapters for days supply and the earliest refill date. The dom keys mirror views/group-v1511.js.

import * as DS from '../../lib/days-supply-v1511.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'days-supply',
    summary: 'Days supply for tablets, liquids, insulin pens, inhalers and eye drops. Counts pen priming and caps at any in-use discard limit.',
    compute: DS.daysSupply,
    fields: [
      { dom: 'ds-form', arg: 'form', kind: 'enum', required: true, values: vals(DS.FORMS), label: 'Dosage form' },
      { dom: 'ds-qty', arg: 'quantity', kind: 'number', required: false, label: 'Tablets or capsules: quantity dispensed' },
      { dom: 'ds-perdose', arg: 'perDose', kind: 'number', required: false, label: 'Tablets or capsules: units per dose' },
      { dom: 'ds-vol', arg: 'volume', kind: 'number', required: false, label: 'Liquid or drops: volume dispensed (mL)' },
      { dom: 'ds-doseml', arg: 'doseMl', kind: 'number', required: false, label: 'Liquid: dose volume (mL)' },
      { dom: 'ds-upml', arg: 'unitsPerMl', kind: 'number', required: false, label: 'Insulin: units per mL' },
      { dom: 'ds-mlpen', arg: 'mlPerPen', kind: 'number', required: false, label: 'Insulin: mL per pen or vial' },
      { dom: 'ds-pens', arg: 'pens', kind: 'number', required: false, label: 'Insulin: pens or vials dispensed' },
      { dom: 'ds-uday', arg: 'unitsPerDay', kind: 'number', required: false, label: 'Insulin: units injected per day' },
      { dom: 'ds-inj', arg: 'injectionsPerDay', kind: 'number', required: false, label: 'Insulin: injections per day' },
      { dom: 'ds-prime', arg: 'primingUnits', kind: 'number', required: false, label: 'Insulin: priming units per injection (from the label)' },
      { dom: 'ds-act', arg: 'actuations', kind: 'number', required: false, label: 'Inhaler: actuations per canister' },
      { dom: 'ds-can', arg: 'canisters', kind: 'number', required: false, label: 'Inhaler: canisters dispensed' },
      { dom: 'ds-puffs', arg: 'puffsPerDose', kind: 'number', required: false, label: 'Inhaler: puffs per dose' },
      { dom: 'ds-dpm', arg: 'dropsPerMl', kind: 'number', required: false, label: 'Drops: drops per mL (manufacturer or plan figure)' },
      { dom: 'ds-dpe', arg: 'dropsPerEye', kind: 'number', required: false, label: 'Drops: drops per eye per dose' },
      { dom: 'ds-eyes', arg: 'eyes', kind: 'number', required: false, label: 'Drops: eyes treated' },
      { dom: 'ds-dpd', arg: 'dosesPerDay', kind: 'number', required: false, label: 'Doses per day (all forms but insulin)' },
      { dom: 'ds-discard', arg: 'discardDays', kind: 'number', required: false, label: 'In-use discard limit in days, if the label gives one' },
    ],
  },
  {
    id: 'refill-eligible-date',
    summary: 'Earliest refill date from the last fill, its days supply and the plan threshold. Eye drops can use the CMS 70% recommendation.',
    compute: DS.refillEligibleDate,
    fields: [
      { dom: 'rf-fill', arg: 'fillDate', kind: 'string', required: true, label: 'Date of the last fill (YYYY-MM-DD)' },
      { dom: 'rf-days', arg: 'daysSupply', kind: 'number', required: true, label: 'Days supply of that fill' },
      { dom: 'rf-pct', arg: 'threshold', kind: 'number', required: false, label: 'Plan refill threshold (percent)' },
      { dom: 'rf-eye', arg: 'eyeDrops', kind: 'enum', required: false, values: vals(DS.YES_NO), label: 'Eye drops (use the CMS 70% recommendation if no threshold)?' },
    ],
  },
];
