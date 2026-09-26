// spec-v1503: MCP adapters for the Part D clocks. The dom keys mirror views/group-v1503.js and each
// tool's META example.

import * as PD from '../../lib/partd-appeals-v1503.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'partd-coverage-clock',
    summary: 'Part D coverage-decision and exception deadline, in hours from receipt. Also gives the date a missed case goes to independent review (42 CFR 423.568-423.572).',
    compute: PD.partdCoverageClock,
    fields: [
      { dom: 'pdc-type', arg: 'requestType', kind: 'enum', required: true, values: vals(PD.REQUEST_TYPES), label: 'Kind of request' },
      { dom: 'pdc-received', arg: 'received', kind: 'string', required: true, label: 'Plan received the request (YYYY-MM-DDTHH:MM)' },
      { dom: 'pdc-statement', arg: 'statement', kind: 'string', required: false, label: 'Exceptions only: supporting statement received (YYYY-MM-DDTHH:MM)' },
    ],
  },
  {
    id: 'partd-appeal-ladder',
    summary: 'The next Part D appeal level and its filing deadline. Uses the 5-day receipt presumption and checks the ALJ amount in controversy.',
    compute: PD.partdAppealLadder,
    fields: [
      { dom: 'pda-level', arg: 'level', kind: 'enum', required: true, values: vals(PD.LEVELS), label: 'Decision notice you have' },
      { dom: 'pda-notice', arg: 'noticeDate', kind: 'string', required: true, label: 'Date printed on the notice (YYYY-MM-DD)' },
      { dom: 'pda-received', arg: 'receivedDate', kind: 'string', required: false, label: 'Date received, only with proof of later receipt (YYYY-MM-DD)' },
      { dom: 'pda-amount', arg: 'amount', kind: 'number', required: false, label: 'Amount at stake, for an ALJ hearing', unit: 'USD' },
    ],
  },
];
