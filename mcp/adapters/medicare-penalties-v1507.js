// spec-v1507: MCP adapters for the Part B and Part D late penalties. The dom keys mirror views/group-v1507.js.

import * as MP from '../../lib/medicare-penalties-v1507.js';

export default [
  {
    id: 'partb-late-penalty',
    summary: 'Medicare Part B late enrollment penalty. Adds 10% for each full 12 months late, on the standard premium for the year (42 CFR 408.22).',
    compute: MP.partbLatePenalty,
    fields: [
      { dom: 'pbl-months', arg: 'monthsLate', kind: 'number', required: true, label: 'Months late, not counting special enrollment months' },
      { dom: 'pbl-year', arg: 'year', kind: 'number', required: false, label: 'Premium year (blank for this year)' },
      { dom: 'pbl-premium', arg: 'premium', kind: 'number', required: false, label: 'Standard Part B premium, if not the published figure', unit: 'USD' },
    ],
  },
  {
    id: 'partd-late-penalty',
    summary: 'Medicare Part D late enrollment penalty from the gaps in drug coverage. Only gaps of 63 days or more count, and the result rounds to the nearest 10 cents.',
    compute: MP.partdLatePenalty,
    fields: [
      { dom: 'pdl-g1s', arg: 'gap1Start', kind: 'string', required: true, label: 'Gap 1 first day without coverage (YYYY-MM-DD)' },
      { dom: 'pdl-g1e', arg: 'gap1End', kind: 'string', required: true, label: 'Gap 1 last day without coverage (YYYY-MM-DD)' },
      { dom: 'pdl-g2s', arg: 'gap2Start', kind: 'string', required: false, label: 'Gap 2 first day (YYYY-MM-DD)' },
      { dom: 'pdl-g2e', arg: 'gap2End', kind: 'string', required: false, label: 'Gap 2 last day (YYYY-MM-DD)' },
      { dom: 'pdl-g3s', arg: 'gap3Start', kind: 'string', required: false, label: 'Gap 3 first day (YYYY-MM-DD)' },
      { dom: 'pdl-g3e', arg: 'gap3End', kind: 'string', required: false, label: 'Gap 3 last day (YYYY-MM-DD)' },
      { dom: 'pdl-year', arg: 'year', kind: 'number', required: false, label: 'Premium year (blank for this year)' },
      { dom: 'pdl-base', arg: 'base', kind: 'number', required: false, label: 'Base beneficiary premium, if not a published figure', unit: 'USD' },
    ],
  },
  {
    id: 'parta-premium',
    summary: 'Medicare Part A premium from quarters of covered work. Adds any late increase: 10% for twice the full years late (42 CFR 406.32).',
    compute: MP.partaPremium,
    fields: [
      { dom: 'pap-quarters', arg: 'quarters', kind: 'number', required: true, label: 'Quarters of Medicare-covered work, own or spouse' },
      { dom: 'pap-late', arg: 'monthsLate', kind: 'number', required: false, label: 'Months late for premium Part A' },
      { dom: 'pap-year', arg: 'year', kind: 'number', required: false, label: 'Premium year (blank for this year)' },
    ],
  },
];
