// spec-v647 MCP adapter: Schenck knee-dislocation classification in
// lib/schenck-v647.js. The dom keys mirror the browser renderer
// (views/group-v647.js) and META['schenck-knee'].example. This is a decision-logic
// CLASSIFIER (returns a KD grade code, not a score): it maps torn ligaments +
// fracture to KD-I..KD-V with C/N modifiers. No cruciate torn and no fracture is
// "not a KD pattern". Every input is an optional bool. Clinical domain.

import { schenckKnee } from '../../lib/schenck-v647.js';

export default [
  {
    id: 'schenck-knee',
    summary: 'Schenck anatomic classification of knee dislocations: maps the torn ligaments to a KD grade. KD-I one cruciate; KD-II both cruciates, collaterals intact; KD-III both cruciates + one collateral (IIIM medial / IIIL lateral); KD-IV both cruciates + both collaterals; KD-V dislocation with a periarticular fracture. A "C" suffix marks arterial injury, "N" neurologic injury (e.g. KD-IIIL-C-N).',
    compute: schenckKnee,
    fields: [
      { dom: 'sk-acl', arg: 'aclTorn', kind: 'bool', required: false, label: 'ACL torn' },
      { dom: 'sk-pcl', arg: 'pclTorn', kind: 'bool', required: false, label: 'PCL torn' },
      { dom: 'sk-medial', arg: 'medialTorn', kind: 'bool', required: false, label: 'Medial side torn (MCL / posteromedial corner)' },
      { dom: 'sk-lateral', arg: 'lateralTorn', kind: 'bool', required: false, label: 'Lateral side torn (LCL / posterolateral corner)' },
      { dom: 'sk-fracture', arg: 'fracture', kind: 'bool', required: false, label: 'Periarticular fracture present (makes it KD-V)' },
      { dom: 'sk-arterial', arg: 'arterial', kind: 'bool', required: false, label: 'Arterial (popliteal) injury — appends the C modifier' },
      { dom: 'sk-nerve', arg: 'nerve', kind: 'bool', required: false, label: 'Neurologic (e.g. peroneal) injury — appends the N modifier' },
    ],
  },
];
