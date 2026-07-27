// spec-v521 MCP wave: adapter for the Primary Care PTSD Screen for DSM-5 in lib/pc-ptsd5-v521.js.
// The dom keys mirror the browser renderer (views/group-v521.js) and META['pc-ptsd5'].example: pcp-trauma
// plus pcp-q1 .. pcp-q5 map to the lib args trauma and q1 .. q5.
//
// THE REQUIRED FLAGS ENCODE THE INSTRUMENT'S GATE, and this is the design point of the wave. Only
// `pcp-trauma` is marked required. The five symptom items are NOT, because when no traumatic event is
// reported the source is explicit that the screen is complete with a score of 0 and the five items are never
// asked - every one of them refers to "the event(s)". A caller reporting no trauma can therefore compute a
// valid, finished, negative result from ONE input, instead of being forced to invent five answers to
// questions that presuppose a trauma the patient has not reported. When trauma IS reported, the lib itself
// requires all five and returns an explicit message naming what is missing, so nothing is silently scored as
// a no.
//
// The two published cut points are both reported rather than collapsed into a bare positive/negative: 3 is
// optimally sensitive, 4 is optimally efficient, and a total of exactly 3 is the case where they disagree.
// An agent that needs one answer should be told which threshold it is applying. The example scores 4; that
// number and both cut points are carried by the result band, so it flows through the default makeToArgs with
// no custom toArgs.

import * as P from '../../lib/pc-ptsd5-v521.js';

const YES_NO = ['no', 'yes'];

export default [
  {
    id: 'pc-ptsd5',
    summary: 'The Primary Care PTSD Screen for DSM-5 (PC-PTSD-5): a five-item yes-or-no screen, total 0 to 5. It opens with a trauma-exposure question, and that question is part of the instrument: if no traumatic event is reported the screen is complete with a score of 0 and the five symptom items are not asked, because every one of them refers to the event. Otherwise each yes scores 1. The source recommends two cut points for different purposes: 3 or more is optimally sensitive for probable PTSD, and 4 or more is optimally efficient; a total of exactly 3 is where they disagree, so this tool reports the total against both rather than emitting a bare positive or negative. This is a screen, not a diagnosis, and it is not the PCL-5, which is a 20-item severity measure scored 0 to 80. A positive screen does not establish PTSD and a negative screen does not exclude it; either way the next step is a clinical assessment. It does not measure severity, does not track response to treatment, and does not assess suicide risk, which a positive screen should prompt rather than answer.',
    compute: P.pcPtsd5,
    fields: [
      {
        dom: 'pcp-trauma',
        arg: 'trauma',
        kind: 'enum',
        values: YES_NO,
        required: true,
        label: 'Has the person ever experienced a traumatic event (for example a serious accident, an assault, a natural disaster, war, witnessing someone be injured or killed, or losing someone to homicide or suicide)? If no, the screen is complete with a score of 0 and the five items below are not asked.',
      },
      ...P.PC_PTSD5_ITEMS.map((item) => ({
        dom: `pcp-${item.key}`,
        arg: item.key,
        kind: 'enum',
        values: YES_NO,
        label: `In the past month, have you: ${item.text} (Asked only if a traumatic event was reported.)`,
      })),
    ],
  },
];
