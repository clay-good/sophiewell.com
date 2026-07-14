// spec-v304 MCP wave: adapter for the 1-mg overnight dexamethasone suppression
// test in lib/dst-v304.js. The dom keys mirror the browser renderer
// (views/group-v304.js) and META['dexamethasone-suppression'].example. `cortisol`
// is the required post-dexamethasone serum cortisol; `unit` is an optional enum
// (µg/dL default, or nmol/L). The compute returns the suppression comparison and
// suppress/fail flag. The `band` carries the "3 µg/dL / 1.8" example, so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as D from '../../lib/dst-v304.js';

export default [
  {
    id: 'dexamethasone-suppression',
    summary: 'Overnight 1-mg dexamethasone suppression test (DST) interpretation: given the 8 am serum cortisol drawn after 1 mg dexamethasone and its unit, compares it with the suppression cutoff of 1.8 µg/dL (50 nmol/L) and reports normal suppression (below) or a failure to suppress (at or above, consistent with possible Cushing syndrome or autonomous cortisol secretion), with a false-positive caveat. Reports the cited threshold interpretation, not a diagnosis.',
    compute: D.dexSuppressionTest,
    fields: [
      { dom: 'dst-cortisol', arg: 'cortisol', kind: 'number', required: true, label: 'Post-dexamethasone 8 am cortisol' },
      { dom: 'dst-unit', arg: 'unit', kind: 'enum', required: false, values: ['µg/dL', 'nmol/L'], label: 'Unit' },
    ],
  },
];
