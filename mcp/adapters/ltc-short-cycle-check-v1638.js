// spec-v1638 MCP adapter: ltc-short-cycle-check in lib/ltc-short-cycle-check-v1638.js. The dom keys mirror
// views/group-v1638.js and META['ltc-short-cycle-check'].example. Administrative domain. No clock.

import * as SC from '../../lib/ltc-short-cycle-check-v1638.js';

export default [
  {
    id: 'ltc-short-cycle-check',
    summary: 'The Part D 14-day dispensing rule in long-term care. A brand-name solid oral drug for an enrollee in a long-term care facility is dispensed no more than 14 days at a time (42 CFR 423.154). Says whether a drug is in the rule: generics, antibiotics, original-container products and three facility types are out.',
    compute: SC.ltcShortCycleCheck,
    fields: [
      { dom: 'lsc-drug', arg: 'drug', kind: 'enum', required: true, values: SC.DRUGS.map((k) => k.value), label: 'Brand or generic' },
      { dom: 'lsc-facility', arg: 'facility', kind: 'enum', required: true, values: SC.FACILITIES.map((k) => k.value), label: 'Facility or pharmacy type' },
      { dom: 'lsc-solid', arg: 'solidOral', kind: 'enum', required: true, values: ['yes', 'no'], label: 'A solid oral dose' },
      { dom: 'lsc-abx', arg: 'antibiotic', kind: 'enum', required: true, values: ['yes', 'no'], label: 'An antibiotic' },
      { dom: 'lsc-orig', arg: 'originalContainer', kind: 'enum', required: true, values: ['yes', 'no'], label: 'Dispensed in its original container or packaging' },
      { dom: 'lsc-days', arg: 'daysToDispense', kind: 'number', label: 'Days supply to dispense', unit: 'days' },
      { dom: 'lsc-total', arg: 'totalDays', kind: 'number', label: 'Total days ordered', unit: 'days' },
    ],
  },
];
