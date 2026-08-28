// spec-v847 MCP adapter: ACC/AHA chronic PRIMARY mitral regurgitation stages in
// lib/mitral-regurgitation-stage-v847.js. The dom keys mirror the browser renderer
// (views/group-v847.js) and META['mitral-regurgitation-stage'].example.
//
// PRIMARY regurgitation only. Do not pass a secondary leak to this tool; it is staged
// against its own criteria. Clinical domain.

import { mitralRegurgitationStage } from '../../lib/mitral-regurgitation-stage-v847.js';

export default [
  {
    id: 'mitral-regurgitation-stage',
    summary: 'Applies the ACC/AHA chronic PRIMARY mitral regurgitation stages. A is an at-risk valve; B is progressive (vena contracta below 0.7 cm, volume below 60 mL, fraction below 50 percent, orifice below 0.40 square cm); C is asymptomatic severe at or above those numbers; D is severe with symptoms. C1 is an ejection fraction ABOVE 60 percent with a dimension below 40 mm, and C2 is 60 percent or less OR 40 mm or more. AN EJECTION FRACTION OF 60 PERCENT IS ALREADY DYSFUNCTION HERE, not the usual 50: the leak unloads the ventricle, so the measured fraction flatters it. These criteria do NOT apply to secondary regurgitation.',
    compute: mitralRegurgitationStage,
    fields: [
      { dom: 'mrs-vc', arg: 'venaContracta', kind: 'number', required: false, label: 'Vena contracta width', unit: 'cm' },
      { dom: 'mrs-rvol', arg: 'regurgitantVolume', kind: 'number', required: false, label: 'Regurgitant volume', unit: 'mL per beat' },
      { dom: 'mrs-rf', arg: 'regurgitantFraction', kind: 'number', required: false, label: 'Regurgitant fraction', unit: 'percent' },
      { dom: 'mrs-ero', arg: 'regurgitantOrifice', kind: 'number', required: false, label: 'Effective regurgitant orifice area', unit: 'square cm' },
      { dom: 'mrs-lvef', arg: 'ejectionFraction', kind: 'number', required: false, label: 'Left ventricular ejection fraction', unit: 'percent' },
      { dom: 'mrs-lvesd', arg: 'endSystolicDimension', kind: 'number', required: false, label: 'Left ventricular end-systolic dimension', unit: 'mm' },
      { dom: 'mrs-risk', arg: 'atRiskValve', kind: 'boolean', required: false, label: 'At-risk valve: mild prolapse, leaflet thickening, or previous endocarditis' },
      { dom: 'mrs-sx', arg: 'symptoms', kind: 'boolean', required: false, label: 'Symptoms attributable to the regurgitation' },
    ],
  },
];
