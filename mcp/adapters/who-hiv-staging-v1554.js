// spec-v1554 MCP adapter: who-hiv-staging in lib/who-hiv-staging-v1554.js.
// The dom keys mirror views/group-v1554.js and META['who-hiv-staging'].example. Clinical domain.

import * as M from '../../lib/who-hiv-staging-v1554.js';

export default [
  {
    id: 'who-hiv-staging',
    summary: 'Gives the WHO clinical stage of HIV for an adult or child. The highest stage with a condition present; an unassessed higher stage gives "at least", and stage 1 needs stages 2 to 4 all assessed as none.',
    compute: M.whoHivStaging,
    fields: [
      { dom: 'hs-age', arg: 'ageGroup', kind: 'enum', required: true, label: 'Age group', values: M.AGE_OPTIONS.map((d) => d.value) },
      { dom: 'hs-s4', arg: 's4', kind: 'enum', label: 'Stage 4 condition present', values: M.STAGE4_OPTIONS.map((d) => d.value) },
      { dom: 'hs-s3', arg: 's3', kind: 'enum', label: 'Stage 3 condition present', values: M.STAGE3_OPTIONS.map((d) => d.value) },
      { dom: 'hs-s2', arg: 's2', kind: 'enum', label: 'Stage 2 condition present', values: M.STAGE2_OPTIONS.map((d) => d.value) },
    ],
  },
];
