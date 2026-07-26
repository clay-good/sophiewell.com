// spec-v494 MCP wave: adapter for the INTERMACS profiles in lib/intermacs-profile-v494.js.
// The dom key mirrors the browser renderer (views/group-v494.js) and META['intermacs-profile'].example.
// `profile` is an enum (1-7). The compute reports the profile and its clinical-severity description. The
// example sets profile 3; the numbers in its expected text are carried by the result band, so it flows
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/intermacs-profile-v494.js';

export default [
  {
    id: 'intermacs-profile',
    summary: 'The INTERMACS profiles of advanced heart failure, the clinical-severity descriptor used when mechanical circulatory support is being considered, profiles 1-7 (1 the sickest). 1: critical cardiogenic shock. 2: progressive decline on inotropes. 3: stable but inotrope dependent. 4: resting symptoms. 5: exertion intolerant. 6: exertion limited. 7: advanced NYHA class III. Reports the profile, not a diagnosis, a device or transplant decision, or a survival prediction.',
    compute: C.intermacsProfile,
    fields: [
      { dom: 'intermacs-profile', arg: 'profile', kind: 'enum', values: ['1', '2', '3', '4', '5', '6', '7'], label: 'INTERMACS profile' },
    ],
  },
];
