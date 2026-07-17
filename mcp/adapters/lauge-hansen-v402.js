// spec-v402 MCP wave: adapter for the Lauge-Hansen classification of rotational ankle fractures in
// lib/lauge-hansen-v402.js. The dom key mirrors the browser renderer (views/group-v402.js) and
// META['lauge-hansen'].example. `mechanism` is an enum (SA/SER/PAB/PER/PD). The compute reports the
// mechanism and its injury-sequence description. The example sets SER; its expected text is the mechanism
// description, whose only digits are the stage numbers (1-4) that the result echoes verbatim, so it flows
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/lauge-hansen-v402.js';

export default [
  {
    id: 'lauge-hansen',
    summary: 'Lauge-Hansen classification of a rotational ankle fracture, by the mechanism of injury (foot position + deforming force) - the mechanistic companion to the anatomic Danis-Weber classification. SA: supination-adduction (lateral avulsion, then a vertical medial malleolus fracture). SER: supination-external-rotation, the most common (AITFL, spiral fibula at the plafond = Weber B, posterior malleolus, medial malleolus). PAB: pronation-abduction (medial injury, syndesmosis, transverse fibula above the plafond = Weber C). PER: pronation-external-rotation (medial injury, AITFL, high spiral fibula = Weber C / Maisonneuve, posterior malleolus). PD: pronation-dorsiflexion (axial pilon-type pattern). Reports the mechanism, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.laugeHansen,
    fields: [
      { dom: 'lh-mech', arg: 'mechanism', kind: 'enum', values: ['SA', 'SER', 'PAB', 'PER', 'PD'], label: 'Lauge-Hansen mechanism' },
    ],
  },
];
