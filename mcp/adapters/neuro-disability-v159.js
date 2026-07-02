// spec-v183 MCP wave 14: adapters for the four lib/neuro-disability-v159.js
// neuro-disability grading tiles. dom keys mirror views/group-v159.js; arg names
// mirror the lib signatures. The mJOA / Nurick ordinal grades and the ASIA
// yes/no gates are enums; the EDSS functional-system scores are numbers.

import * as F from '../../lib/neuro-disability-v159.js';

export default [
  {
    id: 'mjoa',
    summary: 'modified Japanese Orthopaedic Association score (Benzel 1991): upper- and lower-extremity motor, upper-extremity sensory, and sphincter grades → 0–18 cervical-myelopathy severity.',
    compute: F.mjoa,
    fields: [
      { dom: 'mjoa-ue', arg: 'motorUe', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'Motor — upper extremity' },
      { dom: 'mjoa-le', arg: 'motorLe', kind: 'enum', values: ['0', '1', '2', '3', '4', '5', '6', '7'], label: 'Motor — lower extremity' },
      { dom: 'mjoa-sensory', arg: 'sensoryUe', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Sensory — upper extremity' },
      { dom: 'mjoa-sphincter', arg: 'sphincter', kind: 'enum', values: ['0', '1', '2', '3'], label: 'Sphincter / bladder' },
    ],
  },
  {
    id: 'nurick',
    summary: 'Nurick grade (Nurick 1972): a 0–5 cervical-myelopathy disability grade keyed to gait and employment.',
    compute: F.nurick,
    fields: [
      { dom: 'nurick-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], required: true, label: 'Nurick grade' },
    ],
  },
  {
    id: 'asia-impairment',
    summary: 'ASIA Impairment Scale (ISNCSCI): sacral sparing, motor-incomplete status, and a half-of-key-muscles gate map to grade A–E of spinal-cord injury completeness.',
    compute: F.asiaImpairment,
    fields: [
      { dom: 'asia-allnormal', arg: 'allNormal', kind: 'enum', values: ['no', 'yes'], label: 'Motor & sensory normal throughout' },
      { dom: 'asia-sacral', arg: 'sacralSparing', kind: 'enum', values: ['no', 'yes'], label: 'Sacral sparing at S4–S5' },
      { dom: 'asia-motor', arg: 'motorIncomplete', kind: 'enum', values: ['no', 'yes'], label: 'Motor function preserved below the level' },
      { dom: 'asia-half', arg: 'halfGrade3', kind: 'enum', values: ['no', 'yes'], label: '≥ half of key muscles below level grade ≥ 3' },
    ],
  },
  {
    id: 'edss',
    summary: 'Expanded Disability Status Scale (Kurtzke 1983): the ambulation grade with the eight functional-system scores → a 0–10 multiple-sclerosis disability score.',
    compute: F.edss,
    fields: [
      { dom: 'edss-ambulation', arg: 'ambulation', kind: 'enum', values: ['unrestricted', 'walk-300', 'walk-200', 'walk-100', 'unilateral-100', 'bilateral-20', 'wheelchair-5', 'wheelchair-transfer', 'bed-chair-arms', 'bed-some-arms', 'helpless-comm', 'helpless-nocomm', 'death'], label: 'Ambulation' },
      { dom: 'edss-pyramidal', arg: 'pyramidal', kind: 'number', label: 'Pyramidal FS (0–6)' },
      { dom: 'edss-cerebellar', arg: 'cerebellar', kind: 'number', label: 'Cerebellar FS (0–5)' },
      { dom: 'edss-brainstem', arg: 'brainstem', kind: 'number', label: 'Brainstem FS (0–5)' },
      { dom: 'edss-sensory', arg: 'sensory', kind: 'number', label: 'Sensory FS (0–6)' },
      { dom: 'edss-bowelBladder', arg: 'bowelBladder', kind: 'number', label: 'Bowel & bladder FS (0–6)' },
      { dom: 'edss-visual', arg: 'visual', kind: 'number', label: 'Visual FS (0–6)' },
      { dom: 'edss-cerebral', arg: 'cerebral', kind: 'number', label: 'Cerebral FS (0–5)' },
      { dom: 'edss-other', arg: 'other', kind: 'number', label: 'Other FS (0–1)' },
    ],
  },
];
