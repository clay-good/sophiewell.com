// spec-v377 MCP wave: adapter for the Gartland classification of a supracondylar humerus fracture in
// lib/gartland-supracondylar-v377.js. The dom key mirrors the browser renderer (views/group-v377.js) and
// META['gartland-supracondylar'].example. `type` is an enum (I/II/III/IV). The compute reports the type
// and its description. The example sets type III; its expected text is the type description (a roman
// numeral, no numeric facts to round-trip), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/gartland-supracondylar-v377.js';

export default [
  {
    id: 'gartland-supracondylar',
    summary: 'Gartland classification (Gartland 1959; modified type IV, Leitch 2006) of a pediatric extension-type supracondylar HUMERUS fracture (types I-IV) - the most common pediatric elbow fracture, graded by displacement and the integrity of the cortical/periosteal hinge. I: nondisplaced; the anterior humeral line passes through the capitellum (stable). II: displaced with an intact posterior cortical hinge (Wilkins IIA rotationally stable / IIB malrotated). III: completely displaced, with no cortical contact between the fragments. IV: (modified) multidirectional instability with complete periosteal disruption, unstable in both flexion and extension. Instability rises I to IV. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.gartlandSupracondylar,
    fields: [
      { dom: 'gartland-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Gartland type' },
    ],
  },
];
