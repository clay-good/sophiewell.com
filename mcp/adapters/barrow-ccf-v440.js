// spec-v440 MCP wave: adapter for the Barrow CCF classification in lib/barrow-ccf-v440.js. The dom key
// mirrors the browser renderer (views/group-v440.js) and META['barrow-ccf'].example. `type` is an enum
// (A/B/C/D). The compute reports the type and its arterial-supply description. The example sets type A; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/barrow-ccf-v440.js';

export default [
  {
    id: 'barrow-ccf',
    summary: 'The Barrow classification of carotid-cavernous fistula (CCF), by the arterial supply and flow, types A/B/C/D. A: direct high-flow ICA-to-cavernous-sinus shunt (often traumatic). B: dural shunt from ICA meningeal branches. C: dural shunt from ECA meningeal branches. D: dural shunt from both ICA and ECA. B/C/D are the indirect (dural) fistulas. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.barrowCcf,
    fields: [
      { dom: 'barrow-type', arg: 'type', kind: 'enum', values: ['A', 'B', 'C', 'D'], label: 'Barrow type' },
    ],
  },
];
