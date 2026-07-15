// spec-v310 MCP wave: adapter for the acute cholangitis severity grade (Tokyo
// Guidelines TG18/TG13) in lib/cholangitis-v310.js. The dom keys mirror the browser
// renderer (views/group-v310.js) and META['cholangitis-severity'].example. All 11
// fields are booleans (kind 'bool'), each optional (the compute defaults each to
// false); the compute grades III if any one of the six organ dysfunctions is set,
// II if any two of the five moderate criteria are set, I otherwise. The example
// sets only `chol-hepatic`, so it round-trips through the default makeToArgs (which
// maps '1' -> true) with no custom toArgs.

import * as C from '../../lib/cholangitis-v310.js';

export default [
  {
    id: 'cholangitis-severity',
    summary: 'Acute cholangitis severity grade (Tokyo Guidelines TG18/TG13, Kiriyama 2018): Grade III (severe) if any one new-onset organ dysfunction (cardiovascular - dopamine >= 5 ug/kg/min or any norepinephrine; neurological; respiratory PaO2/FiO2 < 300; renal oliguria or creatinine > 2.0 mg/dL; hepatic PT-INR > 1.5; hematological platelets < 100,000/mm3); Grade II (moderate) if any two of abnormal WBC (> 12,000 or < 4,000), fever >= 39 C, age >= 75, bilirubin >= 5 mg/dL, or albumin < 0.7x lower limit of normal; Grade I (mild) otherwise. Reports the classification grade, not a drainage or antibiotic order.',
    compute: C.cholangitisSeverity,
    fields: [
      { dom: 'chol-cv', arg: 'cardiovascular', kind: 'bool', label: 'Cardiovascular dysfunction (dopamine >= 5 ug/kg/min or any norepinephrine)' },
      { dom: 'chol-neuro', arg: 'neurological', kind: 'bool', label: 'Neurological dysfunction (disturbance of consciousness)' },
      { dom: 'chol-resp', arg: 'respiratory', kind: 'bool', label: 'Respiratory dysfunction (PaO2/FiO2 ratio < 300)' },
      { dom: 'chol-renal', arg: 'renal', kind: 'bool', label: 'Renal dysfunction (oliguria or serum creatinine > 2.0 mg/dL)' },
      { dom: 'chol-hepatic', arg: 'hepatic', kind: 'bool', label: 'Hepatic dysfunction (PT-INR > 1.5)' },
      { dom: 'chol-heme', arg: 'hematological', kind: 'bool', label: 'Hematological dysfunction (platelet count < 100,000/mm3)' },
      { dom: 'chol-wbc', arg: 'abnormalWbc', kind: 'bool', label: 'Abnormal WBC count (> 12,000 or < 4,000/mm3)' },
      { dom: 'chol-fever', arg: 'highFever', kind: 'bool', label: 'High fever (>= 39 C)' },
      { dom: 'chol-age', arg: 'age', kind: 'bool', label: 'Age >= 75 years' },
      { dom: 'chol-bili', arg: 'hyperbilirubinemia', kind: 'bool', label: 'Hyperbilirubinemia (total bilirubin >= 5 mg/dL)' },
      { dom: 'chol-albumin', arg: 'hypoalbuminemia', kind: 'bool', label: 'Hypoalbuminemia (albumin < 0.7x lower limit of normal)' },
    ],
  },
];
