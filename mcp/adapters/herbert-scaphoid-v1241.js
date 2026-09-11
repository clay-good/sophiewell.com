// spec-v1241: MCP adapter. The dom key mirrors views/group-v1241.js and this tile's META example.
// The type is required and has no default, because A2 and B2 are both waist fractures and only one
// of them is stable.

import { herbertScaphoid, HERBERT_TYPES } from '../../lib/herbert-scaphoid-v1241.js';

export default [
  {
    id: 'herbert-scaphoid',
    summary: 'Herbert classification of scaphoid fractures sorts the fracture by stability first and by what happened afterwards second. A1 and A2 are the acute stable fractures, the tubercle and the incomplete waist; B1 to B5 are the acute unstable ones, the distal oblique, the complete waist, the proximal pole, the fracture-dislocation and the comminuted; C is a delayed union and D an established non-union, D1 fibrous and D2 a sclerotic pseudarthrosis. The letter is not the stability: C and D record an outcome rather than a stability grade, so neither stable nor unstable answers what they ask. B3, the proximal pole, is the fragment whose blood supply enters from the far end and carries the highest rates of avascular necrosis and non-union, which the letter B does not say on its own. Russe, also in this catalog, sorts the same fracture by the direction of the fracture line instead.',
    compute: herbertScaphoid,
    fields: [
      { dom: 'hsc-type', arg: 'type', kind: 'enum', required: true, label: 'Herbert type', values: HERBERT_TYPES.map((t) => t.value) },
    ],
  },
];
