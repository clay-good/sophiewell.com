// spec-v614 MCP wave: adapter for the Ocular Trauma Score in lib/ocular-trauma-score-v614.js. The dom keys
// mirror the browser renderer (views/group-v614.js) and META['ocular-trauma-score'].example.
//
// **THE INITIAL VISUAL ACUITY IS THE ONLY TERM THAT ADDS.** Base 60-100; the five findings deduct 75 in
// total. Never treat the presenting vision as one variable among six.
//
// **THE RAW SCORE CAN FALL BELOW THE PUBLISHED TABLE, WHICH STARTS AT 0.** No light perception with rupture,
// endophthalmitis, retinal detachment and an afferent pupillary defect is -1. When that happens `ots` is
// NULL and `belowPublishedRange` is true. DO NOT clamp to category 1 and DO NOT invent a category.
//
// **THE OUTPUT IS A PROBABILITY DISTRIBUTION, NOT A PREDICTED ACUITY.** Report `probabilities` alongside
// `outcomes`; the category number alone throws the result away.
//
// **NEITHER EXTREME IS CERTAIN** - category 1 still carries 1% at 20/40 or better, category 5 still carries
// 1% at light perception or hand movements.
//
// Group-level, six months, after OPTIMAL MANAGEMENT. It does NOT support a decision to enucleate or to
// withhold repair.

import * as O from '../../lib/ocular-trauma-score-v614.js';

export default [
  {
    id: 'ocular-trauma-score',
    summary: `The OCULAR TRAUMA SCORE (Kuhn and colleagues 2002) estimates the DISTRIBUTION of visual outcome six months after serious eye injury WITH OPTIMAL MANAGEMENT. Initial visual acuity sets the base [${O.ACUITY_BASE.map((a) => `${a.text} = ${a.points}`).join('; ')}] and five findings deduct [${O.DEDUCTIONS.map((d) => `${d.text} ${d.points}`).join('; ')}]. The raw total maps to a category [${O.CATEGORIES.map((c) => `${c.min} to ${c.max} = OTS ${c.ots}`).join('; ')}]. **${O.LEDGER_NOTE}** **${O.FLOOR_NOTE}** When that happens \`ots\` is NULL and \`belowPublishedRange\` is true - DO NOT clamp to category 1 and DO NOT invent a category. **${O.DISTRIBUTION_NOTE}** The six-month distributions are ${O.CATEGORIES.map((c) => `OTS ${c.ots}: ${c.probabilities.map((p, i) => `${O.OUTCOMES[i]} ${p}%`).join(', ')}`).join('; ')}. Report \`probabilities\` alongside \`outcomes\`; the category number alone throws the result away. **${O.EXTREMES_NOTE}** ${O.WIDTH_NOTE} This estimates a GROUP-LEVEL distribution. It does NOT diagnose the injury, does NOT decide whether to operate, does NOT support a decision to enucleate or to withhold repair, and does NOT predict what will happen to one patient's eye.`,
    compute: O.ocularTraumaScore,
    fields: [
      { dom: 'ots-acuity', arg: 'acuity', kind: 'enum', values: O.ACUITY_BASE.map((a) => a.value), required: true, label: `Initial visual acuity - THE ONLY TERM THAT ADDS [${O.ACUITY_BASE.map((a) => `${a.value} = ${a.text}, ${a.points} points`).join('; ')}].` },
      ...O.DEDUCTIONS.map((d) => ({
        dom: `ots-${d.key}`, arg: d.key, kind: 'enum', values: ['yes', 'no'], required: true,
        label: `${d.text}. Deducts ${Math.abs(d.points)} points if present.`,
      })),
    ],
  },
];
