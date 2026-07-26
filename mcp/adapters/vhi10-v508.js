// spec-v508 MCP wave: adapter for the Voice Handicap Index-10 in lib/vhi10-v508.js.
// The dom keys mirror the browser renderer (views/group-v508.js) and META['vhi10'].example: vhi-q1 .. vhi-q10
// map to the lib args v1 .. v10. Every item is an enum 0-4 and all ten are in the example, so all ten are
// required for every caller - which is correct for a questionnaire: a partial VHI-10 has no total. The example
// answers total 18; that number and the 40 ceiling are carried by the result band, so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/vhi10-v508.js';

const SCALE = ['0', '1', '2', '3', '4'];

export default [
  {
    id: 'vhi10',
    summary: 'The Voice Handicap Index-10, a ten-item patient-reported measure of self-perceived voice handicap. Each item is rated 0 (never) to 4 (always); the total runs 0 to 40, and 11 or more is the commonly cited threshold for an abnormal degree of handicap. The score reflects how much handicap the patient perceives, not what is causing it: it is not a diagnosis, not a laryngeal examination, and not an indication for laryngoscopy, therapy, or surgery. Persistent hoarseness warrants laryngeal visualization regardless of the score.',
    compute: C.vhi10,
    fields: C.VHI10_ITEMS.map((text, i) => ({
      dom: `vhi-q${i + 1}`,
      arg: `v${i + 1}`,
      kind: 'enum',
      values: SCALE,
      label: `${i + 1}. ${text}`,
    })),
  },
];
