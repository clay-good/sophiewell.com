// spec-v474 MCP wave: adapter for the Rastelli complete-AVSD classification in lib/rastelli-avsd-v474.js. The
// dom key mirrors the browser renderer (views/group-v474.js) and META['rastelli-avsd'].example. `type` is an
// enum (A/B/C). The compute reports the type and its bridging-leaflet-morphology description. The example sets
// type A; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/rastelli-avsd-v474.js';

export default [
  {
    id: 'rastelli-avsd',
    summary: 'The Rastelli classification of the complete atrioventricular septal defect, by the morphology of the superior (anterior) bridging leaflet, types A/B/C. A: attached by chordae to the crest of the ventricular septum (most common). B: anomalous chordal attachments to a right-ventricular papillary muscle (rarest). C: free-floating, unattached to the septum (often with tetralogy of Fallot). Reports the anatomic type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.rastelliAvsd,
    fields: [
      { dom: 'rastelli-type', arg: 'type', kind: 'enum', values: ['A', 'B', 'C'], label: 'Rastelli type' },
    ],
  },
];
