// spec-v318 MCP wave: adapter for the Los Angeles (LA) classification of erosive
// esophagitis in lib/la-esophagitis-v318.js. The dom key mirrors the browser renderer
// (views/group-v318.js) and META['la-esophagitis'].example. `grade` is an enum
// (A / B / C / D). The compute reports the grade and its standard definition. The example
// sets grade B; its band carries the "5 mm" example number, so it round-trips through the
// default makeToArgs with no custom toArgs.

import * as L from '../../lib/la-esophagitis-v318.js';

export default [
  {
    id: 'la-esophagitis',
    summary: 'Los Angeles (LA) classification of erosive (reflux) esophagitis (Lundell 1999, Gut). Grade A: one or more mucosal breaks <= 5 mm, not extending between the tops of two mucosal folds. Grade B: break(s) > 5 mm, not between two fold tops. Grade C: break(s) continuous between >= 2 fold tops but < 75% of the esophageal circumference. Grade D: break(s) >= 75% of the circumference. Grades A-B are mild and C-D severe. Reports the endoscopist-determined grade and its definition, not a diagnosis or a treatment order.',
    compute: L.laEsophagitis,
    fields: [
      { dom: 'la-grade', arg: 'grade', kind: 'enum', values: ['A', 'B', 'C', 'D'], label: 'LA grade (extent of mucosal breaks)' },
    ],
  },
];
