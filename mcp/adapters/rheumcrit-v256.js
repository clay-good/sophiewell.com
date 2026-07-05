// spec-v183 MCP wave: adapters for the rheumatology + critical-care tools in
// lib/rheumcrit-v256.js — the MASES enthesitis score, the Manual Muscle Testing-8
// (MMT-8), the Intubation Difficulty Scale (IDS), and the CROP weaning index. dom
// keys mirror views/group-v256.js.

import * as F from '../../lib/rheumcrit-v256.js';

export default [
  {
    id: 'mases-enthesitis',
    summary: 'MASES enthesitis score (Heuft-Dorenbosch 2003): 13 entheseal sites each tender (1) or non-tender (0); total 0-13 and >= 1 indicates enthesitis.',
    compute: F.masesEnthesitis,
    fields: [
      { dom: 'ma-cc1r', arg: 'cc1R', kind: 'bool', required: true, label: '1st costochondral (R)' },
      { dom: 'ma-cc1l', arg: 'cc1L', kind: 'bool', required: true, label: '1st costochondral (L)' },
      { dom: 'ma-cc7r', arg: 'cc7R', kind: 'bool', required: false, label: '7th costochondral (R)' },
      { dom: 'ma-cc7l', arg: 'cc7L', kind: 'bool', required: false, label: '7th costochondral (L)' },
      { dom: 'ma-psisr', arg: 'psisR', kind: 'bool', required: true, label: 'Posterior superior iliac spine (R)' },
      { dom: 'ma-psisl', arg: 'psisL', kind: 'bool', required: false, label: 'Posterior superior iliac spine (L)' },
      { dom: 'ma-asisr', arg: 'asisR', kind: 'bool', required: false, label: 'Anterior superior iliac spine (R)' },
      { dom: 'ma-asisl', arg: 'asisL', kind: 'bool', required: false, label: 'Anterior superior iliac spine (L)' },
      { dom: 'ma-ilr', arg: 'iliacR', kind: 'bool', required: false, label: 'Iliac crest (R)' },
      { dom: 'ma-ill', arg: 'iliacL', kind: 'bool', required: false, label: 'Iliac crest (L)' },
      { dom: 'ma-achr', arg: 'achillesR', kind: 'bool', required: false, label: 'Proximal Achilles (R)' },
      { dom: 'ma-achl', arg: 'achillesL', kind: 'bool', required: false, label: 'Proximal Achilles (L)' },
      { dom: 'ma-l5', arg: 'l5', kind: 'bool', required: false, label: 'L5 spinous process' },
    ],
  },
  {
    id: 'mmt8-myositis',
    summary: 'Manual Muscle Testing-8 (IMACS myositis core measure): 8 muscle groups each graded 0-10 on the Kendall scale; total 0-80, higher = stronger.',
    compute: F.mmt8,
    fields: [
      { dom: 'mm-neck', arg: 'neck', kind: 'number', required: true, label: 'Neck flexors (0-10)' },
      { dom: 'mm-delt', arg: 'deltoid', kind: 'number', required: true, label: 'Deltoid (middle) (0-10)' },
      { dom: 'mm-bic', arg: 'biceps', kind: 'number', required: true, label: 'Biceps (0-10)' },
      { dom: 'mm-wrist', arg: 'wrist', kind: 'number', required: true, label: 'Wrist extensors (0-10)' },
      { dom: 'mm-gmax', arg: 'glutMax', kind: 'number', required: true, label: 'Gluteus maximus (0-10)' },
      { dom: 'mm-gmed', arg: 'glutMed', kind: 'number', required: true, label: 'Gluteus medius (0-10)' },
      { dom: 'mm-quad', arg: 'quad', kind: 'number', required: true, label: 'Quadriceps (0-10)' },
      { dom: 'mm-ankle', arg: 'ankle', kind: 'number', required: true, label: 'Ankle dorsiflexors (0-10)' },
    ],
  },
  {
    id: 'intubation-difficulty-scale',
    summary: 'Intubation Difficulty Scale (Adnet 1997): sums N1-N7 (extra attempts, extra operators, alternative techniques, Cormack-Lehane grade - 1, lifting force, laryngeal pressure, cord adduction); 0 easy, 1-5 moderate, > 5 difficult.',
    compute: F.intubationDifficultyScale,
    fields: [
      { dom: 'ids-attempts', arg: 'extraAttempts', kind: 'number', required: true, label: 'Attempts beyond the first (N1)' },
      { dom: 'ids-operators', arg: 'extraOperators', kind: 'number', required: false, label: 'Operators beyond the first (N2)' },
      { dom: 'ids-tech', arg: 'altTechniques', kind: 'number', required: false, label: 'Alternative techniques used (N3)' },
      { dom: 'ids-cormack', arg: 'cormack', kind: 'number', required: true, label: 'Cormack-Lehane grade (N4 = grade - 1)' },
      { dom: 'ids-force', arg: 'liftingForce', kind: 'bool', required: false, label: 'Increased lifting force required (N5)' },
      { dom: 'ids-pressure', arg: 'laryngealPressure', kind: 'bool', required: false, label: 'External laryngeal pressure applied (N6)' },
      { dom: 'ids-cords', arg: 'cordsAdducted', kind: 'bool', required: false, label: 'Vocal cords adducted / closed (N7)' },
    ],
  },
  {
    id: 'crop-index',
    summary: 'CROP weaning index (Yang & Tobin 1991) = [dynamic compliance x PImax x (PaO2 / PAO2)] / respiratory rate; an index >= 13 mL/breath/min favors successful extubation.',
    compute: F.cropIndex,
    fields: [
      { dom: 'crop-cdyn', arg: 'compliance', kind: 'number', required: true, label: 'Dynamic compliance', unit: 'mL/cmH2O' },
      { dom: 'crop-pimax', arg: 'pimax', kind: 'number', required: true, label: 'Maximal inspiratory pressure PImax (magnitude)', unit: 'cmH2O' },
      { dom: 'crop-pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'mmHg' },
      { dom: 'crop-fio2', arg: 'fio2', kind: 'number', required: true, label: 'FiO2 (fraction, 0.21-1.0)' },
      { dom: 'crop-paco2', arg: 'paco2', kind: 'number', required: true, label: 'PaCO2', unit: 'mmHg' },
      { dom: 'crop-rr', arg: 'rr', kind: 'number', required: true, label: 'Respiratory rate', unit: 'breaths/min' },
    ],
  },
];
