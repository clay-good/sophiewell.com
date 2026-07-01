// spec-v183 MCP wave 9: adapters for the six flat computations in
// lib/specialtymath-v186.js — radiation-oncology BED/EQD2, echo PISA EROA, LV
// wall stress, Hb/VA-corrected DLCO, VO₂max from a field/treadmill test, and a
// binomial-proportion confidence interval. dom keys mirror views/group-v186.js.

import * as F from '../../lib/specialtymath-v186.js';

export default [
  {
    id: 'bed-eqd2',
    summary: 'Radiobiology conversion: biologically effective dose (BED) and the 2-Gy-equivalent dose (EQD2) for a fractionation schedule, from the linear-quadratic model and the tissue α/β ratio.',
    compute: F.bedEqd2,
    fields: [
      { dom: 'bed-n', arg: 'n', kind: 'number', required: true, label: 'Number of fractions' },
      { dom: 'bed-d', arg: 'd', kind: 'number', required: true, label: 'Dose per fraction', unit: 'Gy' },
      { dom: 'bed-ab', arg: 'ab', kind: 'number', required: true, label: 'α/β ratio', unit: 'Gy' },
    ],
  },
  {
    id: 'pisa-eroa',
    summary: 'Proximal-isovelocity-surface-area (PISA) effective regurgitant orifice area and regurgitant volume for valvular regurgitation.',
    compute: F.pisaEroa,
    fields: [
      { dom: 'pisa-r', arg: 'r', kind: 'number', required: true, label: 'PISA radius', unit: 'cm' },
      { dom: 'pisa-va', arg: 'va', kind: 'number', required: true, label: 'Aliasing velocity', unit: 'cm/s' },
      { dom: 'pisa-vpeak', arg: 'vpeak', kind: 'number', required: true, label: 'Peak regurgitant velocity', unit: 'cm/s' },
      { dom: 'pisa-vti', arg: 'vti', kind: 'number', required: true, label: 'Regurgitant-jet VTI', unit: 'cm' },
    ],
  },
  {
    id: 'lv-wall-stress',
    summary: 'Left-ventricular meridional wall stress (Laplace): pressure × radius ÷ (2 × wall thickness), the afterload term behind wall-thinning geometry.',
    compute: F.lvWallStress,
    fields: [
      { dom: 'lvws-p', arg: 'p', kind: 'number', required: true, label: 'LV pressure', unit: 'mmHg' },
      { dom: 'lvws-r', arg: 'r', kind: 'number', required: true, label: 'LV internal radius', unit: 'cm' },
      { dom: 'lvws-h', arg: 'h', kind: 'number', required: true, label: 'Wall thickness', unit: 'cm' },
    ],
  },
  {
    id: 'dlco-correction',
    summary: 'Hemoglobin- and alveolar-volume-corrected DLCO (ATS/ERS): the anemia/polycythemia correction plus KCO (DLCO ÷ VA).',
    compute: F.dlcoCorrection,
    fields: [
      { dom: 'dlco-dlco', arg: 'dlco', kind: 'number', required: true, label: 'Measured DLCO', unit: 'mL/min/mmHg' },
      { dom: 'dlco-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'dlco-va', arg: 'va', kind: 'number', required: true, label: 'Alveolar volume VA', unit: 'L' },
      { dom: 'dlco-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
    ],
  },
  {
    id: 'vo2max-exercise',
    summary: 'Estimated VO₂max from an exercise test: the Bruce treadmill-time regression or the Cooper 12-minute-distance equation.',
    compute: F.vo2maxExercise,
    fields: [
      { dom: 'vo2-method', arg: 'method', kind: 'enum', values: ['bruce', 'cooper'], required: true, label: 'Method' },
      { dom: 'vo2-time', arg: 'time', kind: 'number', required: false, label: 'Treadmill time to exhaustion (Bruce)', unit: 'min' },
      { dom: 'vo2-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: false, label: 'Sex (Bruce)' },
      { dom: 'vo2-distance', arg: 'distance', kind: 'number', required: false, label: '12-minute distance (Cooper)', unit: 'm' },
    ],
  },
  {
    id: 'proportion-ci',
    summary: 'Wilson-score confidence interval for a binomial proportion (events ÷ n) at a 90/95/99% level — the small-sample-honest interval for a rate.',
    compute: F.proportionCi,
    fields: [
      { dom: 'prop-events', arg: 'events', kind: 'number', required: true, label: 'Number of events' },
      { dom: 'prop-n', arg: 'n', kind: 'number', required: true, label: 'Sample size n' },
      { dom: 'prop-level', arg: 'level', kind: 'enum', values: ['90', '95', '99'], required: false, label: 'Confidence level' },
    ],
  },
];
