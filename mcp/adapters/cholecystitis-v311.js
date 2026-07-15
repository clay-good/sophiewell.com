// spec-v311 MCP wave: adapter for the acute cholecystitis severity grade (Tokyo
// Guidelines TG18/TG13) in lib/cholecystitis-v311.js — the companion to the
// spec-v310 acute cholangitis adapter. The dom keys mirror the browser renderer
// (views/group-v311.js) and META['cholecystitis-severity'].example. All 10 fields
// are booleans (kind 'bool'), each optional (the compute defaults each to false);
// the compute grades III if any one of the six organ dysfunctions is set, II if any
// one of the four moderate criteria is set, I otherwise. The example sets only
// `cc-duration`, whose band/note carry the "> 72 h" example number, so it
// round-trips through the default makeToArgs (which maps '1' -> true) with no custom
// toArgs.

import * as C from '../../lib/cholecystitis-v311.js';

export default [
  {
    id: 'cholecystitis-severity',
    summary: 'Acute cholecystitis severity grade (Tokyo Guidelines TG18/TG13, Yokoe 2018): Grade III (severe) if any one new-onset organ dysfunction (cardiovascular - dopamine >= 5 ug/kg/min or any norepinephrine; neurological; respiratory PaO2/FiO2 < 300; renal oliguria or creatinine > 2.0 mg/dL; hepatic PT-INR > 1.5; hematological platelets < 100,000/mm3); Grade II (moderate) if any one of WBC > 18,000/mm3, a palpable tender RUQ mass, duration > 72 h, or marked local inflammation (gangrenous/emphysematous cholecystitis, pericholecystic or hepatic abscess, biliary peritonitis); Grade I (mild) otherwise. Reports the classification grade, not an operative or drainage order.',
    compute: C.cholecystitisSeverity,
    fields: [
      { dom: 'cc-cv', arg: 'cardiovascular', kind: 'bool', label: 'Cardiovascular dysfunction (dopamine >= 5 ug/kg/min or any norepinephrine)' },
      { dom: 'cc-neuro', arg: 'neurological', kind: 'bool', label: 'Neurological dysfunction (decreased level of consciousness)' },
      { dom: 'cc-resp', arg: 'respiratory', kind: 'bool', label: 'Respiratory dysfunction (PaO2/FiO2 ratio < 300)' },
      { dom: 'cc-renal', arg: 'renal', kind: 'bool', label: 'Renal dysfunction (oliguria or serum creatinine > 2.0 mg/dL)' },
      { dom: 'cc-hepatic', arg: 'hepatic', kind: 'bool', label: 'Hepatic dysfunction (PT-INR > 1.5)' },
      { dom: 'cc-heme', arg: 'hematological', kind: 'bool', label: 'Hematological dysfunction (platelet count < 100,000/mm3)' },
      { dom: 'cc-wbc', arg: 'elevatedWbc', kind: 'bool', label: 'Elevated WBC count (> 18,000/mm3)' },
      { dom: 'cc-mass', arg: 'tenderMass', kind: 'bool', label: 'Palpable tender mass in the right upper abdominal quadrant' },
      { dom: 'cc-duration', arg: 'durationOver72h', kind: 'bool', label: 'Duration of complaints > 72 h' },
      { dom: 'cc-inflammation', arg: 'markedInflammation', kind: 'bool', label: 'Marked local inflammation (gangrenous/emphysematous cholecystitis, pericholecystic or hepatic abscess, biliary peritonitis)' },
    ],
  },
];
