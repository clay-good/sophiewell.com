// spec-v183 MCP wave 14: adapters for lib/suites-v155.js tiles. dom keys mirror
// views/group-v155.js; arg names mirror the lib signatures. MIPI takes numeric
// labs plus a 0/1 ECOG select; Forrest is a single categorical select. The two
// diabetic-foot grading tiles (wagner-dfu, university-texas-dfu) joined in wave
// 53 once their META.examples were added — single categorical selects that map
// straight through the default toArgs.

import * as F from '../../lib/suites-v155.js';

export default [
  {
    id: 'wagner-dfu',
    summary: 'Wagner diabetic-foot ulcer classification (Wagner 1981): lesion depth / extent graded 0–5 (grade 3+ involves deep infection or gangrene and prompts surgical / vascular evaluation).',
    compute: F.wagnerDfu,
    fields: [
      { dom: 'wagner-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], required: true, label: 'Wagner grade (lesion depth / extent)' },
    ],
  },
  {
    id: 'mipi',
    summary: 'Mantle-cell lymphoma International Prognostic Index (Hoster 2008): a continuous score from age, ECOG, LDH/ULN ratio, and white-cell count → low / intermediate / high risk.',
    compute: F.mipi,
    fields: [
      { dom: 'mipi-age', arg: 'age', kind: 'number', label: 'Age (years)' },
      { dom: 'mipi-ecog', arg: 'ecog', kind: 'enum', values: ['0', '1'], label: 'ECOG performance status (0–1 vs 2–4)' },
      { dom: 'mipi-ldh', arg: 'ldh', kind: 'number', label: 'LDH (U/L)' },
      { dom: 'mipi-uln', arg: 'uln', kind: 'number', label: 'LDH upper limit of normal (U/L)' },
      { dom: 'mipi-wbc', arg: 'wbc', kind: 'number', label: 'White-cell count (cells/µL)' },
    ],
  },
];
