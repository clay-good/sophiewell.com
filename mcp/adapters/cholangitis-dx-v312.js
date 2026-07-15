// spec-v312 MCP wave: adapter for the acute cholangitis diagnosis (Tokyo Guidelines
// TG18/TG13 diagnostic criteria) in lib/cholangitis-dx-v312.js. The dom keys mirror
// the browser renderer (views/group-v312.js) and META['cholangitis-diagnosis'].example.
// All 6 fields are booleans (kind 'bool'), each optional (the compute defaults each
// to false); the compute returns the diagnostic category (definite / suspected / not
// met). The example sets cgd-fever + cgd-jaundice (a suspected case); its expected
// text carries no numbers, so the round-trip is trivial and uses the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/cholangitis-dx-v312.js';

export default [
  {
    id: 'cholangitis-diagnosis',
    summary: 'Acute cholangitis diagnosis (Tokyo Guidelines TG18/TG13, Kiriyama 2018): classifies a presentation as definite, suspected, or not-met from three categories - A systemic inflammation (fever/chills > 38 C, or abnormal WBC/CRP >= 1), B cholestasis (jaundice T-Bil >= 2, or abnormal LFTs > 1.5x ULN), C imaging (biliary dilatation, or evidence of the etiology). Suspected: one item in A + one in B or C. Definite: one item in each of A, B, and C. Reports the diagnostic category, not a diagnosis or an order.',
    compute: C.cholangitisDiagnosis,
    fields: [
      { dom: 'cgd-fever', arg: 'fever', kind: 'bool', label: 'A-1 fever and/or shaking chills (BT > 38 C)' },
      { dom: 'cgd-inflammation', arg: 'inflammation', kind: 'bool', label: 'A-2 lab evidence of inflammatory response (WBC < 4 or > 10 x1000/uL, or CRP >= 1 mg/dL)' },
      { dom: 'cgd-jaundice', arg: 'jaundice', kind: 'bool', label: 'B-1 jaundice (total bilirubin >= 2 mg/dL)' },
      { dom: 'cgd-lfts', arg: 'abnormalLfts', kind: 'bool', label: 'B-2 abnormal liver function tests (ALP, GGT, AST, or ALT > 1.5x upper limit of normal)' },
      { dom: 'cgd-dilatation', arg: 'biliaryDilatation', kind: 'bool', label: 'C-1 biliary dilatation on imaging' },
      { dom: 'cgd-etiology', arg: 'etiologyImaging', kind: 'bool', label: 'C-2 evidence of the etiology on imaging (stricture, stone, stent, etc.)' },
    ],
  },
];
