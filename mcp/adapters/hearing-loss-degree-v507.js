// spec-v507 MCP wave: adapter for the degree-of-hearing-loss banding in lib/hearing-loss-degree-v507.js.
// The dom key mirrors the browser renderer (views/group-v507.js) and META['hearing-loss-degree'].example.
// Unlike the recent enum adapters this one exposes a NUMBER field: `pta` is the pure-tone average in dB HL,
// which the lib bands. The example sets 45; both numbers in its expected text (45, and the 41-to-55 band
// bounds) are carried by the result, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/hearing-loss-degree-v507.js';

export default [
  {
    id: 'hearing-loss-degree',
    summary: 'The degree-of-hearing-loss classification from a pure-tone average (PTA) in dB HL. -10 to 15: normal hearing. 16 to 25: slight loss. 26 to 40: mild. 41 to 55: moderate. 56 to 70: moderately severe. 71 to 90: severe. Above 90: profound. Each band owns its upper cut point. Bands the PTA supplied and nothing more: it does not interpret the audiogram (nothing about conductive versus sensorineural loss, asymmetry, or configuration), is not a diagnosis, and is not a recommendation for amplification or a cochlear implant.',
    compute: C.hearingLossDegree,
    fields: [
      { dom: 'hl-pta', arg: 'pta', kind: 'number', label: 'Pure-tone average (dB HL)' },
    ],
  },
];
