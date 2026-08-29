// spec-v611 MCP wave: adapter for the Fried frailty phenotype in lib/fried-frailty-v611.js. The dom keys
// mirror the browser renderer (views/group-v611.js) and META['fried-frailty'].example.
//
// **THE GRIP CUT-POINT RISES WITH BMI** - a heavier person must squeeze harder to avoid being called weak.
// Never apply a single grip threshold. The men's table has FOUR BMI bands but only THREE distinct values.
//
// **SLOWNESS IS A TIME OVER 15 FEET, NOT A SPEED**, and sex enters ONLY through the height threshold: the
// times are identical for both sexes and only the boundary differs (173 cm men, 159 cm women). Do NOT
// convert to metres per second - published conversions of the same 6 seconds disagree by rounding.
//
// **WEIGHT LOSS HAS TWO ALTERNATIVE DEFINITIONS, EITHER OF WHICH SATISFIES IT.**
//
// **THE ACTIVITY KCAL NUMBERS ARE COHORT-SPECIFIC** - the criterion is the lowest quintile by sex.
//
// This is the ORIGINAL that `frail-scale`, `sof-frailty-index`, `prisma-7` and `groningen-frailty-indicator`
// simplify. Three of its five criteria need equipment or a questionnaire, which is why those exist.

import * as F from '../../lib/fried-frailty-v611.js';

export default [
  {
    id: 'fried-frailty',
    summary: `The FRIED FRAILTY PHENOTYPE (Fried and colleagues 2001, Cardiovascular Health Study) counts FIVE criteria - unintentional weight loss, exhaustion, weakness, slowness and low physical activity - and classifies the patient as ${F.BANDS.map((b) => b.text).join(' ')} This is the ORIGINAL that \`frail-scale\`, \`sof-frailty-index\`, \`prisma-7\` and \`groningen-frailty-indicator\` in this catalog simplify. **${F.GRIP_NOTE}** ${F.GRIP_BANDS_NOTE} NEVER apply a single grip threshold regardless of sex and BMI. **${F.WALK_NOTE}** Do NOT convert the times to meters per second. **${F.WEIGHT_NOTE}** **${F.ACTIVITY_NOTE}** **${F.EQUIPMENT_NOTE}** PRE-FRAIL IS ITS OWN CATEGORY at one or two criteria, not "nearly frail". This classifies a phenotype. It does NOT diagnose any disease, does NOT measure disability or comorbidity - the original work is explicit that those are distinct from frailty - does NOT decide whether someone can have an operation, and does NOT set a care plan.`,
    compute: F.friedFrailty,
    fields: F.CRITERIA.map((c) => ({
      dom: `fried-${c.key}`, arg: c.key, kind: 'enum', values: ['yes', 'no'], required: true,
      label: c.text,
    })),
  },
];
