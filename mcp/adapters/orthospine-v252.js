// spec-v183 MCP wave: adapters for the four orthopedic / spine ratios & scores in
// lib/orthospine-v252.js — the Insall-Salvati ratio, the Torg-Pavlov ratio, the
// Meyerding spondylolisthesis grade, and the Beighton hypermobility score. dom
// keys mirror views/group-v252.js.

import * as F from '../../lib/orthospine-v252.js';

export default [
  {
    id: 'insall-salvati-ratio',
    summary: 'Insall-Salvati ratio (1971) = patellar-tendon length / patellar-bone length; normal 0.8-1.2, < 0.8 patella baja, > 1.2 patella alta.',
    compute: F.insallSalvati,
    fields: [
      { dom: 'is-tendon', arg: 'tendon', kind: 'number', required: true, label: 'Patellar-tendon length', unit: 'mm' },
      { dom: 'is-patella', arg: 'patella', kind: 'number', required: true, label: 'Patellar-bone length', unit: 'mm' },
    ],
  },
  {
    id: 'torg-pavlov-ratio',
    summary: 'Torg-Pavlov ratio (1987) = sagittal spinal-canal diameter / vertebral-body diameter on a lateral cervical radiograph; <= 0.8 indicates developmental cervical canal stenosis.',
    compute: F.torgPavlov,
    fields: [
      { dom: 'tp-canal', arg: 'canal', kind: 'number', required: true, label: 'Spinal-canal sagittal diameter', unit: 'mm' },
      { dom: 'tp-body', arg: 'body', kind: 'number', required: true, label: 'Vertebral-body sagittal diameter', unit: 'mm' },
    ],
  },
  {
    id: 'meyerding-spondylolisthesis',
    summary: 'Meyerding grade (1932): percent anterior slip = (anterior displacement / caudal-endplate AP width) x 100; grades I-V by 25% bands.',
    compute: F.meyerdingSpondylolisthesis,
    fields: [
      { dom: 'my-disp', arg: 'displacement', kind: 'number', required: true, label: 'Anterior displacement', unit: 'mm' },
      { dom: 'my-width', arg: 'width', kind: 'number', required: true, label: 'Caudal-endplate AP width', unit: 'mm' },
    ],
  },
  {
    id: 'beighton-hypermobility',
    summary: 'Beighton hypermobility score (1973): nine passive manoeuvres scored 0-9; >= 5 in adults suggests generalized joint hypermobility.',
    compute: F.beightonHypermobility,
    fields: [
      { dom: 'bg-f5r', arg: 'finger5R', kind: 'bool', required: true, label: 'Right 5th finger dorsiflexes > 90 deg' },
      { dom: 'bg-f5l', arg: 'finger5L', kind: 'bool', required: true, label: 'Left 5th finger dorsiflexes > 90 deg' },
      { dom: 'bg-thr', arg: 'thumbR', kind: 'bool', required: true, label: 'Right thumb to forearm' },
      { dom: 'bg-thl', arg: 'thumbL', kind: 'bool', required: true, label: 'Left thumb to forearm' },
      { dom: 'bg-elr', arg: 'elbowR', kind: 'bool', required: true, label: 'Right elbow hyperextends > 10 deg' },
      { dom: 'bg-ell', arg: 'elbowL', kind: 'bool', required: false, label: 'Left elbow hyperextends > 10 deg' },
      { dom: 'bg-knr', arg: 'kneeR', kind: 'bool', required: false, label: 'Right knee hyperextends > 10 deg' },
      { dom: 'bg-knl', arg: 'kneeL', kind: 'bool', required: false, label: 'Left knee hyperextends > 10 deg' },
      { dom: 'bg-palm', arg: 'palms', kind: 'bool', required: false, label: 'Palms flat on floor, knees straight' },
    ],
  },
];
