// spec-v846 MCP adapter: ACC/AHA chronic aortic regurgitation stages in
// lib/aortic-regurgitation-stage-v846.js. The dom keys mirror the browser renderer
// (views/group-v846.js) and META['aortic-regurgitation-stage'].example.
//
// The ventricular args are what split stage C, so pass them whenever the leak is severe.
// Clinical domain.

import { aorticRegurgitationStage } from '../../lib/aortic-regurgitation-stage-v846.js';

export default [
  {
    id: 'aortic-regurgitation-stage',
    summary: 'Applies the ACC/AHA chronic aortic regurgitation stages. A is an at-risk valve with no more than trace regurgitation; B is progressive mild or moderate disease; C is asymptomatic severe (vena contracta above 0.6 cm, volume 60 mL or more, fraction 50 percent or more, orifice 0.30 square cm or more); D is severe with symptoms. STAGE C SPLITS ON THE VENTRICLE, NOT THE VALVE: C1 is an ejection fraction of 55 percent or more with an end-systolic diameter below 50 mm, and C2 is an ejection fraction below 55, a diameter above 50 mm, OR an indexed diameter above 25 mm per square meter.',
    compute: aorticRegurgitationStage,
    fields: [
      { dom: 'ars-vc', arg: 'venaContracta', kind: 'number', required: false, label: 'Vena contracta width', unit: 'cm' },
      { dom: 'ars-rvol', arg: 'regurgitantVolume', kind: 'number', required: false, label: 'Regurgitant volume', unit: 'mL per beat' },
      { dom: 'ars-rf', arg: 'regurgitantFraction', kind: 'number', required: false, label: 'Regurgitant fraction', unit: 'percent' },
      { dom: 'ars-ero', arg: 'regurgitantOrifice', kind: 'number', required: false, label: 'Effective regurgitant orifice area', unit: 'square cm' },
      { dom: 'ars-rev', arg: 'holodiastolicReversal', kind: 'boolean', required: false, label: 'Holodiastolic flow reversal in the proximal descending aorta' },
      { dom: 'ars-lvef', arg: 'ejectionFraction', kind: 'number', required: false, label: 'Left ventricular ejection fraction', unit: 'percent' },
      { dom: 'ars-lvesd', arg: 'endSystolicDiameter', kind: 'number', required: false, label: 'Left ventricular end-systolic diameter', unit: 'mm' },
      { dom: 'ars-lvesdi', arg: 'indexedEndSystolicDiameter', kind: 'number', required: false, label: 'Indexed end-systolic diameter', unit: 'mm per square meter' },
      { dom: 'ars-risk', arg: 'atRiskValve', kind: 'boolean', required: false, label: 'At-risk valve anatomy or previous endocarditis' },
      { dom: 'ars-sx', arg: 'symptoms', kind: 'boolean', required: false, label: 'Symptoms attributable to the regurgitation' },
    ],
  },
];
