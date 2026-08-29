// spec-v849 MCP adapter: ACC/AHA chronic SECONDARY mitral regurgitation stages in
// lib/secondary-mitral-regurgitation-stage-v849.js. The dom keys mirror the browser renderer
// (views/group-v849.js) and META['secondary-mitral-regurgitation-stage'].example.
//
// SECONDARY regurgitation only. A leak from an abnormal valve is primary disease and goes to
// mitral-regurgitation-stage. Clinical domain.

import { secondaryMitralRegurgitationStage } from '../../lib/secondary-mitral-regurgitation-stage-v849.js';

export default [
  {
    id: 'secondary-mitral-regurgitation-stage',
    summary: 'Applies the ACC/AHA chronic SECONDARY mitral regurgitation stages. A is coronary disease or cardiomyopathy with a structurally normal valve and no more than a small central jet; B is progressive (orifice below 0.40 square cm, volume below 60 mL, fraction below 50 percent); C is asymptomatic severe at or above those numbers; D is severe with heart failure symptoms that PERSIST after revascularization and optimized medical therapy. THE 2014 GUIDELINE SET SEVERE AT 0.20 SQUARE CM AND 30 mL; the 2017 focused update moved those lines to 0.40 and 60. There is no C1 or C2 split on this table. These criteria do NOT apply to primary regurgitation.',
    compute: secondaryMitralRegurgitationStage,
    fields: [
      { dom: 'smr-ero', arg: 'regurgitantOrifice', kind: 'number', required: false, label: 'Effective regurgitant orifice area, severe at 0.40 or more', unit: 'square cm' },
      { dom: 'smr-rvol', arg: 'regurgitantVolume', kind: 'number', required: false, label: 'Regurgitant volume, severe at 60 or more', unit: 'mL per beat' },
      { dom: 'smr-rf', arg: 'regurgitantFraction', kind: 'number', required: false, label: 'Regurgitant fraction, severe at 50 or more', unit: 'percent' },
      { dom: 'smr-lvef', arg: 'ejectionFraction', kind: 'number', required: false, label: 'Left ventricular ejection fraction', unit: 'percent' },
      { dom: 'smr-sub', arg: 'substrate', kind: 'boolean', required: false, label: 'Coronary disease or cardiomyopathy with a structurally normal valve' },
      { dom: 'smr-small', arg: 'smallJet', kind: 'boolean', required: false, label: 'No more than a small central jet: vena contracta below 0.30 cm' },
      { dom: 'smr-sx', arg: 'symptoms', kind: 'boolean', required: false, label: 'Heart failure symptoms' },
      { dom: 'smr-tx', arg: 'therapyOptimized', kind: 'boolean', required: false, label: 'Symptoms persist after revascularization and optimized medical therapy' },
    ],
  },
];
