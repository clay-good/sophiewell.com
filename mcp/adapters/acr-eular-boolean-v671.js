// spec-v671 MCP adapter: ACR/EULAR Boolean-based RA remission in
// lib/acr-eular-boolean-v671.js. The dom keys mirror the browser renderer
// (views/group-v671.js) and META['acr-eular-boolean'].example. Four numeric inputs
// (TJC28, SJC28, CRP mg/dL, PtGA 0-10); a strict AND of four thresholds yields the
// 2011 and 2022 Boolean 2.0 remission verdicts. Clinical domain.

import { acrEularBoolean } from '../../lib/acr-eular-boolean-v671.js';

export default [
  {
    id: 'acr-eular-boolean',
    summary: 'ACR/EULAR Boolean-based remission for rheumatoid arthritis (Felson 2011; 2022 revision): a strict AND requiring TJC28 <= 1, SJC28 <= 1, CRP <= 1 mg/dL (= 10 mg/L), and patient global assessment <= 1 (2011) or <= 2 (2022 Boolean 2.0) on a 0-10 scale. Only the patient-global threshold differs between versions. Reports both verdicts. Not the index-based SDAI <= 3.3 definition.',
    compute: acrEularBoolean,
    fields: [
      { dom: 'boolean-tjc', arg: 'tjc', kind: 'number', required: true, label: 'Tender joint count (28-joint), 0-28' },
      { dom: 'boolean-sjc', arg: 'sjc', kind: 'number', required: true, label: 'Swollen joint count (28-joint), 0-28' },
      { dom: 'boolean-crp', arg: 'crp', kind: 'number', unit: 'mg/dL', required: true, label: 'C-reactive protein (mg/dL; threshold <= 1 mg/dL = 10 mg/L)' },
      { dom: 'boolean-ptga', arg: 'ptga', kind: 'number', required: true, label: 'Patient global assessment of disease activity (0-10 scale)' },
    ],
  },
];
