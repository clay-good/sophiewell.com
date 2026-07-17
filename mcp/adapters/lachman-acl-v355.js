// spec-v355 MCP wave: adapter for the Lachman test grade of ACL laxity in lib/lachman-acl-v355.js. The
// dom key mirrors the browser renderer (views/group-v355.js) and META['lachman-acl'].example. `grade`
// is an enum (I / II / III). The compute reports the Lachman grade and its translation/endpoint
// description. The example sets grade II; its expected text is the grade description (the mm range is
// prose), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/lachman-acl-v355.js';

export default [
  {
    id: 'lachman-acl',
    summary: 'Lachman test grade of anterior cruciate ligament (ACL) laxity (grades I-III), from the anterior tibial translation (vs the uninjured knee) and the endpoint quality — the standard bedside ACL-laxity maneuver. I: 0-5 mm translation, firm endpoint (mild). II: 6-10 mm, soft endpoint (moderate); 5 mm or more is highly suggestive of a complete ACL tear. III: 11-15 mm, no discernible endpoint (severe). Reports the grade, not a diagnosis, an imaging substitute, or a treatment decision.',
    compute: C.lachmanAcl,
    fields: [
      { dom: 'lachman-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III'], label: 'Lachman grade' },
    ],
  },
];
