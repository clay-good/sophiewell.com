// spec-v406 MCP wave: adapter for the Le Fort classification of midface fractures in lib/le-fort-v406.js.
// The dom key mirrors the browser renderer (views/group-v406.js) and META['le-fort'].example. `type` is an
// enum (I/II/III). The compute reports the type and its fracture-level description. The example sets type
// II; its expected text is the type description (a roman numeral, no free numeric facts to round-trip), so
// it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/le-fort-v406.js';

export default [
  {
    id: 'le-fort',
    summary: 'Le Fort classification of a midface (maxillary) fracture, types I/II/III, by the level of the transverse fracture plane through the midface (all three pass through the pterygoid plates). I: horizontal "floating palate" fracture across the maxilla above the tooth apices (Guerin). II: pyramidal "floating maxilla" fracture up through the infraorbital rims and medial orbital walls to the nasofrontal region. III: craniofacial disjunction ("floating face") separating the entire midface from the skull base. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.leFort,
    fields: [
      { dom: 'lf-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Le Fort type' },
    ],
  },
];
