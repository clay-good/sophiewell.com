// spec-v1603: MCP adapter for ma-criteria-check. The dom keys mirror views/group-v1603.js.

import * as MA from '../../lib/ma-criteria-check.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'ma-criteria-check',
    summary: 'Whether a Medicare Advantage denial followed the process rules: whose criteria, public evidence, reviewer, 90-day transition.',
    compute: MA.maCriteriaCheck,
    fields: [
      { dom: 'mac-benefit', arg: 'benefit', kind: 'enum', required: true, values: vals(MA.BENEFITS), label: 'Basic or supplemental benefit' },
      { dom: 'mac-denial', arg: 'denial', kind: 'enum', required: true, values: vals(MA.DENIALS), label: 'Reason the denial gave' },
      { dom: 'mac-source', arg: 'source', kind: 'enum', required: true, values: vals(MA.SOURCES), label: 'Whose criteria the denial cites' },
      { dom: 'mac-medicare', arg: 'medicareCriteria', kind: 'enum', required: false, values: vals(MA.MEDICARE_CRITERIA), label: 'Whether Medicare criteria are fully established' },
      { dom: 'mac-posted', arg: 'posted', kind: 'enum', required: false, values: vals(MA.YES_NO), label: 'Internal criteria posted publicly' },
      { dom: 'mac-evidence', arg: 'evidence', kind: 'enum', required: false, values: vals(MA.YES_NO), label: 'Evidence summary posted publicly' },
      { dom: 'mac-reviewer', arg: 'reviewer', kind: 'enum', required: false, values: vals(MA.REVIEWERS), label: 'Who reviewed the denial' },
      { dom: 'mac-course', arg: 'course', kind: 'enum', required: false, values: vals(MA.COURSES), label: 'Ongoing course of treatment' },
      { dom: 'mac-days', arg: 'days', kind: 'number', required: false, label: 'Days from enrollment to the denial', unit: 'days' },
    ],
  },
];
