// spec-v313 MCP wave: adapter for the acute cholecystitis diagnosis (Tokyo
// Guidelines TG18/TG13 diagnostic criteria) in lib/cholecystitis-dx-v313.js — the
// fourth and final adapter of the TG18 biliary quartet. The dom keys mirror the
// browser renderer (views/group-v313.js) and META['cholecystitis-diagnosis'].example.
// All 6 fields are booleans (kind 'bool'), each optional (the compute defaults each
// to false); the compute returns the diagnostic category (definite / suspected / not
// met). The example sets ccd-murphy + ccd-fever (a suspected case); its expected text
// carries no numbers, so the round-trip is trivial and uses the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/cholecystitis-dx-v313.js';

export default [
  {
    id: 'cholecystitis-diagnosis',
    summary: 'Acute cholecystitis diagnosis (Tokyo Guidelines TG18/TG13, Yokoe 2018): classifies a presentation as definite, suspected, or not-met from three categories - A local signs (Murphy sign, or RUQ mass/pain/tenderness), B systemic signs (fever, elevated CRP, or elevated WBC), C imaging (findings characteristic of acute cholecystitis). Suspected: one item in A + one in B. Definite: one item in A + one in B + C. Reports the diagnostic category, not a diagnosis or an order.',
    compute: C.cholecystitisDiagnosis,
    fields: [
      { dom: 'ccd-murphy', arg: 'murphy', kind: 'bool', label: "A Murphy's sign" },
      { dom: 'ccd-ruq', arg: 'ruq', kind: 'bool', label: 'A right-upper-quadrant mass, pain, or tenderness' },
      { dom: 'ccd-fever', arg: 'fever', kind: 'bool', label: 'B fever' },
      { dom: 'ccd-crp', arg: 'elevatedCrp', kind: 'bool', label: 'B elevated CRP' },
      { dom: 'ccd-wbc', arg: 'elevatedWbc', kind: 'bool', label: 'B elevated WBC count' },
      { dom: 'ccd-imaging', arg: 'imaging', kind: 'bool', label: 'C imaging findings characteristic of acute cholecystitis' },
    ],
  },
];
