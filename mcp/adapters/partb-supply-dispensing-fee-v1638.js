// spec-v1638 MCP adapter: partb-supply-dispensing-fee in lib/partb-supply-dispensing-fee-v1638.js. The dom keys mirror
// views/group-v1638.js and META['partb-supply-dispensing-fee'].example. Administrative domain. No clock.

import * as SF from '../../lib/partb-supply-dispensing-fee-v1638.js';

export default [
  {
    id: 'partb-supply-dispensing-fee',
    summary: 'Medicare Part B supplying and dispensing fees for a pharmacy. $24 for the first prescription of an immunosuppressive, oral anticancer or oral antiemetic drug in 30 days, $16 for each one after, $50 for the first after a transplant; $57, $33 or $66 for inhalation drugs (42 CFR 414.1001).',
    compute: SF.partbSupplyDispensingFee,
    fields: [
      { dom: 'psf-category', arg: 'category', kind: 'enum', required: true, values: SF.CATEGORIES.map((k) => k.value), label: 'Drug category' },
      { dom: 'psf-count', arg: 'prescriptions', kind: 'number', label: 'Prescriptions supplied in this 30-day period' },
      { dom: 'psf-first', arg: 'first', kind: 'enum', values: SF.FIRST.map((k) => k.value), label: 'The first prescription in the period' },
      { dom: 'psf-transplant', arg: 'transplant', kind: 'enum', values: SF.TRANSPLANT.map((k) => k.value), label: 'Immunosuppressive, the initial prescription after a transplant' },
      { dom: 'psf-supply', arg: 'supply', kind: 'enum', values: SF.SUPPLY.map((k) => k.value), label: 'Inhalation drug, the supply dispensed' },
    ],
  },
];
