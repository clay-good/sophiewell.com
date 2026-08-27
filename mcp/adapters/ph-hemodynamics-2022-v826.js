// spec-v826 MCP adapter: 2022 ESC/ERS pulmonary hypertension definitions in
// lib/ph-hemodynamics-2022-v826.js. The dom keys mirror the browser renderer
// (views/group-v826.js) and META['ph-hemodynamics-2022'].example. Clinical domain.

import { phHemodynamics2022 } from '../../lib/ph-hemodynamics-2022-v826.js';

export default [
  {
    id: 'ph-hemodynamics-2022',
    summary: 'Classifies right heart catheterisation numbers under the 2022 ESC/ERS definitions. PH is mPAP above 20 mmHg; pre-capillary adds PAWP at or below 15 with PVR above 2 Wood units; a PAWP above 15 gives isolated post-capillary (PVR at or below 2) or combined (PVR above 2). BOTH thresholds fell in 2022, from 25 mmHg and 3 WU, so older figures under-call. PVR is computed from cardiac output when not supplied.',
    compute: phHemodynamics2022,
    fields: [
      { dom: 'phh-mpap', arg: 'mpap', kind: 'number', required: true, label: 'Mean pulmonary arterial pressure, mmHg' },
      { dom: 'phh-pawp', arg: 'pawp', kind: 'number', required: false, label: 'Pulmonary arterial wedge pressure, mmHg' },
      { dom: 'phh-co', arg: 'cardiacOutput', kind: 'number', required: false, label: 'Cardiac output, L/min' },
      { dom: 'phh-pvr', arg: 'pvr', kind: 'number', required: false, label: 'Pulmonary vascular resistance, Wood units' },
    ],
  },
];
