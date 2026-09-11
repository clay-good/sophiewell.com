// spec-v1241: MCP adapter. The dom keys mirror views/group-v1241.js and this tile's META example.
// Morphology and neurology are both required: the lib refuses a blank neurology rather than reading
// it as N0, and the difference between those is four points and, near the bands, a category.

import { aoSpineTl, AO_TL_MORPHOLOGY, AO_TL_MODIFIERS, AO_NEURO } from '../../lib/ao-spine-tl-v1241.js';

export default [
  {
    id: 'ao-spine-tl',
    summary: 'AO Spine thoracolumbar injury classification, with the TL AOSIS severity score summed from it. The morphology type carries 0 to 8 points, the neurological status 0 to 4, and the M1 modifier 1, for a maximum of 13. A total of 3 or less is the band where conservative treatment is preferred, 4 or 5 the indeterminate band where either is considered appropriate, and 6 or more the band where surgery is preferred; those bands come from Lambrechts 2023, because the scoring paper published points and said its thresholds would follow later. Two things the total hides are printed beside it: M2, a patient comorbidity such as ankylosing spondylitis, scores zero and still changes the operation, and NX means the patient could not be examined rather than that the examination was normal. This is not TLICS, which is a different system in this catalog with its own score and thresholds.',
    compute: aoSpineTl,
    fields: [
      { dom: 'aotl-morph', arg: 'morphology', kind: 'enum', required: true, label: 'Morphology', values: AO_TL_MORPHOLOGY.map((m) => m.value) },
      { dom: 'aotl-neuro', arg: 'neuro', kind: 'enum', required: true, label: 'Neurological status', values: AO_NEURO.map((n) => n.value) },
      ...AO_TL_MODIFIERS.map((m) => ({ dom: `aotl-${m.key}`, arg: m.key, kind: 'boolean', required: false, label: m.label })),
    ],
  },
];
