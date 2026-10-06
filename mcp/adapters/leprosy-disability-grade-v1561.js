// spec-v1561 MCP adapter: leprosy-disability-grade in lib/leprosy-disability-grade-v1561.js.
// The dom keys mirror views/group-v1561.js and META['leprosy-disability-grade'].example. Clinical domain.

import * as M from '../../lib/leprosy-disability-grade-v1561.js';

export default [
  {
    id: 'leprosy-disability-grade',
    summary: 'Grades leprosy disability by the WHO 2009 rules: each eye, hand and foot 0, 1 or 2 (eyes have no grade 1), the patient grade as the highest, and the eye-hand-foot score as the sum of six (0-12).',
    compute: M.leprosyDisabilityGrade,
    fields: [
      { dom: 'ld-eyer', arg: 'eyeR', kind: 'enum', label: 'Right eye', values: M.EYE_OPTIONS.map((d) => d.value) },
      { dom: 'ld-eyel', arg: 'eyeL', kind: 'enum', label: 'Left eye', values: M.EYE_OPTIONS.map((d) => d.value) },
      { dom: 'ld-handr', arg: 'handR', kind: 'enum', label: 'Right hand', values: M.LIMB_OPTIONS.map((d) => d.value) },
      { dom: 'ld-handl', arg: 'handL', kind: 'enum', label: 'Left hand', values: M.LIMB_OPTIONS.map((d) => d.value) },
      { dom: 'ld-footr', arg: 'footR', kind: 'enum', label: 'Right foot', values: M.LIMB_OPTIONS.map((d) => d.value) },
      { dom: 'ld-footl', arg: 'footL', kind: 'enum', label: 'Left foot', values: M.LIMB_OPTIONS.map((d) => d.value) },
    ],
  },
];
