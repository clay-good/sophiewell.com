// spec-v1637 MCP adapter: c5-otc-sale-limit in lib/c5-otc-sale-limit-v1637.js. The dom keys mirror
// views/group-v1637.js and META['c5-otc-sale-limit'].example. Administrative domain. No clock:
// the time of the sale is an input.

import * as OS from '../../lib/c5-otc-sale-limit-v1637.js';

export default [
  {
    id: 'c5-otc-sale-limit',
    summary: 'The 48-hour limit on selling a controlled substance without a prescription. Under 21 CFR 1306.26 it is 240 mL or 48 dosage units with opium, 120 mL or 24 dosage units without. Gives the quantity left for this purchaser, when a larger request would fit, the age rule and the record-book items. Stops if state law requires a prescription.',
    compute: OS.c5OtcSaleLimit,
    fields: [
      { dom: 'c5s-state', arg: 'stateRule', kind: 'enum', required: true, values: OS.STATE_RULE.map((k) => k.value), label: 'Does state or local law require a prescription for this product?' },
      { dom: 'c5s-contents', arg: 'contents', kind: 'enum', values: OS.CONTENTS.map((k) => k.value), label: 'Contents' },
      { dom: 'c5s-form', arg: 'form', kind: 'enum', values: OS.FORMS.map((k) => k.value), label: 'Form' },
      { dom: 'c5s-requested', arg: 'requested', kind: 'number', label: 'Quantity requested (mL or dosage units)' },
      { dom: 'c5s-age', arg: 'age', kind: 'number', label: 'Purchaser age', unit: 'years' },
      { dom: 'c5s-time', arg: 'saleTime', kind: 'string', label: 'Date and time of this sale (YYYY-MM-DDTHH:MM)' },
      { dom: 'c5s-earlier', arg: 'earlierSales', kind: 'string', label: 'Earlier sales to this purchaser, one per line: date and time, then the quantity' },
    ],
  },
];
