// MCP wave 12: adapters for lib/spine-v146.js — the SINS spinal-instability
// score, the Revised Tokuhashi and Tomita metastatic-spine prognostic scores,
// and the TLICS and SLIC injury-classification scores. dom keys mirror
// views/group-v146.js.

import * as F from '../../lib/spine-v146.js';

export default [
  {
    id: 'sins-score',
    summary: 'Spinal Instability Neoplastic Score (SINS, 0–18) from six components; banded stable (0–6) / indeterminate (7–12) / unstable (13–18).',
    compute: F.sinsScore,
    fields: [
      { dom: 'sins-loc', arg: 'location', kind: 'enum', values: ['junctional', 'mobile', 'semirigid', 'rigid'], required: true, label: 'Spinal location' },
      { dom: 'sins-pain', arg: 'pain', kind: 'enum', values: ['mechanical', 'occasional', 'none'], required: true, label: 'Pain' },
      { dom: 'sins-lesion', arg: 'lesion', kind: 'enum', values: ['lytic', 'mixed', 'blastic'], required: true, label: 'Bone-lesion quality' },
      { dom: 'sins-align', arg: 'alignment', kind: 'enum', values: ['subluxation', 'deformity', 'normal'], required: true, label: 'Radiographic alignment' },
      { dom: 'sins-collapse', arg: 'collapse', kind: 'enum', values: ['over50', 'under50', 'involved', 'none'], required: true, label: 'Vertebral-body collapse' },
      { dom: 'sins-post', arg: 'posterolateral', kind: 'enum', values: ['bilateral', 'unilateral', 'none'], required: true, label: 'Posterolateral involvement' },
    ],
  },
  {
    id: 'tokuhashi-revised',
    summary: 'Revised Tokuhashi Score (0–15) for metastatic-spine prognosis; a lower total is the worse prognosis (0–8 under 6 months, 9–11 ≥ 6 months, 12–15 ≥ 1 year).',
    compute: F.tokuhashiRevised,
    fields: [
      { dom: 'tok-kps', arg: 'general', kind: 'enum', values: ['poor', 'moderate', 'good'], required: true, label: 'General condition (Karnofsky)' },
      { dom: 'tok-bone', arg: 'extraspinalBone', kind: 'enum', values: ['ge3', 'mid', 'zero'], required: true, label: 'Extraspinal bone-metastasis foci' },
      { dom: 'tok-vb', arg: 'vertebralMets', kind: 'enum', values: ['ge3', 'two', 'one'], required: true, label: 'Vertebral-body metastases' },
      { dom: 'tok-organ', arg: 'organMets', kind: 'enum', values: ['unremovable', 'removable', 'none'], required: true, label: 'Major-organ metastases' },
      { dom: 'tok-primary', arg: 'primary', kind: 'enum', values: ['p0', 'p1', 'p2', 'p3', 'p4', 'p5'], required: true, label: 'Primary-tumor site' },
      { dom: 'tok-palsy', arg: 'palsy', kind: 'enum', values: ['complete', 'incomplete', 'none'], required: true, label: 'Palsy (Frankel grade)' },
    ],
  },
  {
    id: 'tomita-score',
    summary: 'Tomita Surgical Strategy Score (2–10) for spinal metastases from primary-tumor grade, visceral metastases, and bone metastases; maps to a surgical goal band.',
    compute: F.tomitaScore,
    fields: [
      { dom: 'tom-primary', arg: 'primary', kind: 'enum', values: ['slow', 'moderate', 'rapid'], required: true, label: 'Primary-tumor grade' },
      { dom: 'tom-visceral', arg: 'visceral', kind: 'enum', values: ['none', 'treatable', 'untreatable'], required: true, label: 'Visceral metastases' },
      { dom: 'tom-bone', arg: 'bone', kind: 'enum', values: ['solitary', 'multiple'], required: true, label: 'Bone metastases' },
    ],
  },
  {
    id: 'tlics-score',
    summary: 'Thoracolumbar Injury Classification and Severity Score (TLICS, 0–10) from injury morphology, neurologic status, and posterior-ligamentous-complex integrity; triage ≤ 3 / 4 / ≥ 5.',
    compute: F.tlicsScore,
    fields: [
      { dom: 'tlics-morph', arg: 'morphology', kind: 'enum', values: ['compression', 'burst', 'translation', 'distraction'], required: true, label: 'Injury morphology' },
      { dom: 'tlics-neuro', arg: 'neuro', kind: 'enum', values: ['intact', 'root', 'complete', 'incomplete', 'cauda'], required: true, label: 'Neurologic status' },
      { dom: 'tlics-plc', arg: 'plc', kind: 'enum', values: ['intact', 'indeterminate', 'disrupted'], required: true, label: 'Posterior ligamentous complex' },
    ],
  },
  {
    id: 'slic-score',
    summary: 'Subaxial Cervical Spine Injury Classification (SLIC, 0–10) from injury morphology, disco-ligamentous-complex integrity, and neurologic status, plus a +1 continuous-compression modifier; triage ≤ 3 / 4 / ≥ 5.',
    compute: F.slicScore,
    fields: [
      { dom: 'slic-morph', arg: 'morphology', kind: 'enum', values: ['none', 'compression', 'burst', 'distraction', 'rotation'], required: true, label: 'Injury morphology' },
      { dom: 'slic-dlc', arg: 'dlc', kind: 'enum', values: ['intact', 'indeterminate', 'disrupted'], required: true, label: 'Disco-ligamentous complex' },
      { dom: 'slic-neuro', arg: 'neuro', kind: 'enum', values: ['intact', 'root', 'complete', 'incomplete'], required: true, label: 'Neurologic status' },
      { dom: 'slic-ongoing', arg: 'continuousCompression', kind: 'bool', required: false, label: 'Continuous cord compression with deficit (+1)' },
    ],
  },
];
