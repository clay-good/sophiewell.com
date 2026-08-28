// spec-v844 MCP adapter: ACC/AHA aortic stenosis stages in lib/aortic-stenosis-stage-v844.js.
// The dom keys mirror the browser renderer (views/group-v844.js) and
// META['aortic-stenosis-stage'].example.
//
// Only the velocity or the gradient is required; the area, ejection fraction and stroke
// volume index are what tell the low-gradient severe patterns apart from moderate stenosis.
// Clinical domain.

import { aorticStenosisStage } from '../../lib/aortic-stenosis-stage-v844.js';

export default [
  {
    id: 'aortic-stenosis-stage',
    summary: 'Applies the ACC/AHA aortic stenosis stages. A is at risk below 2.0 m/s; B is progressive (mild 2.0 to 2.9, moderate 3.0 to 3.9 or a gradient of 20 to 39); C is asymptomatic severe at 4.0 m/s or a gradient of 40, split by ejection fraction; D is symptomatic severe, as D1 at a high gradient, D2 at a low flow with a reduced ejection fraction and D3 at a low gradient with a normal one. A LOW GRADIENT DOES NOT EXCLUDE SEVERE STENOSIS: D2 and D3 sit below 4 m/s and below 40 mmHg, so a gradient-only reading calls both moderate.',
    compute: aorticStenosisStage,
    fields: [
      { dom: 'ass-vmax', arg: 'peakVelocity', kind: 'number', required: false, label: 'Peak aortic velocity', unit: 'm/s' },
      { dom: 'ass-mg', arg: 'meanGradient', kind: 'number', required: false, label: 'Mean transaortic gradient', unit: 'mmHg' },
      { dom: 'ass-ava', arg: 'valveArea', kind: 'number', required: false, label: 'Aortic valve area', unit: 'square cm' },
      { dom: 'ass-avai', arg: 'indexedValveArea', kind: 'number', required: false, label: 'Indexed aortic valve area', unit: 'square cm per square meter' },
      { dom: 'ass-lvef', arg: 'ejectionFraction', kind: 'number', required: false, label: 'Left ventricular ejection fraction', unit: 'percent' },
      { dom: 'ass-svi', arg: 'strokeVolumeIndex', kind: 'number', required: false, label: 'Stroke volume index', unit: 'mL per square meter' },
      { dom: 'ass-sx', arg: 'symptoms', kind: 'boolean', required: false, label: 'Symptoms attributable to the stenosis' },
    ],
  },
];
