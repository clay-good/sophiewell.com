// spec-v1603 tool 3: MCP adapter for pa-metrics-compare. The dom keys mirror views/group-v1603.js.

import * as PM from '../../lib/pa-metrics-compare.js';

const vals = (xs) => xs.map((x) => x.value);
const n = (dom, arg, label, unit) => ({ dom, arg, kind: 'number', required: false, label, ...(unit ? { unit } : {}) });

export default [
  {
    id: 'pa-metrics-compare',
    summary: 'Checks a payer\'s posted CMS-0057-F prior authorization report. The nine required elements, stated rates against their counts, and median decision times against the deadline.',
    compute: PM.paMetricsCompare,
    fields: [
      { dom: 'pam-program', arg: 'program', kind: 'enum', required: true, values: vals(PM.PROGRAMS), label: 'Kind of plan' },
      { dom: 'pam-year', arg: 'reportYear', kind: 'number', required: true, label: 'Calendar year the report covers', unit: 'year' },
      { dom: 'pam-list', arg: 'list', kind: 'enum', required: false, values: vals(PM.YES_NO), label: 'Posts the list of items and services needing prior authorization' },
      n('pam-std-appr', 'stdApprovedPct', 'Standard requests approved', 'percent'),
      n('pam-std-deny', 'stdDeniedPct', 'Standard requests denied', 'percent'),
      n('pam-appeal', 'appealApprovedPct', 'Standard requests approved after appeal', 'percent'),
      n('pam-ext', 'extendedApprovedPct', 'Extended-review requests approved', 'percent'),
      n('pam-exp-appr', 'expApprovedPct', 'Expedited requests approved', 'percent'),
      n('pam-exp-deny', 'expDeniedPct', 'Expedited requests denied', 'percent'),
      { dom: 'pam-unit', arg: 'timeUnit', kind: 'enum', required: false, values: vals(PM.TIME_UNITS), label: 'Unit of the decision times' },
      n('pam-std-avg', 'stdAvg', 'Standard decisions: average time'),
      n('pam-std-med', 'stdMedian', 'Standard decisions: median time'),
      n('pam-exp-avg', 'expAvg', 'Expedited decisions: average time'),
      n('pam-exp-med', 'expMedian', 'Expedited decisions: median time'),
      n('pam-std-n', 'stdTotal', 'Standard requests in all'),
      n('pam-std-n-appr', 'stdApproved', 'Standard requests approved (count)'),
      n('pam-std-n-deny', 'stdDenied', 'Standard requests denied (count)'),
      n('pam-exp-n', 'expTotal', 'Expedited requests in all'),
      n('pam-exp-n-appr', 'expApproved', 'Expedited requests approved (count)'),
      n('pam-exp-n-deny', 'expDenied', 'Expedited requests denied (count)'),
    ],
  },
];
