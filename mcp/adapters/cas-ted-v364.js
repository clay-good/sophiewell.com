// spec-v364 MCP wave: adapter for the Clinical Activity Score (thyroid eye disease) in
// lib/cas-ted-v364.js. The dom keys mirror the browser renderer (views/group-v364.js) and
// META['cas-ted'].example. It is a seven-field BOOLEAN checklist (each `kind: 'bool'`); the fields left
// optional so the compute defaults absent items to false and the example (three items checked -> CAS 3)
// still validates. The example expected numbers (3, 7) round-trip through the default makeToArgs +
// toBool with no custom toArgs.

import * as C from '../../lib/cas-ted-v364.js';

export default [
  {
    id: 'cas-ted',
    summary: 'Clinical Activity Score (Mourits 1989; EUGOGO) for thyroid eye disease / Graves orbitopathy — a 7-item initial-assessment measure of disease ACTIVITY. Each inflammatory item present in the study eye scores 1 point: spontaneous orbital pain, gaze-evoked orbital pain, eyelid swelling, eyelid erythema, conjunctival redness, chemosis, and inflammation of the caruncle or plica. The sum is 0-7; a CAS of 3 or more indicates active disease (the classically taught threshold for considering anti-inflammatory treatment). Reports the score, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.casTed,
    fields: [
      { dom: 'cas-pain', arg: 'pain', kind: 'bool', label: 'Spontaneous orbital (retrobulbar) pain' },
      { dom: 'cas-gaze', arg: 'gazePain', kind: 'bool', label: 'Gaze-evoked orbital pain' },
      { dom: 'cas-lidsw', arg: 'lidSwelling', kind: 'bool', label: 'Eyelid swelling (active TED)' },
      { dom: 'cas-lidery', arg: 'lidErythema', kind: 'bool', label: 'Eyelid erythema' },
      { dom: 'cas-conj', arg: 'conjRedness', kind: 'bool', label: 'Conjunctival redness (active TED)' },
      { dom: 'cas-chem', arg: 'chemosis', kind: 'bool', label: 'Chemosis' },
      { dom: 'cas-carun', arg: 'caruncle', kind: 'bool', label: 'Inflammation of the caruncle or plica' },
    ],
  },
];
