// spec-v845 MCP adapter: ACC/AHA mitral stenosis stages in lib/mitral-stenosis-stage-v845.js.
// The dom keys mirror the browser renderer (views/group-v845.js) and
// META['mitral-stenosis-stage'].example.
//
// meanGradient and heartRate are accepted and reported on, but they do NOT set the stage.
// Clinical domain.

import { mitralStenosisStage } from '../../lib/mitral-stenosis-stage-v845.js';

export default [
  {
    id: 'mitral-stenosis-stage',
    summary: 'Applies the ACC/AHA rheumatic mitral stenosis stages. A is valve doming without commissural fusion; B is progressive, with fusion, an area above 1.5 square cm and a half-time below 150 ms; C is asymptomatic severe at an area of 1.5 square cm or less OR a half-time of 150 ms or more; D is the same with symptoms. Very severe is an area of 1.0 or less or a half-time of 220 or more. THE MEAN GRADIENT DOES NOT GRADE MITRAL STENOSIS: it rises with heart rate and cardiac output, and is accepted here only to be reported alongside.',
    compute: mitralStenosisStage,
    fields: [
      { dom: 'mvs-mva', arg: 'valveArea', kind: 'number', required: false, label: 'Mitral valve area', unit: 'square cm' },
      { dom: 'mvs-pht', arg: 'pressureHalfTime', kind: 'number', required: false, label: 'Diastolic pressure half-time', unit: 'ms' },
      { dom: 'mvs-anat', arg: 'anatomy', kind: 'enum', values: ['doming', 'fusion'], required: false, label: 'Rheumatic changes: doming only, or commissural fusion' },
      { dom: 'mvs-mg', arg: 'meanGradient', kind: 'number', required: false, label: 'Mean mitral gradient, recorded but not used to stage', unit: 'mmHg' },
      { dom: 'mvs-hr', arg: 'heartRate', kind: 'number', required: false, label: 'Heart rate, for reading the gradient', unit: 'beats per minute' },
      { dom: 'mvs-sx', arg: 'symptoms', kind: 'boolean', required: false, label: 'Reduced exercise tolerance or exertional breathlessness' },
    ],
  },
];
