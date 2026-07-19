// spec-v434 MCP wave: adapter for the Pfirrmann disc degeneration grade in lib/pfirrmann-disc-v434.js. The
// dom key mirrors the browser renderer (views/group-v434.js) and META['pfirrmann-disc'].example. `grade` is
// an enum (I..V). The compute reports the grade and its MRI description. The example sets grade III; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/pfirrmann-disc-v434.js';

export default [
  {
    id: 'pfirrmann-disc',
    summary: 'The Pfirrmann classification of lumbar intervertebral disc degeneration on T2 MRI, by disc structure, nucleus-annulus distinction, signal, and height, grades I/II/III/IV/V. I: homogeneous bright, normal. II: inhomogeneous bright, normal. III: gray, unclear distinction. IV: gray to black, lost distinction. V: black, collapsed disc space. Reports the imaging grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.pfirrmannDisc,
    fields: [
      { dom: 'pfirrmann-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Pfirrmann grade' },
    ],
  },
];
