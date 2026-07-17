// spec-v401 MCP wave: adapter for the modified Zargar classification of caustic esophagogastric injury in
// lib/zargar-caustic-v401.js. The dom key mirrors the browser renderer (views/group-v401.js) and
// META['zargar-caustic'].example. `grade` is an enum (0/1/2a/2b/3a/3b/4). The compute reports the grade and
// its endoscopic description. The example sets grade 2b; its expected text is the grade description (its
// only digits are the grade labels 2a / 2b, which the result echoes), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/zargar-caustic-v401.js';

export default [
  {
    id: 'zargar-caustic',
    summary: 'Modified Zargar endoscopic classification of a caustic / corrosive esophagogastric injury, grades 0/1/2a/2b/3a/3b/4, by the endoscopic depth and extent of the burn. 0: normal mucosa. 1: mucosal edema and hyperemia. 2a: superficial injury (erosions, exudate, superficial ulceration). 2b: deep discrete or circumferential ulceration. 3a: focal necrosis. 3b: extensive necrosis. 4: perforation. Higher grades (2b and above) are classically associated with a higher stricture risk. Reports the grade, not a diagnosis, a management decision, or a prognosis.',
    compute: C.zargarCaustic,
    fields: [
      { dom: 'zargar-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2a', '2b', '3a', '3b', '4'], label: 'Zargar grade' },
    ],
  },
];
