// spec-v1424: MCP adapter. The dom keys mirror views/group-v1424.js and this tile's META example.

import * as AS from '../../lib/aospine-sacral-v1424.js';

export default [
  {
    id: 'aospine-sacral',
    summary: 'Classifies a sacral fracture on CT by the AOSpine sacral system, with its neurologic and case-specific modifiers. Where the fracture runs sets type A (below the sacroiliac joints), B (unilateral vertical) or C (spinopelvic); the pattern within that type sets the subtype. The main type is reliable; the subtype is not, and the review advises against relying on it.',
    compute: AS.aospineSacral,
    fields: [
      { dom: 'aosac-region', arg: 'region', kind: 'enum', required: true, label: 'Where the fracture runs', values: AS.AOSAC_REGION.map((x) => x.value) },
      { dom: 'aosac-a', arg: 'aPattern', kind: 'enum', label: 'Type A pattern (read only for type A)', values: AS.AOSAC_A.map((x) => x.value) },
      { dom: 'aosac-b', arg: 'bLine', kind: 'enum', label: 'Type B fracture line (read only for type B)', values: AS.AOSAC_B.map((x) => x.value) },
      { dom: 'aosac-c', arg: 'cPattern', kind: 'enum', label: 'Type C pattern (read only for type C)', values: AS.AOSAC_C.map((x) => x.value) },
      { dom: 'aosac-neuro', arg: 'neuro', kind: 'enum', label: 'Neurologic status', values: AS.AOSAC_NEURO.map((x) => x.value) },
      ...AS.AOSAC_MODIFIERS.map((m) => ({ dom: `aosac-${m.key}`, arg: m.key, kind: 'boolean', required: false, label: m.label })),
    ],
  },
];
