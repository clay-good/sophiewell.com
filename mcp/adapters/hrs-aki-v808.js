// spec-v808 MCP adapter: 2024 ADQI/ICA HRS-AKI criteria in lib/hrs-aki-v808.js.
// The dom keys mirror the browser renderer (views/group-v808.js) and META['hrs-aki'].example.
// Four required booleans, plus three findings that are recorded and deliberately do NOT
// exclude the diagnosis. Clinical domain.

import { hrsAki } from '../../lib/hrs-aki-v808.js';

export default [
  {
    id: 'hrs-aki',
    summary: 'Applies the 2024 ADQI/ICA criteria for hepatorenal syndrome with acute kidney injury. All four are required: cirrhosis with ascites; an AKI by the creatinine or urine-output definition; no improvement within 24 h of adequate volume resuscitation; and no strong evidence of an alternative primary cause. Two changes from the 2015 rule: the 48-hour albumin challenge is NO LONGER a prerequisite, and proteinuria, microhematuria and abnormal renal ultrasound NO LONGER exclude the diagnosis.',
    compute: hrsAki,
    fields: [
      { dom: 'hrs-cirrhosis', arg: 'cirrhosisWithAscites', kind: 'boolean', required: false, label: 'Cirrhosis with ascites' },
      { dom: 'hrs-aki', arg: 'akiPresent', kind: 'boolean', required: false, label: 'AKI by creatinine or urine output' },
      { dom: 'hrs-novolume', arg: 'noImprovementAfterVolume', kind: 'boolean', required: false, label: 'No improvement after volume' },
      { dom: 'hrs-noalt', arg: 'noAlternativeCause', kind: 'boolean', required: false, label: 'No alternative primary cause' },
      { dom: 'hrs-protein', arg: 'proteinuria', kind: 'boolean', required: false, label: 'Proteinuria (does not exclude)' },
      { dom: 'hrs-heme', arg: 'microhematuria', kind: 'boolean', required: false, label: 'Microhematuria (does not exclude)' },
      { dom: 'hrs-us', arg: 'abnormalUltrasound', kind: 'boolean', required: false, label: 'Abnormal ultrasound (does not exclude)' },
    ],
  },
];
