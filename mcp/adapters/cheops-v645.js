// spec-v645 MCP adapter: CHEOPS in lib/cheops-v645.js. The dom keys mirror the
// browser renderer (views/group-v645.js) and META['cheops'].example. Six behavioral
// items, each a required enum; NON-UNIFORM points (Cry has no zero, so the floor is
// 4). The total (4-13) is the primary output; the intervention threshold is advisory
// (>= 6 most common) and is not asserted as a single verdict. Clinical domain.

import { cheops } from '../../lib/cheops-v645.js';

export default [
  {
    id: 'cheops',
    summary: 'CHEOPS (Children’s Hospital of Eastern Ontario Pain Scale): six observed behaviors (cry, facial, verbal, torso, whether the child touches the wound, legs) with non-uniform points, total 4-13. Higher means more pain-related behavior; a score of 6 or more is the most commonly cited analgesia threshold (5 and 8 also appear), so the total is the primary output.',
    compute: cheops,
    fields: [
      { dom: 'cheops-cry', arg: 'cry', kind: 'enum', values: ['nocry', 'moaning', 'crying', 'scream'], required: true, label: 'Cry (no cry 1, moaning 2, crying 2, scream 3)' },
      { dom: 'cheops-facial', arg: 'facial', kind: 'enum', values: ['smiling', 'composed', 'grimace'], required: true, label: 'Facial (smiling 0, composed 1, grimace 2)' },
      { dom: 'cheops-verbal', arg: 'verbal', kind: 'enum', values: ['positive', 'none', 'other', 'pain', 'both'], required: true, label: 'Verbal (positive 0; none or non-pain complaint 1; pain complaint or both 2)' },
      { dom: 'cheops-torso', arg: 'torso', kind: 'enum', values: ['neutral', 'shifting', 'tense', 'shivering', 'upright', 'restrained'], required: true, label: 'Torso (neutral 1; shifting/tense/shivering/upright/restrained 2)' },
      { dom: 'cheops-touch', arg: 'touch', kind: 'enum', values: ['nottouching', 'reaching', 'touching', 'grabbing', 'restrained'], required: true, label: 'Touch wound (not touching 1; reaching/touching/grabbing/restrained 2)' },
      { dom: 'cheops-legs', arg: 'legs', kind: 'enum', values: ['neutral', 'squirming', 'drawnup', 'standing', 'restrained'], required: true, label: 'Legs (neutral 1; squirming/drawn-up/standing/restrained 2)' },
    ],
  },
];
