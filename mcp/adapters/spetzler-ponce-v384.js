// spec-v384 MCP wave: adapter for the Spetzler-Ponce classification of a cerebral AVM in
// lib/spetzler-ponce-v384.js. The dom key mirrors the browser renderer (views/group-v384.js) and
// META['spetzler-ponce'].example. `class` is an enum (A/B/C). The compute reports the class and its
// Spetzler-Martin-grade grouping. The example sets Class C; its expected text is the class description
// (roman-numeral SM grades, no free numeric facts to round-trip), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/spetzler-ponce-v384.js';

export default [
  {
    id: 'spetzler-ponce',
    summary: 'Spetzler-Ponce classification (Spetzler 2011) of a cerebral arteriovenous malformation (Classes A/B/C) - a 3-tier simplification of the 5-tier Spetzler-Martin grade, grouping grades with similar surgical outcomes. A: Spetzler-Martin grade I-II; the lowest surgical risk. B: Spetzler-Martin grade III; intermediate surgical risk. C: Spetzler-Martin grade IV-V; the highest surgical risk. In the original series the authors generally associated surgery with Class A, multimodal treatment with Class B, and observation with Class C - a general association, not an order. Reports the class, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.spetzlerPonce,
    fields: [
      { dom: 'sp-class', arg: 'class', kind: 'enum', values: ['A', 'B', 'C'], label: 'Spetzler-Ponce class' },
    ],
  },
];
