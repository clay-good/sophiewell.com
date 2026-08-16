// spec-v739 MCP adapter: Mayo classification of olecranon fractures in
// lib/mayo-olecranon-v739.js. The dom keys mirror the browser renderer
// (views/group-v739.js) and META['mayo-olecranon'].example. A decision-logic classifier
// (returns a type code IA..IIIB) over three enums: displacement, ulnohumeral stability,
// and comminution. Stability is only required once the fracture is displaced. Clinical domain.

import { mayoOlecranon } from '../../lib/mayo-olecranon-v739.js';

export default [
  {
    id: 'mayo-olecranon',
    summary: "Mayo classification of olecranon fractures (Morrey 1993): three radiographic factors set a type code IA-IIIB. Type I undisplaced; Type II displaced with the ulnohumeral joint stable; Type III displaced with the joint unstable (fracture-dislocation). Subtype A = noncomminuted, B = comminuted. Displacement separates I from II/III; ulnohumeral stability separates II from III.",
    compute: mayoOlecranon,
    fields: [
      { dom: 'mayo-disp', arg: 'displacement', kind: 'enum', values: ['undisplaced', 'displaced'], required: true, label: 'Displacement (undisplaced <3mm, or displaced)' },
      { dom: 'mayo-stab', arg: 'stability', kind: 'enum', values: ['stable', 'unstable'], required: false, label: 'Ulnohumeral joint stability (required when displaced): stable or unstable' },
      { dom: 'mayo-comm', arg: 'comminution', kind: 'enum', values: ['noncomminuted', 'comminuted'], required: true, label: 'Comminution (noncomminuted = A, comminuted = B)' },
    ],
  },
];
