// spec-v629 wave 12: sliding-scale insulin-drip math. Shares lib/insulin-drip.js
// with the insulin-drip tile view. insulinDripRate returns null on an unknown
// protocol or a non-numeric glucose, which surfaces as an INCOMPLETE result.
// Clinical domain: the rate is an EXAMPLE only — verify against the active
// institution protocol before use.

import { insulinDripRate } from '../../lib/insulin-drip.js';

export default [
  {
    id: 'insulin-drip',
    summary: 'Sample insulin-drip rate (units/hr) from an example low/moderate-intensity protocol and a current blood glucose. Example protocols only; verify against the active institution protocol.',
    compute: insulinDripRate,
    fields: [
      { dom: 'p', arg: 'protocol', kind: 'enum', values: ['low', 'mod'], required: true, label: 'Example protocol (low or moderate intensity)' },
      { dom: 'bg', arg: 'bg', kind: 'number', required: true, label: 'Current blood glucose (mg/dL)' },
    ],
  },
];
