// spec-v1639 MCP adapter: contraceptive-missed-pill in lib/contraceptive-missed-pill-v1639.js. The dom
// keys mirror views/group-v1639.js and META['contraceptive-missed-pill'].example. No clock: both times
// are entered.

import * as MP from '../../lib/contraceptive-missed-pill-v1639.js';

export default [
  {
    id: 'contraceptive-missed-pill',
    summary: 'What CDC\'s 2024 recommendations say about a late or missed birth control pill. Covers combined pills (late under 24 hours, one missed 24 to under 48, two or more at 48 hours), drospirenone pills, and norethindrone or norgestrel pills (missed after more than 3 hours). Prints CDC\'s action list, the back-up days and its emergency contraception lines. CDC, not the product label.',
    compute: MP.contraceptiveMissedPill,
    fields: [
      { dom: 'cmp-type', arg: 'pillType', kind: 'enum', required: true, values: MP.PILL_TYPES.map((p) => p.value), label: 'Kind of pill' },
      { dom: 'cmp-due', arg: 'dueAt', kind: 'string', required: true, label: 'When the first late or missed hormonal pill was due (YYYY-MM-DDTHH:MM)' },
      { dom: 'cmp-now', arg: 'nowAt', kind: 'string', required: true, label: 'Date and time now (YYYY-MM-DDTHH:MM)' },
      { dom: 'cmp-count', arg: 'missedCount', kind: 'number', label: 'Consecutive hormonal pills missed (optional cross-check)' },
      { dom: 'cmp-week', arg: 'week', kind: 'enum', values: MP.WEEKS.map((w) => w.value), label: 'Week of hormonal pills the missed pills fall in (needed at 48 hours or more)' },
      { dom: 'cmp-upsi', arg: 'intercourse', kind: 'enum', values: MP.UPSI.map((u) => u.value), label: 'Unprotected intercourse in the previous 5 days (progestin-only: at any time)' },
    ],
  },
];
