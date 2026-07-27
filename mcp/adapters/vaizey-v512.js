// spec-v512 MCP wave: adapter for the Vaizey (St Marks) fecal incontinence score in lib/vaizey-v512.js.
// The dom keys mirror the browser renderer (views/group-v512.js) and META['vaizey'].example: vz-solid,
// vz-liquid, vz-gas, vz-lifestyle carry the 0-4 frequency rows and vz-pad, vz-meds, vz-defer the weighted
// yes/no rows; each dom key maps to the lib arg of the same short name. Every field is an enum and all seven
// are in META.example, so all seven are required for every caller - correct for a summed instrument, and
// specifically because an unanswered added row is not a no: omitting vz-defer would silently drop 4 points.
// The example scores 15; that number, the two subtotals, and the 24 ceiling are carried by the result band,
// so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/vaizey-v512.js';

const SCALE = C.FREQUENCY_SCALE.map((o) => o.value);
const YES_NO = ['no', 'yes'];

export default [
  {
    id: 'vaizey',
    summary: 'The Vaizey (St Marks) fecal incontinence score, the companion to the Wexner score. Incontinence for solid stool, for liquid stool, for gas, and alteration in lifestyle each score 0 (never) to 4 (daily); wearing a pad or plug adds 2, taking constipating medicines adds 2, and being unable to defer defecation for 15 minutes adds 4. Total 0 (perfect continence) to 24 (totally incontinent). It sums what the patient reports. It does not identify a cause - obstetric sphincter injury, neuropathy, overflow from constipation, and inflammatory bowel disease can all produce the same number - it is not an anorectal physiology study, and it is not an indication for biofeedback, neuromodulation, sphincter repair, or a stoma.',
    compute: C.vaizey,
    fields: [
      ...C.FREQUENCY_ROWS.map((row) => ({
        dom: `vz-${row.key}`,
        arg: row.key,
        kind: 'enum',
        values: SCALE,
        label: `${row.label} (0 never to 4 daily)`,
      })),
      ...C.YES_NO_ROWS.map((row) => ({
        dom: `vz-${row.key}`,
        arg: row.key,
        kind: 'enum',
        values: YES_NO,
        label: `${row.label} (${row.points} points if yes)`,
      })),
    ],
  },
];
