// spec-v848 MCP adapter: ACC/AHA tricuspid regurgitation stages in
// lib/tricuspid-regurgitation-stage-v848.js. The dom keys mirror the browser renderer
// (views/group-v848.js) and META['tricuspid-regurgitation-stage'].example.
//
// Every threshold here is the TRICUSPID one and differs from the left-sided valves.
// Clinical domain.

import { tricuspidRegurgitationStage } from '../../lib/tricuspid-regurgitation-stage-v848.js';

export default [
  {
    id: 'tricuspid-regurgitation-stage',
    summary: 'Applies the ACC/AHA tricuspid regurgitation stages. A is an at-risk valve with no more than trace regurgitation; B is progressive mild or moderate disease; C is asymptomatic severe (jet area 10 square cm or more, vena contracta 0.7 cm or more, orifice 0.40 square cm or more, or volume 45 mL or more); D is the same with right heart failure. THE THRESHOLDS ARE VALVE-SPECIFIC: severe volume is 45 mL here but 60 on the mitral and aortic valves, and the orifice is 0.40 here and on the mitral valve but 0.30 on the aortic. There is no C1/C2 split on this valve.',
    compute: tricuspidRegurgitationStage,
    fields: [
      { dom: 'trs-jet', arg: 'jetArea', kind: 'number', required: false, label: 'Jet area, severe at 10 or more', unit: 'square cm' },
      { dom: 'trs-vc', arg: 'venaContracta', kind: 'number', required: false, label: 'Vena contracta width, severe at 0.7 or more', unit: 'cm' },
      { dom: 'trs-ero', arg: 'regurgitantOrifice', kind: 'number', required: false, label: 'Effective regurgitant orifice area, severe at 0.40 or more', unit: 'square cm' },
      { dom: 'trs-rvol', arg: 'regurgitantVolume', kind: 'number', required: false, label: 'Regurgitant volume, severe at 45 or more', unit: 'mL per beat' },
      { dom: 'trs-hv', arg: 'hepaticVeinReversal', kind: 'boolean', required: false, label: 'Systolic flow reversal in the hepatic veins' },
      { dom: 'trs-mech', arg: 'mechanism', kind: 'enum', values: ['secondary', 'primary'], required: false, label: 'Mechanism: secondary (normal valve pulled open) or primary (abnormal valve)' },
      { dom: 'trs-risk', arg: 'atRiskValve', kind: 'boolean', required: false, label: 'At-risk valve: leaflet abnormality, annular dilation, right-sided remodeling or a lead' },
      { dom: 'trs-sx', arg: 'symptoms', kind: 'boolean', required: false, label: 'Signs of right heart failure' },
    ],
  },
];
