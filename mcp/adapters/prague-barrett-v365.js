// spec-v365 MCP wave: adapter for the Prague C&M criteria in lib/prague-barrett-v365.js. The dom keys
// mirror the browser renderer (views/group-v365.js) and META['prague-barrett'].example. It is a
// two-field NUMERIC tile: `c` (circumferential extent) and `m` (maximal extent), both required (both in
// the example). The compute reports the Prague notation and the segment descriptor and echoes C and M,
// so the example (C 2, M 5 -> Prague C2 M5) round-trips its numeric facts (2, 5) through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/prague-barrett-v365.js';

export default [
  {
    id: 'prague-barrett',
    summary: 'Prague C&M criteria (Sharma 2006) for the endoscopic grading of Barrett esophagus — the standardized measure of the circumferential (C) and maximal (M) extent, in cm above the gastroesophageal junction, of the columnar-lined segment, with M at least as long as C. Reports the Prague C_ M_ notation and the traditional short-segment (M < 3 cm) / long-segment (M >= 3 cm) descriptor. Barrett requires biopsy-confirmed intestinal metaplasia; reports the extent notation, not a diagnosis, a dysplasia grade, or a surveillance decision.',
    compute: C.pragueBarrett,
    fields: [
      { dom: 'pr-c', arg: 'c', kind: 'number', label: 'Circumferential extent C (cm above GEJ)', required: true },
      { dom: 'pr-m', arg: 'm', kind: 'number', label: 'Maximal extent M (cm above GEJ)', required: true },
    ],
  },
];
