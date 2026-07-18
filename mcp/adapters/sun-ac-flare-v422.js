// spec-v422 MCP wave: adapter for the SUN anterior chamber flare grade in lib/sun-ac-flare-v422.js. The dom
// key mirrors the browser renderer (views/group-v422.js) and META['sun-ac-flare'].example. `grade` is an enum
// (0/1+/2+/3+/4+). The compute reports the grade and its description. The example sets grade 2+; its expected
// text carries no numeric facts beyond the grade label (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/sun-ac-flare-v422.js';

export default [
  {
    id: 'sun-ac-flare',
    summary: 'SUN (Standardization of Uveitis Nomenclature) anterior chamber flare grade, the grading of aqueous flare (the scatter of the slit-lamp beam by anterior-chamber protein), grades 0/1+/2+/3+/4+, the companion scale to the SUN anterior chamber cell grade. 0: none. 1+: faint. 2+: moderate (iris and lens details clear). 3+: marked (iris and lens details hazy). 4+: intense (fibrin or plasmoid aqueous). Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.sunAcFlare,
    fields: [
      { dom: 'sunf-grade', arg: 'grade', kind: 'enum', values: ['0', '1+', '2+', '3+', '4+'], label: 'SUN anterior chamber flare grade' },
    ],
  },
];
