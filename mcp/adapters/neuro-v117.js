// spec-v183 MCP wave 11: adapters for the six lib/neuro-v117.js stroke-imaging
// and thrombolysis-prognosis instruments (ASPECTS, ICH volume by ABC/2, DRAGON,
// HAT, SEDAN, THRIVE). dom keys mirror views/group-v117.js; the compute arg
// names are the verbatim keys that renderer passes. optNum inputs are 'number',
// chk inputs 'bool', and the categorical selects 'enum'. Default makeToArgs
// round-trips every documented example.

import * as F from '../../lib/neuro-v117.js';

export default [
  {
    id: 'aspects',
    summary: 'Alberta Stroke Program Early CT Score (Barber 2000): a 10-point topographic read of early ischemic change on the baseline non-contrast CT; score = 10 minus the affected regions.',
    compute: F.aspects,
    fields: [
      { dom: 'as-c', arg: 'caudate', kind: 'bool', label: 'Caudate' },
      { dom: 'as-l', arg: 'lentiform', kind: 'bool', label: 'Lentiform nucleus' },
      { dom: 'as-ic', arg: 'internalCapsule', kind: 'bool', label: 'Internal capsule' },
      { dom: 'as-i', arg: 'insula', kind: 'bool', label: 'Insular ribbon' },
      { dom: 'as-m1', arg: 'm1', kind: 'bool', label: 'M1 (anterior MCA cortex)' },
      { dom: 'as-m2', arg: 'm2', kind: 'bool', label: 'M2 (MCA cortex lateral to insula)' },
      { dom: 'as-m3', arg: 'm3', kind: 'bool', label: 'M3 (posterior MCA cortex)' },
      { dom: 'as-m4', arg: 'm4', kind: 'bool', label: 'M4 (anterior MCA, superior to M1)' },
      { dom: 'as-m5', arg: 'm5', kind: 'bool', label: 'M5 (lateral MCA, superior to M2)' },
      { dom: 'as-m6', arg: 'm6', kind: 'bool', label: 'M6 (posterior MCA, superior to M3)' },
    ],
  },
  {
    id: 'ich-volume-abc2',
    summary: 'ICH volume by ABC/2 (Kothari 1996): the ellipsoid estimate of intracerebral-hemorrhage volume in mL from three CT dimensions.',
    compute: F.ichVolumeAbc2,
    fields: [
      { dom: 'iv-a', arg: 'a', kind: 'number', required: true, label: 'A: greatest diameter (cm)' },
      { dom: 'iv-b', arg: 'b', kind: 'number', required: true, label: 'B: diameter perpendicular to A (cm)' },
      { dom: 'iv-c', arg: 'c', kind: 'number', required: true, label: 'C: number of slices x slice thickness (cm)' },
    ],
  },
  {
    id: 'dragon-stroke',
    summary: 'DRAGON score (Strbian 2012): predicts functional outcome after IV thrombolysis for anterior-circulation stroke (0-10).',
    compute: F.dragonStroke,
    fields: [
      { dom: 'dr-ct', arg: 'ct', kind: 'enum', values: ['neither', 'either', 'both'], required: true, label: 'Hyperdense MCA sign / early infarct on CT' },
      { dom: 'dr-mrs', arg: 'mrs', kind: 'bool', label: 'Pre-stroke mRS > 1' },
      { dom: 'dr-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'dr-glu', arg: 'glucose', kind: 'bool', label: 'Baseline glucose > 8 mmol/L (>144 mg/dL)' },
      { dom: 'dr-ott', arg: 'onset', kind: 'number', required: true, label: 'Onset-to-treatment time (min)' },
      { dom: 'dr-nihss', arg: 'nihss', kind: 'number', required: true, label: 'Baseline NIHSS' },
    ],
  },
  {
    id: 'hat-score',
    summary: 'Hemorrhage After Thrombolysis (HAT) score (Lou 2008): estimates symptomatic-ICH risk after IV thrombolysis (0-5).',
    compute: F.hatScore,
    fields: [
      { dom: 'ht-nihss', arg: 'nihss', kind: 'number', required: true, label: 'Baseline NIHSS' },
      { dom: 'ht-hypo', arg: 'hypodensity', kind: 'enum', values: ['none', 'third', 'more'], required: true, label: 'Baseline CT hypodensity extent' },
      { dom: 'ht-dm', arg: 'diabetes', kind: 'bool', label: 'History of diabetes or admission glucose > 200 mg/dL' },
    ],
  },
  {
    id: 'sedan-score',
    summary: 'SEDAN score (Strbian 2012): predicts symptomatic intracranial hemorrhage after IV thrombolysis (0-6).',
    compute: F.sedanScore,
    fields: [
      { dom: 'se-glu', arg: 'glucose', kind: 'enum', values: ['low', 'mid', 'high'], required: true, label: 'Baseline blood glucose band' },
      { dom: 'se-early', arg: 'early', kind: 'bool', label: 'Early infarct signs on CT' },
      { dom: 'se-dense', arg: 'dense', kind: 'bool', label: 'Hyperdense cerebral artery sign' },
      { dom: 'se-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'se-nihss', arg: 'nihss', kind: 'number', required: true, label: 'Baseline NIHSS' },
    ],
  },
  {
    id: 'thrive-stroke',
    summary: 'THRIVE score (Flint 2013): predicts good functional outcome and mortality after acute ischemic stroke (0-9).',
    compute: F.thriveStroke,
    fields: [
      { dom: 'tv-nihss', arg: 'nihss', kind: 'number', required: true, label: 'Baseline NIHSS' },
      { dom: 'tv-age', arg: 'age', kind: 'number', required: true, label: 'Age (years)' },
      { dom: 'tv-htn', arg: 'htn', kind: 'bool', label: 'History of hypertension' },
      { dom: 'tv-dm', arg: 'diabetes', kind: 'bool', label: 'History of diabetes' },
      { dom: 'tv-af', arg: 'afib', kind: 'bool', label: 'History of atrial fibrillation' },
    ],
  },
];
