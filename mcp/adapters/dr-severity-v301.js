// spec-v301 MCP wave: adapter for the diabetic retinopathy severity (ICDR scale)
// in lib/dr-severity-v301.js. The dom keys mirror the browser renderer
// (views/group-v301.js) and META['icdr-retinopathy'].example. Each field is a
// boolean dilated-fundus finding; the compute returns the ICDR grade (1-5) as the
// highest-severity level whose criteria are met. `dr-vb` is required (it is the
// example field); the rest default to false. The `band` carries the "grade 4"
// example, so it round-trips through the default makeToArgs with no custom toArgs.

import * as D from '../../lib/dr-severity-v301.js';

export default [
  {
    id: 'icdr-retinopathy',
    summary: 'Diabetic retinopathy severity, International Clinical Diabetic Retinopathy (ICDR) scale: given the dilated-fundus findings, reports the ICDR grade (1-5) as the highest-severity level whose criteria are met - no apparent retinopathy, mild NPDR (microaneurysms only), moderate NPDR, severe NPDR (the 4-2-1 rule), or proliferative DR (neovascularization or vitreous/preretinal hemorrhage). Reports the classification grade, not a diagnosis or a follow-up plan.',
    compute: D.drSeverityIcdr,
    fields: [
      { dom: 'dr-neo', arg: 'neovascularization', kind: 'bool', required: false, label: 'Neovascularization' },
      { dom: 'dr-vith', arg: 'vitreousHemorrhage', kind: 'bool', required: false, label: 'Vitreous or preretinal hemorrhage' },
      { dom: 'dr-hem421', arg: 'hem4quadrants', kind: 'bool', required: false, label: '>20 intraretinal hemorrhages in each of 4 quadrants' },
      { dom: 'dr-vb', arg: 'venousBeading2', kind: 'bool', required: false, label: 'Venous beading in ≥2 quadrants' },
      { dom: 'dr-irma', arg: 'irma1', kind: 'bool', required: false, label: 'Prominent IRMA in ≥1 quadrant' },
      { dom: 'dr-beyond', arg: 'beyondMicroaneurysms', kind: 'bool', required: false, label: 'Findings beyond microaneurysms (below severe)' },
      { dom: 'dr-ma', arg: 'microaneurysms', kind: 'bool', required: false, label: 'Microaneurysms present' },
    ],
  },
];
