// spec-v657 MCP adapter: ISGLS post-hepatectomy liver failure grade in
// lib/isgls-phlf-v657.js. The dom keys mirror the browser renderer (views/group-v657.js)
// and META['isgls-phlf'].example. A decision-logic classifier: the lab gate (required
// bool) gates PHLF; then invasive treatment -> Grade C, else a management deviation ->
// Grade B, else Grade A. Clinical domain.

import { isglsPhlf } from '../../lib/isgls-phlf-v657.js';

export default [
  {
    id: 'isgls-phlf',
    summary: 'ISGLS grading of post-hepatectomy liver failure (PHLF). Gate: increased INR (or FFP need) and hyperbilirubinemia on/after POD 5. Grade C = requires invasive treatment; Grade B = deviation managed without invasive treatment; Grade A = abnormal labs, no management change.',
    compute: isglsPhlf,
    fields: [
      { dom: 'phlf-gate', arg: 'labGate', kind: 'bool', required: true, label: 'Increased INR (or FFP need) AND hyperbilirubinemia on/after POD 5 (rising if abnormal preop) — the PHLF gate' },
      { dom: 'phlf-c', arg: 'invasiveTreatment', kind: 'bool', required: false, label: 'Requires invasive treatment: hemodialysis/RRT, mechanical ventilation, vasopressors, rescue hepatectomy or salvage transplant (Grade C)' },
      { dom: 'phlf-b', arg: 'managementDeviation', kind: 'bool', required: false, label: 'Deviation managed without invasive treatment: FFP, albumin, diuretics, non-invasive ventilation, or ICU admission alone (Grade B)' },
    ],
  },
];
