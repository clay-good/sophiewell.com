// spec-v405 MCP wave: adapter for the modified Savary-Miller classification of reflux esophagitis in
// lib/savary-miller-v405.js. The dom key mirrors the browser renderer (views/group-v405.js) and
// META['savary-miller'].example. `grade` is an enum (I/II/III/IV/V). The compute reports the grade and its
// endoscopic description. The example sets grade III; its expected text is the grade description (a roman
// numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/savary-miller-v405.js';

export default [
  {
    id: 'savary-miller',
    summary: 'Modified Savary-Miller endoscopic classification of reflux esophagitis, grades I/II/III/IV/V, by the endoscopic extent of the mucosal lesions - the older / alternative companion to the Los Angeles classification. I: single or isolated erosion(s) on a single mucosal fold. II: multiple, non-confluent erosions on more than one fold, not circumferential. III: circumferential (confluent) erosions extending around the entire lumen. IV: chronic complications (deep ulcer, stricture, or esophageal shortening). V: Barrett esophagus (columnar-lined epithelium). Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.savaryMiller,
    fields: [
      { dom: 'sm-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Savary-Miller grade' },
    ],
  },
];
