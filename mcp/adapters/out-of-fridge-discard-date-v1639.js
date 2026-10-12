// spec-v1639 MCP adapter: out-of-fridge-discard-date in lib/out-of-fridge-discard-date-v1639.js. The
// dom keys mirror views/group-v1639.js and META['out-of-fridge-discard-date'].example. Nineteen label
// rows (insulins, GLP-1 products, biologics, Forteo and Sublocade).

import * as FD from '../../lib/out-of-fridge-discard-date-v1639.js';

export default [
  {
    id: 'out-of-fridge-discard-date',
    summary: 'Discard date for a refrigerated product at home, from the label\'s limit. Days unopened at room temperature and days after first use for insulins, semaglutide, tirzepatide, dulaglutide, liraglutide, teriparatide, adalimumab, etanercept, dupilumab, evolocumab and Sublocade. The earlier date binds, never later than the expiration date. Any other product: enter its limit.',
    compute: FD.outOfFridgeDiscardDate,
    fields: [
      { dom: 'ofd-product', arg: 'product', kind: 'enum', required: true, values: FD.PRESETS.map((p) => p.value), label: 'Product' },
      { dom: 'ofd-kept', arg: 'kept', kind: 'enum', values: FD.KEPT.map((k) => k.value), label: 'Kept within the label\'s temperature range? (needed for a listed product)' },
      { dom: 'ofd-out', arg: 'outOfFridge', kind: 'string', label: 'Date it left the refrigerator (YYYY-MM-DD)' },
      { dom: 'ofd-first', arg: 'firstUse', kind: 'string', label: 'Date of first use (YYYY-MM-DD)' },
      { dom: 'ofd-exp', arg: 'expirationDate', kind: 'string', label: 'Expiration date on the product (YYYY-MM-DD, optional)' },
      { dom: 'ofd-asof', arg: 'asOf', kind: 'string', label: 'Today\'s date, to count the days left (YYYY-MM-DD, optional)' },
      { dom: 'ofd-own-room', arg: 'ownRoomDays', kind: 'number', label: 'Another product: the label\'s days at room temperature', unit: 'days' },
      { dom: 'ofd-own-inuse', arg: 'ownInUseDays', kind: 'number', label: 'Another product: the label\'s days after first use', unit: 'days' },
    ],
  },
];
