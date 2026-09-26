// spec-v1503: MCP adapters for the Medicare Advantage clocks. The dom keys mirror views/group-v1503.js
// and each tool's META example.

import * as MA from '../../lib/ma-appeals-v1503.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'ma-org-determination-clock',
    summary: 'Medicare Advantage coverage-decision deadline. 14 or 7 days, or 72 or 24 hours, with or without the 14-day extension (42 CFR 422.568-422.572).',
    compute: MA.maOrgDeterminationClock,
    fields: [
      { dom: 'mao-type', arg: 'requestType', kind: 'enum', required: true, values: vals(MA.MA_REQUESTS), label: 'Kind of request' },
      { dom: 'mao-received', arg: 'received', kind: 'string', required: true, label: 'Plan received the request (YYYY-MM-DDTHH:MM)' },
      { dom: 'mao-extended', arg: 'extended', kind: 'enum', required: false, values: vals(MA.YES_NO), label: 'Plan took the 14-day extension' },
    ],
  },
  {
    id: 'ma-appeal-ladder',
    summary: 'The next Medicare Advantage appeal level and its filing deadline. Uses the 5-day receipt presumption and shows the plan\'s decision clocks.',
    compute: MA.maAppealLadder,
    fields: [
      { dom: 'maa-level', arg: 'level', kind: 'enum', required: true, values: vals(MA.MA_LEVELS), label: 'Decision notice you have' },
      { dom: 'maa-notice', arg: 'noticeDate', kind: 'string', required: true, label: 'Date printed on the notice (YYYY-MM-DD)' },
      { dom: 'maa-received', arg: 'receivedDate', kind: 'string', required: false, label: 'Date received, only with proof of later receipt (YYYY-MM-DD)' },
      { dom: 'maa-amount', arg: 'amount', kind: 'number', required: false, label: 'Amount at stake, for an ALJ hearing', unit: 'USD' },
    ],
  },
];
