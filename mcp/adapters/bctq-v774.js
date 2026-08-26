// spec-v774 MCP adapter: Boston Carpal Tunnel Questionnaire in lib/bctq-v774.js.
// The dom keys mirror the browser renderer (views/group-v774.js) and META['bctq'].example.
// Nineteen 1-5 enums across two independent scales, each scored as its own mean. Clinical domain.

import { bctq } from '../../lib/bctq-v774.js';

const RATE = ['1', '2', '3', '4', '5'];
const S = [
  ['s1', 'Symptom 1 - hand or wrist pain at night (1-5)'],
  ['s2', 'Symptom 2 - how often pain wakes you at night (1-5)'],
  ['s3', 'Symptom 3 - daytime hand or wrist pain (1-5)'],
  ['s4', 'Symptom 4 - how often daytime pain occurs (1-5)'],
  ['s5', 'Symptom 5 - average length of a daytime pain episode (1-5)'],
  ['s6', 'Symptom 6 - numbness in the hand (1-5)'],
  ['s7', 'Symptom 7 - weakness in the hand or wrist (1-5)'],
  ['s8', 'Symptom 8 - tingling in the hand (1-5)'],
  ['s9', 'Symptom 9 - numbness or tingling at night (1-5)'],
  ['s10', 'Symptom 10 - how often numbness or tingling wakes you (1-5)'],
  ['s11', 'Symptom 11 - difficulty grasping small objects (1-5)'],
];
const F = [
  ['f1', 'Activity 1 - writing (1-5)'],
  ['f2', 'Activity 2 - fastening buttons (1-5)'],
  ['f3', 'Activity 3 - holding a book while reading (1-5)'],
  ['f4', 'Activity 4 - gripping a telephone handset (1-5)'],
  ['f5', 'Activity 5 - opening jars (1-5)'],
  ['f6', 'Activity 6 - household chores (1-5)'],
  ['f7', 'Activity 7 - carrying grocery bags (1-5)'],
  ['f8', 'Activity 8 - bathing and dressing (1-5)'],
];

export default [
  {
    id: 'bctq',
    summary: 'Boston Carpal Tunnel Questionnaire (BCTQ; Levine 1993): patient-reported severity and function in carpal tunnel syndrome. The Symptom Severity Scale rates 11 items 1-5 and the Functional Status Scale rates 8 hand activities 1-5; each scale scores as the mean of its own items, so both run 1-5 with higher meaning more severe. The two scales are reported separately and never summed.',
    compute: bctq,
    fields: [
      ...S.map(([arg, label]) => ({ dom: `bctq-${arg}`, arg, kind: 'enum', values: RATE, required: true, label })),
      ...F.map(([arg, label]) => ({ dom: `bctq-${arg}`, arg, kind: 'enum', values: RATE, required: true, label })),
    ],
  },
];
