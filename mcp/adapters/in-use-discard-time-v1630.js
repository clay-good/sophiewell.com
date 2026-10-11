// spec-v1630 MCP adapter: in-use-discard-time in lib/in-use-discard-time-v1630.js. The dom keys
// mirror views/group-v1630.js and META['in-use-discard-time'].example. CDC injection safety page
// (reporting USP <797>); administrative domain. Only the 28 days for a multi-dose vial is supplied.

import * as IU from '../../lib/in-use-discard-time-v1630.js';

export default [
  {
    id: 'in-use-discard-time',
    summary: 'Discard date and time for an opened stock container, from when it was opened and its in-use limit. It is never later than the expiration date. Uses 28 days for a multi-dose vial whose label states no other date; any other limit is entered from the label. A single-dose container gets no time. Not for multi-dose vaccine vials or compounded preparations.',
    compute: IU.inUseDiscardTime,
    fields: [
      { dom: 'iu-kind', arg: 'container', kind: 'enum', required: true, values: IU.CONTAINERS.map((c) => c.value), label: 'Container: multi-dose vial (multi-dose), another container with a label in-use limit (label-limit), or single-dose (single-dose)' },
      { dom: 'iu-opened', arg: 'opened', kind: 'string', required: false, label: 'Opened or first punctured, date and time (YYYY-MM-DDTHH:MM)' },
      { dom: 'iu-exp', arg: 'expiration', kind: 'string', required: false, label: 'Expiration date (YYYY-MM-DD, or YYYY-MM for a month and year)' },
      { dom: 'iu-limit', arg: 'limit', kind: 'number', required: false, label: 'In-use limit from the label (blank uses 28 days for a multi-dose vial)' },
      { dom: 'iu-unit', arg: 'limitUnit', kind: 'enum', required: false, values: IU.LIMIT_UNITS.map((u) => u.value), label: 'Limit unit: hours or days' },
    ],
  },
];
