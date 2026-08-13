// spec-v720 MCP adapter: Angle classification of malocclusion in
// lib/angle-malocclusion-v720.js. The dom keys mirror the browser renderer
// (views/group-v720.js) and META['angle-malocclusion'].example. A molar-relationship enum +
// (for Class II) an incisor-pattern enum; decision logic returns the Angle class. Clinical domain.

import { angleMalocclusion } from '../../lib/angle-malocclusion-v720.js';

export default [
  {
    id: 'angle-malocclusion',
    summary: 'Angle classification of malocclusion (Angle 1899): by the mesiobuccal cusp of the upper first molar relative to the buccal groove of the lower first molar. Class I (neutroclusion) = in the groove; Class II (distoclusion) = mesial to it, Division 1 proclined or Division 2 retroclined maxillary incisors; Class III (mesioclusion) = distal to it.',
    compute: angleMalocclusion,
    fields: [
      { dom: 'angle-rel', arg: 'molarRelationship', kind: 'enum', values: ['neutroclusion', 'distoclusion', 'mesioclusion'], required: true, label: 'Molar relationship' },
      { dom: 'angle-incisors', arg: 'incisors', kind: 'enum', values: ['proclined', 'retroclined'], required: false, label: 'Maxillary incisor pattern (Class II only)' },
    ],
  },
];
