// spec-v1241: MCP adapter. The dom keys mirror views/group-v1241.js and this tile's META example.
// All three axes are required. F0 is how "no facet injury" is said; a blank facet is not that, and
// an F4 facet on an otherwise intact vertebral body is a dislocation.

import { aoSpineSubaxial, AO_SUBAXIAL_MORPHOLOGY, AO_SUBAXIAL_FACET, AO_SUBAXIAL_MODIFIERS, AO_NEURO } from '../../lib/ao-spine-subaxial-v1241.js';

export default [
  {
    id: 'ao-spine-subaxial',
    summary: 'AO Spine subaxial cervical spine injury classification assembles the code from four axes. Those are the morphology type A0 to C, the facet injury F0 to F4 with a BL marker when it is bilateral, the neurological status N0 to NX, and the case-specific modifiers M1 to M4. It prints no total on purpose: the severity values published for this system are perceived severity on a 0 to 100 scale, one per subtype, not addends, so summing them would make a number with no denominator and no threshold. SLIC, also in this catalog, is the subaxial system that does sum. The facet is a separate axis for a reason the code makes visible, since an A1 body with an F4 facet is a dislocation that the morphology letter alone reads as minor.',
    compute: aoSpineSubaxial,
    fields: [
      { dom: 'aosc-morph', arg: 'morphology', kind: 'enum', required: true, label: 'Morphology', values: AO_SUBAXIAL_MORPHOLOGY.map((m) => m.value) },
      { dom: 'aosc-facet', arg: 'facet', kind: 'enum', required: true, label: 'Facet injury', values: AO_SUBAXIAL_FACET.map((f) => f.value) },
      { dom: 'aosc-neuro', arg: 'neuro', kind: 'enum', required: true, label: 'Neurological status', values: AO_NEURO.map((n) => n.value) },
      { dom: 'aosc-bl', arg: 'bilateral', kind: 'boolean', required: false, label: 'Bilateral facet injury of the same type (BL)' },
      ...AO_SUBAXIAL_MODIFIERS.map((m) => ({ dom: `aosc-${m.key}`, arg: m.key, kind: 'boolean', required: false, label: m.label })),
    ],
  },
];
