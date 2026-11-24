// spec-v183 MCP wave: adapters for the four ophthalmology / refractive
// calculators in lib/ophtho-v236.js — the spherical equivalent, the vertex-
// distance power conversion, the percent tissue altered (LASIK ectasia risk),
// and the Randleman Ectasia Risk Score System. dom keys mirror
// views/group-v236.js; all inputs are numeric (topography grade is a 0/2/3/4 select).

import * as F from '../../lib/ophtho-v236.js';

export default [
  {
    id: 'spherical-equivalent',
    summary: 'Spherical equivalent = sphere + cylinder / 2 (the axis is dropped); lands the eye at the circle of least confusion.',
    compute: F.sphericalEquivalent,
    fields: [
      { dom: 'se-sph', arg: 'sphere', kind: 'number', required: true, label: 'Sphere', unit: 'D', bound: 'platelets', boundScale: 0.01 },
      { dom: 'se-cyl', arg: 'cylinder', kind: 'number', required: true, label: 'Cylinder', unit: 'D' },
    ],
  },
  {
    id: 'vertex-distance',
    summary: 'Vertex-corrected power = Fs / (1 - d·Fs), converting spectacle-plane power to the corneal plane; clinically significant beyond about +/- 4 D.',
    compute: F.vertexDistance,
    fields: [
      { dom: 'vx-power', arg: 'power', kind: 'number', required: true, label: 'Spectacle-plane power', unit: 'D' },
      { dom: 'vx-mm', arg: 'vertexMm', kind: 'number', required: true, label: 'Vertex distance', unit: 'mm', max: 30 },
    ],
  },
  {
    id: 'percent-tissue-altered',
    summary: 'Percent tissue altered (Santhiago 2014) = (flap thickness + ablation depth) / central corneal thickness x 100; PTA >= 40% is the strongest single predictor of post-LASIK ectasia.',
    compute: F.percentTissueAltered,
    fields: [
      { dom: 'pta-flap', arg: 'flap', kind: 'number', required: true, label: 'Flap thickness', unit: 'um', min: 1, max: 400 },
      { dom: 'pta-abl', arg: 'ablation', kind: 'number', required: true, label: 'Ablation depth', unit: 'um', bound: 'platelets', boundScale: 0.1 },
      { dom: 'pta-cct', arg: 'cct', kind: 'number', required: true, label: 'Central corneal thickness', unit: 'um', bound: 'qtMs' },
    ],
  },
  {
    id: 'randleman-erss',
    summary: 'Randleman Ectasia Risk Score System (Randleman 2008): topography + residual stromal bed + age + corneal thickness + MRSE myopia magnitude; 0-2 low, 3 moderate, >= 4 high risk of post-LASIK ectasia.',
    compute: F.randlemanErss,
    fields: [
      { dom: 'er-topo', arg: 'topo', kind: 'number', required: true, label: 'Topography grade (0-4)', values: ['0', '2', '3', '4'] },
      { dom: 'er-rsb', arg: 'rsb', kind: 'number', required: true, label: 'Residual stromal bed', unit: 'um', min: 100, max: 500 },
      { dom: 'er-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years', min: 10, max: 90 },
      { dom: 'er-cct', arg: 'cct', kind: 'number', required: true, label: 'Central corneal thickness', unit: 'um', bound: 'qtMs' },
      { dom: 'er-mrse', arg: 'mrse', kind: 'number', required: true, label: 'Manifest refraction spherical equivalent', unit: 'D' },
    ],
  },
];
