// spec-v351 MCP wave: adapter for the Goligher classification of internal hemorrhoids in
// lib/goligher-hemorrhoids-v351.js. The dom key mirrors the browser renderer (views/group-v351.js) and
// META['goligher-hemorrhoids'].example. `grade` is an enum (I / II / III / IV). The compute reports the
// Goligher grade and its internal-hemorrhoid prolapse description. The example sets grade III; its
// expected text is the grade description with no numeric facts (the grade is a roman numeral), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/goligher-hemorrhoids-v351.js';

export default [
  {
    id: 'goligher-hemorrhoids',
    summary: 'Goligher classification of INTERNAL hemorrhoids by degree of prolapse (grades I-IV) — the worldwide-standard grading of internal hemorrhoidal disease. I: bleed but do not prolapse; the cushions project into the anal canal without descending through the anus. II: prolapse through the anus on straining or defecation but reduce spontaneously. III: prolapse on straining or defecation and require manual reduction (advanced). IV: irreducible; permanently prolapsed and cannot be reduced, may be thrombosed or strangulated (advanced). Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.goligherHemorrhoids,
    fields: [
      { dom: 'goligher-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Goligher grade' },
    ],
  },
];
