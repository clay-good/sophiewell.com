// spec-v1638 MCP adapter: mtm-eligibility-check in lib/mtm-eligibility-check-v1638.js. The dom keys
// mirror views/group-v1638.js and META['mtm-eligibility-check'].example. Administrative domain.
// No clock: the plan year is an input.

import * as MT from '../../lib/mtm-eligibility-check-v1638.js';

export default [
  {
    id: 'mtm-eligibility-check',
    summary: 'Whether a member meets the Part D medication therapy management targeting criteria. Group 1 needs the plan\'s minimum chronic diseases and Part D drugs and a projected annual drug cost at or above CMS\'s threshold ($1,623 for 2025, $1,276 for 2026, $1,340 for 2027); group 2 is any at-risk beneficiary (42 CFR 423.153(d)(2)).',
    compute: MT.mtmEligibilityCheck,
    fields: [
      { dom: 'mtm-year', arg: 'planYear', kind: 'number', required: true, label: 'Plan year' },
      { dom: 'mtm-min-dis', arg: 'planMinDiseases', kind: 'number', required: true, label: 'Plan minimum number of chronic diseases (2 or 3)' },
      { dom: 'mtm-min-drugs', arg: 'planMinDrugs', kind: 'number', required: true, label: 'Plan minimum number of Part D drugs (2 to 8)' },
      { dom: 'mtm-dis', arg: 'memberDiseases', kind: 'number', required: true, label: 'Member chronic diseases that the plan counts' },
      { dom: 'mtm-drugs', arg: 'memberDrugs', kind: 'number', required: true, label: 'Member Part D drugs that the plan counts' },
      { dom: 'mtm-cost', arg: 'annualCost', kind: 'number', required: true, label: 'Projected annual covered Part D drug cost', unit: 'dollars' },
      { dom: 'mtm-risk', arg: 'atRisk', kind: 'enum', required: true, values: MT.AT_RISK.map((k) => k.value), label: 'At-risk beneficiary under a drug management program' },
      { dom: 'mtm-threshold', arg: 'thresholdOverride', kind: 'number', label: 'MTM cost threshold, for a year after 2027', unit: 'dollars' },
    ],
  },
];
