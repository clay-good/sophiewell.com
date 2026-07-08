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
    id: 'university-texas-dfu',
    summary: 'University of Texas diabetic-foot ulcer classification (Lavery/Armstrong 1996/1998): a grade (depth 0–3) × stage (A clean, B infection, C ischemia, D both) grid; outcomes worsen with increasing grade and stage.',
    compute: F.universityTexasDfu,
    fields: [
      { dom: 'ut-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3'], required: true, label: 'Grade — wound depth' },
      { dom: 'ut-stage', arg: 'stage', kind: 'enum', values: ['A', 'B', 'C', 'D'], required: true, label: 'Stage — complication' },
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
  {
    id: 'forrest',
    summary: 'Forrest classification (Forrest 1974): the endoscopic stigmata grade Ia–III of an upper-GI ulcer, mapping to rebleeding risk and the indication for endoscopic therapy.',
    compute: F.forrest,
    fields: [
      { dom: 'forrest-class', arg: 'klass', kind: 'enum', values: ['Ia', 'Ib', 'IIa', 'IIb', 'IIc', 'III'], required: true, label: 'Forrest class' },
    ],
  },
];
