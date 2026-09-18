// spec-v1389: MCP adapter. The dom keys mirror views/group-v1389.js and this tile's META example.

import * as CM from '../../lib/ca-5585-minor-hold-v1389.js';

export default [
  {
    id: 'ca-5585-minor-hold',
    summary: "California 72-hour psychiatric hold for a minor, its own section with a duty to notify the parent as soon as possible. Under Welfare and Institutions Code 5585.50, a minor who, as a result of mental disorder, is a danger to others or self, or gravely disabled, may be held 72 hours for treatment and evaluation in a county-designated facility for minors when voluntary treatment cannot be authorized. The facility makes every effort to notify the parent or legal guardian as soon as possible after detention; no fixed number of hours is set. Ages 18 and over are refused and pointed to the adult 5150.",
    compute: CM.ca5585MinorHold,
    fields: [
      { dom: 'cm-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'cm-criterion', arg: 'criterion', kind: 'enum', required: true, label: 'Criterion', values: CM.CRITERIA.map((c) => c.value) },
      { dom: 'cm-detained', arg: 'detained', kind: 'string', required: true, label: 'Minor detained (YYYY-MM-DDTHH:MM)' },
      { dom: 'cm-parent', arg: 'parentNotified', kind: 'string', label: 'Parent or legal guardian notified (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
