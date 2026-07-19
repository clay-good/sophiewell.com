// spec-v433 MCP wave: adapter for the Modic classification in lib/modic-changes-v433.js. The dom key mirrors
// the browser renderer (views/group-v433.js) and META['modic-changes'].example. `type` is an enum (1/2/3).
// The compute reports the type and its T1/T2 signal. The example sets type 1; its expected text carries the
// "T1"/"T2" tokens (word-only, the "1"/"2" are part of the sequence names) which appear in the result, so it
// flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/modic-changes-v433.js';

export default [
  {
    id: 'modic-changes',
    summary: 'The Modic classification of vertebral endplate / subchondral bone-marrow changes on MRI in degenerative disc disease, by the T1 and T2 signal, types 1/2/3. 1: bone-marrow edema / inflammation (T1 hypointense, T2 hyperintense). 2: fatty (yellow) marrow (T1 hyperintense, T2 iso- to hyperintense). 3: subchondral bony sclerosis (T1 hypointense, T2 hypointense). Reports the imaging type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.modicChanges,
    fields: [
      { dom: 'modic-type', arg: 'type', kind: 'enum', values: ['1', '2', '3'], label: 'Modic type' },
    ],
  },
];
