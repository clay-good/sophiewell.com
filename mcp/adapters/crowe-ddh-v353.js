// spec-v353 MCP wave: adapter for the Crowe classification of adult developmental dysplasia of the hip
// in lib/crowe-ddh-v353.js. The dom key mirrors the browser renderer (views/group-v353.js) and
// META['crowe-ddh'].example. `grade` is an enum (I / II / III / IV). The compute reports the Crowe grade
// and its femoral-head subluxation description. The example sets grade III; its expected text is the
// grade description (the grade is a roman numeral; the percentage band is prose), so it round-trips
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/crowe-ddh-v353.js';

export default [
  {
    id: 'crowe-ddh',
    summary: 'Crowe classification (Crowe, Mani & Ranawat 1979) of adult developmental dysplasia of the hip (grades I-IV) by the extent of proximal femoral-head subluxation on an AP pelvis radiograph — the most commonly used adult-DDH grade for total-hip-arthroplasty planning. I: < 50% subluxation. II: 50-75%. III: 75-100%. IV: > 100% (high / complete dislocation), the most severe. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.croweDdh,
    fields: [
      { dom: 'crowe-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Crowe grade' },
    ],
  },
];
