// spec-v340 MCP wave: adapter for the Clark level in lib/clark-level-v340.js. The dom key mirrors
// the browser renderer (views/group-v340.js) and META['clark-level'].example. `level` is an enum
// (I / II / III / IV / V). The compute reports the Clark level and its anatomic-compartment
// description. The example sets level IV; its expected text is the level description (no numeric
// facts), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/clark-level-v340.js';

export default [
  {
    id: 'clark-level',
    summary: 'Clark level (Clark 1969) of a cutaneous melanoma — the anatomic skin layer invaded. I: intraepidermal (melanoma in situ), confined to the epidermis. II: partial invasion of the papillary dermis. III: fills and expands the papillary dermis to the reticular interface. IV: invasion into the reticular dermis. V: invasion into the subcutaneous fat. Deeper levels (IV-V) historically carried higher metastasis / recurrence risk. Modern melanoma staging uses AJCC TNM with Breslow thickness rather than Clark level (now largely historical). Reports the level, not a diagnosis, a staging decision, or a prognosis.',
    compute: C.clarkLevel,
    fields: [
      { dom: 'clark-lvl', arg: 'level', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Clark level' },
    ],
  },
];
