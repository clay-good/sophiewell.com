// spec-v1639 MCP adapter: quantity-to-dispense in lib/quantity-to-dispense-v1639.js. The dom keys
// mirror views/group-v1639.js and META['quantity-to-dispense'].example. Administrative domain. No clock.

import * as QD from '../../lib/quantity-to-dispense-v1639.js';

export default [
  {
    id: 'quantity-to-dispense',
    summary: 'Quantity to dispense for a days supply, rounded up to whole units and packages. Tablets, tapers, liquids, insulin (priming and in-use discard limit), inhalers, eye drops, patches and test supplies. Shows the leftover and the days the rounded quantity covers. Supplies no figure of its own.',
    compute: QD.quantityToDispense,
    fields: [
      { dom: 'qd-form', arg: 'form', kind: 'enum', required: true, values: QD.FORMS.map((f) => f.value), label: 'Dosage form' },
      { dom: 'qd-days', arg: 'days', kind: 'number', label: 'Days supply wanted (every form but a taper)', unit: 'days' },
      { dom: 'qd-perdose', arg: 'perDose', kind: 'number', label: 'Tablets or capsules: units per dose' },
      { dom: 'qd-dpd', arg: 'dosesPerDay', kind: 'number', label: 'Doses per day (tablets, liquid, inhaler, drops)' },
      { dom: 'qd-taper', arg: 'taperSteps', kind: 'string', label: 'Taper: one step a line as units per dose, doses per day, days' },
      { dom: 'qd-doseml', arg: 'doseMl', kind: 'number', label: 'Liquid: dose volume', unit: 'mL' },
      { dom: 'qd-uday', arg: 'unitsPerDay', kind: 'number', label: 'Insulin: units injected per day', unit: 'units' },
      { dom: 'qd-inj', arg: 'injectionsPerDay', kind: 'number', label: 'Insulin: injections per day' },
      { dom: 'qd-prime', arg: 'primingUnits', kind: 'number', label: 'Insulin: priming units per injection (from the label)', unit: 'units' },
      { dom: 'qd-upml', arg: 'unitsPerMl', kind: 'number', label: 'Insulin: units per mL' },
      { dom: 'qd-mlpen', arg: 'mlPerPen', kind: 'number', label: 'Insulin: mL per pen or vial', unit: 'mL' },
      { dom: 'qd-discard', arg: 'discardDays', kind: 'number', label: 'Insulin: in-use discard limit, if the label gives one', unit: 'days' },
      { dom: 'qd-puffs', arg: 'puffsPerDose', kind: 'number', label: 'Inhaler: puffs per dose' },
      { dom: 'qd-act', arg: 'actuations', kind: 'number', label: 'Inhaler: actuations per canister' },
      { dom: 'qd-primepuffs', arg: 'primingPuffs', kind: 'number', label: 'Inhaler: priming puffs per canister (optional)' },
      { dom: 'qd-dpe', arg: 'dropsPerEye', kind: 'number', label: 'Drops: drops per eye per dose' },
      { dom: 'qd-eyes', arg: 'eyes', kind: 'number', label: 'Drops: eyes treated' },
      { dom: 'qd-dpm', arg: 'dropsPerMl', kind: 'number', label: 'Drops: drops per mL (manufacturer or plan figure)' },
      { dom: 'qd-change', arg: 'changeInterval', kind: 'number', label: 'Patches: time between changes' },
      { dom: 'qd-change-unit', arg: 'changeUnit', kind: 'enum', values: QD.CHANGE_UNITS.map((u) => u.value), label: 'Patches: that time is in' },
      { dom: 'qd-worn', arg: 'patchesWorn', kind: 'number', label: 'Patches: worn at once' },
      { dom: 'qd-uses', arg: 'usesPerDay', kind: 'number', label: 'Supplies: uses per day' },
      { dom: 'qd-pack', arg: 'packageSize', kind: 'number', label: 'Package size: units, mL, pens, canisters or patches in one (optional)' },
    ],
  },
];
