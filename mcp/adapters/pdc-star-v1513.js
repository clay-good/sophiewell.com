// spec-v1513: MCP adapters for the Star-method PDC and the adherence outreach list. The dom keys mirror views/group-v1513.js.

import * as PS from '../../lib/pdc-star-v1513.js';

const rows = (p) => [
  { dom: `${p}-fills`, arg: 'fills', kind: 'string', required: true, label: 'Fills, one per line: patient, measure (D08, D09 or D10), fill date, days supply, ingredient' },
  { dom: `${p}-stays`, arg: 'stays', kind: 'string', required: false, label: 'Inpatient or skilled nursing stays, one per line: patient, admit date, discharge date' },
  { dom: `${p}-excl`, arg: 'exclusions', kind: 'string', required: false, label: 'Exclusions, one per line: patient, hospice or esrd or dialysis' },
  { dom: `${p}-year`, arg: 'year', kind: 'number', required: true, label: 'Measurement year' },
];

export default [
  {
    id: 'pdc-star',
    summary: 'Part D adherence rates by the Star Ratings method from a fill history. Proportion of days covered per patient and measure, with the denominator rules.',
    compute: PS.pdcStar,
    fields: rows('ps'),
  },
  {
    id: 'adherence-outreach-list',
    summary: 'Which patients can still reach 80% adherence this year, and how much slack each has. A call list sorted by the fewest days of slack.',
    compute: PS.adherenceOutreachList,
    fields: [...rows('ao'), { dom: 'ao-asof', arg: 'asOf', kind: 'string', required: false, label: 'As of (YYYY-MM-DD; blank for today)' }],
  },
];
