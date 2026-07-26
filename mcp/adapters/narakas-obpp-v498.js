// spec-v498 MCP wave: adapter for the Narakas obstetric-brachial-plexus-palsy classification in
// lib/narakas-obpp-v498.js. The dom key mirrors the browser renderer (views/group-v498.js) and
// META['narakas-obpp'].example. `group` is an enum (I/II/III/IV). The compute reports the group and its
// root-involvement description. The example sets group II; the root labels in its expected text (C5-C7) are
// carried verbatim by the result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/narakas-obpp-v498.js';

export default [
  {
    id: 'narakas-obpp',
    summary: 'The Narakas classification of obstetric brachial plexus palsy by which nerve roots are involved, groups I-IV in increasing extent. I: C5-C6, the upper trunk (Erb palsy), affecting shoulder abduction and elbow flexion. II: C5-C7, adding wrist and finger extension. III: C5-T1, a complete flaccid limb without Horner syndrome. IV: C5-T1 with Horner syndrome. Reports the group the clinician has determined from the examination, not a diagnosis, a decision to refer for nerve reconstruction, or a recovery prediction for an individual infant.',
    compute: C.narakasObpp,
    fields: [
      { dom: 'narakas-group', arg: 'group', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Narakas group' },
    ],
  },
];
