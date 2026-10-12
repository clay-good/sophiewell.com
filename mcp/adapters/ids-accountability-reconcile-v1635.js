// spec-v1635 MCP adapter: ids-accountability-reconcile in lib/ids-accountability-reconcile-v1635.js.
// The dom keys mirror views/group-v1635.js and META['ids-accountability-reconcile'].example.
// Operational domain. Visit lines, the site balance, or both.

import * as IR from '../../lib/ids-accountability-reconcile-v1635.js';

export default [
  {
    id: 'ids-accountability-reconcile',
    summary: 'Study drug accountability: pill-count compliance per visit and the site balance. For each visit it computes units taken, units expected (less documented hold days) and percent compliance, and it reconciles receipts, dispensing, returns and destruction against the count on hand. The compliance range is the protocol\'s and is entered by the reader; no federal rule sets one.',
    compute: IR.idsAccountabilityReconcile,
    fields: [
      { dom: 'iac-visits', arg: 'visits', kind: 'string', label: 'Visits, one per line: code, dispensed, returned, dispense date, return date, units per day, hold days (optional)' },
      { dom: 'iac-low', arg: 'rangeLow', kind: 'number', label: 'Protocol compliance range, lower end (optional)', unit: '%' },
      { dom: 'iac-high', arg: 'rangeHigh', kind: 'number', label: 'Protocol compliance range, upper end (optional)', unit: '%' },
      { dom: 'iac-received', arg: 'received', kind: 'number', label: 'Site balance: units received' },
      { dom: 'iac-dispensed', arg: 'dispensedTotal', kind: 'number', label: 'Site balance: units dispensed' },
      { dom: 'iac-restocked', arg: 'returnedToStock', kind: 'number', label: 'Site balance: units returned to stock' },
      { dom: 'iac-destroyed', arg: 'destroyed', kind: 'number', label: 'Site balance: units destroyed' },
      { dom: 'iac-sponsor', arg: 'returnedToSponsor', kind: 'number', label: 'Site balance: units returned to the sponsor' },
      { dom: 'iac-on-hand', arg: 'onHand', kind: 'number', label: 'Site balance: count on hand' },
    ],
  },
];
