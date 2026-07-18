// spec-v421 MCP wave: adapter for the SUN anterior chamber cell grade in lib/sun-ac-cell-v421.js. The dom key
// mirrors the browser renderer (views/group-v421.js) and META['sun-ac-cell'].example. `grade` is an enum
// (0/0.5+/1+/2+/3+/4+). The compute reports the grade and its defining cell-count range. The example sets
// grade 1+; its expected numbers (6 to 15 cells) appear in the result band, so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/sun-ac-cell-v421.js';

export default [
  {
    id: 'sun-ac-cell',
    summary: 'SUN (Standardization of Uveitis Nomenclature) anterior chamber cell grade, the grading of anterior-chamber inflammatory cells by the number counted in a 1 mm by 1 mm slit-lamp beam field, grades 0/0.5+/1+/2+/3+/4+, used to record anterior-chamber inflammation in uveitis. 0: less than 1 cell. 0.5+: 1 to 5. 1+: 6 to 15. 2+: 16 to 25. 3+: 26 to 50. 4+: more than 50. Grades cells (activity), a separate scale from anterior chamber flare. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.sunAcCell,
    fields: [
      { dom: 'sun-cell', arg: 'grade', kind: 'enum', values: ['0', '0.5+', '1+', '2+', '3+', '4+'], label: 'SUN anterior chamber cell grade' },
    ],
  },
];
