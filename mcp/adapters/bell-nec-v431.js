// spec-v431 MCP wave: adapter for the modified Bell staging of NEC in lib/bell-nec-v431.js. The dom key
// mirrors the browser renderer (views/group-v431.js) and META['bell-nec'].example. `stage` is an enum
// (IA/IB/IIA/IIB/IIIA/IIIB). The compute reports the stage and its findings. The example sets stage IIA; its
// expected text carries no numeric facts (the findings are word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/bell-nec-v431.js';

export default [
  {
    id: 'bell-nec',
    summary: 'The modified Bell staging of necrotizing enterocolitis (NEC), staging a newborn by systemic, intestinal, and radiographic findings, stages IA/IB/IIA/IIB/IIIA/IIIB. IA/IB: suspected. IIA: proven, mildly ill (pneumatosis intestinalis). IIB: proven, moderately ill (portal venous gas, acidosis, thrombocytopenia). IIIA: advanced, severely ill, bowel intact (peritonitis, ascites). IIIB: advanced, perforated (pneumoperitoneum). Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.bellNec,
    fields: [
      { dom: 'bell-stage', arg: 'stage', kind: 'enum', values: ['IA', 'IB', 'IIA', 'IIB', 'IIIA', 'IIIB'], label: 'Modified Bell stage' },
    ],
  },
];
