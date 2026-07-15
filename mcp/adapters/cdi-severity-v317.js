// spec-v317 MCP wave: adapter for the CDI severity classification (2017 IDSA/SHEA) in
// lib/cdi-severity-v317.js. The dom keys mirror the browser renderer
// (views/group-v317.js) and META['cdi-severity'].example. `wbc` and `creatinine` are
// numbers (each optional at the field level — the compute itself requires both when no
// fulminant finding is checked); `hypotension`, `ileus`, and `megacolon` are booleans
// (a fulminant finding classifies fulminant and overrides the labs). The compute
// reports non-severe, severe, or fulminant. The example sets WBC 18000 + creatinine 1.2
// (a WBC-driven severe case); its band carries the "18000", "15,000", "1.2", and "1.5"
// example numbers, so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/cdi-severity-v317.js';

export default [
  {
    id: 'cdi-severity',
    summary: '2017 IDSA/SHEA Clostridioides difficile infection severity classification (McDonald 2018). Non-severe: WBC <= 15,000 cells/uL and serum creatinine < 1.5 mg/dL. Severe: WBC >= 15,000 cells/uL or serum creatinine >= 1.5 mg/dL. Fulminant: hypotension or shock, ileus, or megacolon (overrides the labs, and classifies without them). Reports the severity class, not a treatment order; the regimen and management pathway stay with the clinician.',
    compute: C.cdiSeverity,
    fields: [
      { dom: 'cdi-wbc', arg: 'wbc', kind: 'number', label: 'WBC (cells/uL)' },
      { dom: 'cdi-cr', arg: 'creatinine', kind: 'number', label: 'Serum creatinine (mg/dL)' },
      { dom: 'cdi-hypotension', arg: 'hypotension', kind: 'bool', label: 'Hypotension or shock [fulminant]' },
      { dom: 'cdi-ileus', arg: 'ileus', kind: 'bool', label: 'Ileus [fulminant]' },
      { dom: 'cdi-megacolon', arg: 'megacolon', kind: 'bool', label: 'Megacolon (toxic megacolon) [fulminant]' },
    ],
  },
];
