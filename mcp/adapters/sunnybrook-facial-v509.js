// spec-v509 MCP wave: adapter for the Sunnybrook Facial Grading System in lib/sunnybrook-facial-v509.js.
// The dom keys mirror the browser renderer (views/group-v509.js) and META['sunnybrook-facial'].example:
// sb-rest-eye / sb-rest-cheek / sb-rest-mouth map to the lib args eye / cheek / mouth, sb-m1 .. sb-m5 to
// m1 .. m5, and sb-s1 .. sb-s5 to s1 .. s5. Every field is an enum and all thirteen are in the example, so
// all thirteen are required for every caller - correct here, because the composite is a subtraction across
// three axes and a partial exam has no composite. The example scores 52; that number and the 0 / 100 anchors
// are carried by the result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/sunnybrook-facial-v509.js';

const MOVEMENT = C.MOVEMENT_SCALE.map((o) => o.value);
const SYNKINESIS = C.SYNKINESIS_SCALE.map((o) => o.value);

export default [
  {
    id: 'sunnybrook-facial',
    summary: 'The Sunnybrook Facial Grading System, the quantitative regional grading of facial nerve function and the companion to the House-Brackmann grade. Resting symmetry (eye, cheek, mouth against the normal side) scores points multiplied by 5; five standard expressions each score 1 (no movement) to 5 (complete) multiplied by 4; synkinesis during those same expressions scores 0 to 3. Composite = movement minus resting minus synkinesis, running from 0 (complete flaccid paralysis) to 100 (normal symmetry). It records what the examiner observed. It is not a diagnosis, not an etiology, and not an indication for imaging, medication, electrodiagnostic testing, or surgery.',
    compute: C.sunnybrookFacial,
    fields: [
      ...C.REST_ITEMS.map((item) => ({
        dom: `sb-rest-${item.key}`,
        arg: item.key,
        kind: 'enum',
        values: item.options.map((o) => o.value),
        label: `Resting symmetry: ${item.label}`,
      })),
      ...C.EXPRESSIONS.map((label, i) => ({
        dom: `sb-m${i + 1}`,
        arg: `m${i + 1}`,
        kind: 'enum',
        values: MOVEMENT,
        label: `Voluntary movement: ${label} (1 none to 5 complete)`,
      })),
      ...C.EXPRESSIONS.map((label, i) => ({
        dom: `sb-s${i + 1}`,
        arg: `s${i + 1}`,
        kind: 'enum',
        values: SYNKINESIS,
        label: `Synkinesis: ${label} (0 none to 3 severe)`,
      })),
    ],
  },
];
