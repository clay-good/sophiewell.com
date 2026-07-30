// spec-v616 MCP wave: adapter for the Frisen papilledema scale in lib/frisen-v616.js. The dom keys mirror the
// browser renderer (views/group-v616.js) and META.frisen.example.
//
// **THE SCALE IS CUMULATIVE** - each grade requires the features of the one below. The adapter ENFORCES this:
// contradictory findings return `grade: null` with `consistent: false` and a list of `contradictions`. Do NOT
// resolve a contradiction by picking the higher grade.
//
// **THE TEMPORAL GAP IS THE WHOLE DIFFERENCE BETWEEN GRADE 1 AND 2.**
//
// **GRADE 3 vs 4 IS THE LOCATION OF THE OBSCURED VESSEL, NOT THE AMOUNT**: as it LEAVES the disc versus ON
// the disc.
//
// **GRADE 4 REQUIRES AT LEAST ONE MAJOR VESSEL ON THE DISC TO BE SPARED.** If none is spared it is grade 5.
//
// **PARTIAL OBSCURATION DOES NOT COUNT.** Grade 2 permits partial obscuration; grades 3+ need TOTAL
// obscuration of a portion.
//
// **THE GRADE DOES NOT MEASURE INTRACRANIAL PRESSURE.** Never report it as a pressure, and never treat a low
// grade as excluding raised pressure.

import * as F from '../../lib/frisen-v616.js';

export default [
  {
    id: 'frisen',
    summary: `The FRISEN SCALE (Frisen 1982) grades swelling of the optic nerve head 0 to 5 on fundus appearance: ${F.GRADES.map((g) => `grade ${g.grade} = ${g.text}`).join(' ')} **${F.CUMULATIVE_NOTE}** The adapter ENFORCES this - contradictory findings return \`grade: null\` with \`consistent: false\` and a list of \`contradictions\`, and a contradiction must NOT be resolved by picking the higher grade. **${F.TEMPORAL_GAP_NOTE}** **${F.LOCATION_NOTE}** **${F.SPARED_NOTE}** **${F.PARTIAL_NOTE}** **${F.NOT_PRESSURE_NOTE}** This grades a disc APPEARANCE. It does NOT diagnose papilledema or its cause, does NOT distinguish true papilledema from pseudopapilledema, does NOT measure or estimate intracranial pressure, does NOT indicate whether imaging or a lumbar puncture is needed, and does NOT decide treatment.`,
    compute: F.frisenGrade,
    fields: [
      { dom: 'frisen-halo', arg: 'halo', kind: 'enum', values: F.HALO_STATES.map((h) => h.value), required: true, label: `The peripapillary halo [${F.HALO_STATES.map((h) => `${h.value} = ${h.text}`).join('; ')}]. "temporal-gap" is grade 1 and "circumferential" is grade 2 or above.` },
      ...F.VESSEL_FINDINGS.map((v) => ({
        dom: `frisen-${v.key}`, arg: v.key, kind: 'enum', values: ['yes', 'no'], required: true,
        label: `${v.text}. TOTAL obscuration only - partial obscuration does not count.`,
      })),
    ],
  },
];
