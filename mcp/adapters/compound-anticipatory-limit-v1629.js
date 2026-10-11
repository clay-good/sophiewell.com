// spec-v1629 MCP adapter: compound-anticipatory-limit in lib/compound-anticipatory-limit-v1629.js.
// The dom keys mirror views/group-v1629.js and META['compound-anticipatory-limit'].example. FDA's
// December 2016 guidance on section 503A; administrative domain.

import * as CA from '../../lib/compound-anticipatory-limit-v1629.js';

export default [
  {
    id: 'compound-anticipatory-limit',
    summary: 'Highest 30-day total of units on prescriptions received in the past year for one compounded product. That is the ceiling for anticipatory compounding under FDA\'s December 2016 section 503A policy; with units on hand it gives how many more may be made. A nonbinding enforcement policy.',
    compute: CA.compoundAnticipatoryLimit,
    fields: [
      { dom: 'ca-rx', arg: 'prescriptions', kind: 'string', required: true, label: 'Prescriptions received, one per line: date received (YYYY-MM-DD), then the units' },
      { dom: 'ca-asof', arg: 'asOf', kind: 'string', required: false, label: 'As-of date, YYYY-MM-DD (blank for today)' },
      { dom: 'ca-hand', arg: 'onHand', kind: 'number', required: false, label: 'Units now held for distribution (optional)' },
    ],
  },
];
