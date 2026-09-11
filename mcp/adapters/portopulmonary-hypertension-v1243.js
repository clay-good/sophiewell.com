// spec-v1243: MCP adapter. The dom keys mirror views/group-v1243.js and this tile's META example.
// The wedge pressure is required, not optional: it is the criterion that separates this diagnosis
// from a volume-loaded left heart, and it is the one a summary report most often leaves out.

import { portopulmonaryHypertension } from '../../lib/portopulmonary-hypertension-v1243.js';

export default [
  {
    id: 'portopulmonary-hypertension',
    summary: 'Portopulmonary hypertension is pulmonary arterial hypertension in a patient with portal hypertension. It is defined by three catheter numbers: a raised mean pulmonary artery pressure, a raised pulmonary vascular resistance, and a wedge pressure that is not raised. Two definitions are in use and they disagree at the bottom, so this reports both. The 2004 task force thresholds that most portopulmonary literature was written against are a mean pressure above 25 mmHg and a resistance above 3 Wood units; the 2022 ESC/ERS thresholds are above 20 mmHg and above 2 Wood units, so a patient can meet one and not the other. A raised wedge pressure is the case the criteria exist to catch, because a raised mean pressure with a raised wedge is a volume-loaded left heart rather than this diagnosis, and it is treated in the opposite direction.',
    compute: portopulmonaryHypertension,
    fields: [
      { dom: 'poph-portalHypertension', arg: 'portalHypertension', kind: 'boolean', required: true, label: 'Portal hypertension present' },
      { dom: 'poph-mpap', arg: 'mpap', kind: 'number', required: true, label: 'Mean pulmonary artery pressure (mmHg)' },
      { dom: 'poph-pvrWood', arg: 'pvrWood', kind: 'number', required: true, label: 'Pulmonary vascular resistance (Wood units)' },
      { dom: 'poph-wedge', arg: 'wedge', kind: 'number', required: true, label: 'Pulmonary artery wedge pressure (mmHg)' },
    ],
  },
];
