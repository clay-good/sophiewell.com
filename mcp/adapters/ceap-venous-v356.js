// spec-v356 MCP wave: adapter for the CEAP clinical classification of chronic venous disease in
// lib/ceap-venous-v356.js. The dom key mirrors the browser renderer (views/group-v356.js) and
// META['ceap-venous'].example. `cls` is an enum of the clinical classes (C0-C6 incl. C4a/C4b). The
// compute reports the CEAP clinical class and its description. The example sets C3; its expected text is
// the class description (the class is a C-label), so it round-trips through the default makeToArgs with
// no custom toArgs.

import * as C from '../../lib/ceap-venous-v356.js';

export default [
  {
    id: 'ceap-venous',
    summary: 'CEAP clinical classification (Eklof 2004; 2020 update) of chronic venous disease — the international standard for describing the clinical signs of a chronic venous disorder (the C axis of Clinical-Etiologic-Anatomic-Pathophysiologic). C0: no visible or palpable signs. C1: telangiectasias or reticular veins. C2: varicose veins (>=3 mm). C3: edema. C4a: pigmentation or eczema. C4b: lipodermatosclerosis or atrophie blanche. C5: healed venous ulcer. C6: active venous ulcer. C4-C6 are the advanced (skin-change and ulcer) classes. Complements the Venous Clinical Severity Score. Reports the class, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.ceapVenous,
    fields: [
      { dom: 'ceap-class', arg: 'cls', kind: 'enum', values: ['C0', 'C1', 'C2', 'C3', 'C4a', 'C4b', 'C5', 'C6'], label: 'CEAP clinical class' },
    ],
  },
];
