// spec-v1423: MCP adapter. The dom keys mirror views/group-v1423.js and this tile's META example.

import * as PI from '../../lib/pires-interprosthetic-v1423.js';

export default [
  {
    id: 'pires-interprosthetic',
    summary: 'Derives the Pires type of a femur fracture between a hip stem and a knee femoral component on the same side. A stemmed knee component makes it type III; otherwise the nearer implant sets type I or II. Fixation of each implant, and in type III the bone between them, sets the letter A to D. Reliability is low, and the review advises against using the type to guide treatment.',
    compute: PI.piresInterprosthetic,
    fields: [
      { dom: 'pif-stem', arg: 'kneeStem', kind: 'enum', required: true, label: 'Knee femoral component', values: PI.PIF_KNEE_STEM.map((x) => x.value) },
      { dom: 'pif-nearer', arg: 'nearer', kind: 'enum', label: 'Fracture site (needed when the knee component is unstemmed)', values: PI.PIF_NEARER.map((x) => x.value) },
      { dom: 'pif-hip', arg: 'hip', kind: 'enum', required: true, label: 'Hip stem fixation', values: PI.PIF_FIXATION.map((x) => x.value) },
      { dom: 'pif-knee', arg: 'knee', kind: 'enum', required: true, label: 'Knee component fixation', values: PI.PIF_FIXATION.map((x) => x.value) },
      { dom: 'pif-bone', arg: 'bone', kind: 'enum', label: 'Bone between the implants (needed when the knee component is stemmed)', values: PI.PIF_BONE.map((x) => x.value) },
    ],
  },
];
