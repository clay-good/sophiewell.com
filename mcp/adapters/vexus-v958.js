// spec-v958 MCP adapter: the VExUS grade in lib/vexus-v958.js. The dom keys mirror the browser
// renderer (views/group-v958.js) and META['vexus'].example.
//
// The three Doppler arguments take a classification a sonographer has already made, not an
// image. Clinical domain.

import { vexusGrade } from '../../lib/vexus-v958.js';

export default [
  {
    id: 'vexus',
    summary: 'Grades systemic venous congestion from bedside ultrasound: the VExUS grade, 0 to 3, read from the maximal IVC diameter plus the Doppler waveform in the hepatic, portal and intrarenal veins. IVC under 2 cm is Grade 0. At or above 2 cm the grade is set by how many territories are SEVERELY abnormal: none is Grade 1, one is Grade 2, two or more is Grade 3. Severe means a reversed systolic component in the hepatic vein, a portal velocity variation of 50% or more, or an intrarenal trace discontinuous with only a diastolic phase. MILD FINDINGS DO NOT RAISE THE GRADE: the prototype that performed counts severe patterns only, so three mild waveforms with a dilated IVC read the same as three normal ones. A DILATED IVC ALONE IS NOT CONGESTION -- the derivation measured it at 41% specificity. Grade 3 is specific rather than sensitive, so a low grade is not evidence against congestion. Derived in 145 adults after cardiac surgery to predict acute kidney injury; not a volume-status meter.',
    compute: vexusGrade,
    fields: [
      { dom: 'vx-ivc', arg: 'ivcDiameterCm', kind: 'number', required: true, label: 'Maximal IVC diameter', unit: 'cm' },
      { dom: 'vx-hepatic', arg: 'hepaticVein', kind: 'enum', required: true, label: 'Hepatic vein Doppler', values: ['normal', 'mild', 'severe'] },
      { dom: 'vx-portal', arg: 'portalVein', kind: 'enum', required: true, label: 'Portal vein Doppler', values: ['normal', 'mild', 'severe'] },
      { dom: 'vx-renal', arg: 'intrarenalVein', kind: 'enum', required: true, label: 'Intrarenal vein Doppler', values: ['normal', 'mild', 'severe'] },
    ],
  },
];
