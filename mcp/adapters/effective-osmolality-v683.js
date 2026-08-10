// spec-v683 MCP adapter: effective serum osmolality (tonicity) in
// lib/effective-osmolality-v683.js. The dom keys mirror the browser renderer
// (views/group-v683.js) and META['effective-osmolality'].example. Two numbers (sodium,
// glucose); a formula returns tonicity in mOsm/kg. Clinical domain.

import { effectiveOsmolality } from '../../lib/effective-osmolality-v683.js';

export default [
  {
    id: 'effective-osmolality',
    summary: 'Effective serum osmolality (tonicity) = 2 x sodium (mEq/L) + glucose (mg/dL) / 18. Excludes urea, unlike total calculated osmolality (the osmolal-gap tile). Reference ~275-295 mOsm/kg; > 320 mOsm/kg is a diagnostic criterion for the hyperosmolar hyperglycemic state (HHS).',
    compute: effectiveOsmolality,
    fields: [
      { dom: 'eosm-na', arg: 'sodium', kind: 'number', unit: 'mEq/L', required: true, label: 'Serum sodium (mEq/L)' },
      { dom: 'eosm-glu', arg: 'glucose', kind: 'number', unit: 'mg/dL', required: true, label: 'Serum glucose (mg/dL)' },
    ],
  },
];
