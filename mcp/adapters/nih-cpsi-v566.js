// spec-v566 MCP wave: adapter for the NIH Chronic Prostatitis Symptom Index in lib/nih-cpsi-v566.js. The
// dom keys mirror the browser renderer (views/group-v566.js) and META['nih-cpsi'].example.
//
// **NINE NUMBERED QUESTIONS BUT THIRTEEN SCORED ITEMS, AND BOTH COUNTS ARE CORRECT.** The literature calls
// this a 13-item index while the form shows 9 questions; question 1 has four yes/no sub-parts and question
// 2 has two, so 4 + 2 + 7 = 13. An agent that has met only one of the two counts will think the other
// describes a different instrument.
//
// **THE PER-ITEM RANGES ARE HETEROGENEOUS AND ONE ITEM CARRIES ~23 PERCENT OF THE TOTAL.** Six items are
// 0-1, two are 0-3, three are 0-5, one is 0-6, and the average-pain rating is 0-10. That single item is 10
// of the 43 points, worth TEN TIMES any one yes/no item. Every field carries its own enum; there is no
// shared response scale.
//
// **THE ORIGINAL PAPER PUBLISHED NO SEVERITY BANDS.** The widely quoted mild 0-14 / moderate 15-29 / severe
// 30-43 come from a LATER multinational cohort. The summary attributes them, because an agent that believes
// the instrument ships with bands will over-trust them.
//
// **THE MGUPI/GUPI IS A DIFFERENT INSTRUMENT.** It adds two pain items, giving a pain subscale of 0-23 and
// a total of 0-45. A total of 44 is impossible here and ordinary there, so the two must never be mixed or
// compared.
//
// QUESTION 4 IS CONDITIONAL IN WORDING BUT UNCONDITIONAL IN SCORING: it asks for average pain "on the days
// that you had it", which does not apply if question 3 is "never", yet the instrument still requires a 0-10
// value. The tool requires it too, and sets `painFrequencyConflict` when question 3 is 0 and question 4 is
// positive, rather than silently accepting contradictory answers.

import * as C from '../../lib/nih-cpsi-v566.js';

export default [
  {
    id: 'nih-cpsi',
    summary: `The NIH Chronic Prostatitis Symptom Index (NIH-CPSI; Litwin and colleagues, J Urol 1999). **${C.NUMBERED_QUESTIONS} NUMBERED QUESTIONS BUT ${C.SCORED_ITEMS} SCORED ITEMS, AND BOTH COUNTS ARE CORRECT**: question 1 has four yes/no sub-parts and question 2 has two, so 4 plus 2 plus 7 is ${C.SCORED_ITEMS}. The literature universally calls this a 13-item index while the form shows nine questions, and an agent that has met only one count will think the other describes a different instrument. All items refer to THE LAST WEEK. THREE SUBSCALES SUMMED TO A TOTAL OF 0 TO ${C.CPSI_MAX}: PAIN from items 1a-1d, 2a, 2b, 3 and 4, range 0 to ${C.SUBSCALE_MAXIMA.pain}; URINARY from items 5 and 6, range 0 to ${C.SUBSCALE_MAXIMA.urinary}; QUALITY-OF-LIFE IMPACT from items 7, 8 and 9, range 0 to ${C.SUBSCALE_MAXIMA.qol}. **THE PER-ITEM RANGES ARE HETEROGENEOUS AND ONE ITEM CARRIES ABOUT 23 PERCENT OF THE TOTAL**: six items score 0 or 1, two score 0 to 3, three score 0 to 5, one scores 0 to 6, and the AVERAGE PAIN RATING scores 0 to 10, making it worth TEN TIMES any one yes/no item. Do not treat the items as comparable, and note that each field has its own permitted values rather than a shared response scale. QUESTION 4 IS CONDITIONAL IN WORDING BUT UNCONDITIONAL IN SCORING: it asks for average pain "on the days that you had it", which does not apply to a patient who answered "never" to question 3, yet the instrument still requires a 0 to 10 value. This tool requires it too and sets painFrequencyConflict when question 3 is 0 while question 4 is positive, rather than silently accepting contradictory answers. QUESTION 9 IS A SATISFACTION LADDER whose neutral answer is not a general midpoint: it runs from delighted at 0 to terrible at 6, and "mixed, about equally satisfied and dissatisfied" scores 3, which is the midpoint of that item alone. **THE DEVELOPMENT PAPER PUBLISHED NO TOTAL-SCORE SEVERITY BANDS**: the widely quoted mild 0 to 14, moderate 15 to 29 and severe 30 to 43 come from a LATER multinational cohort, not from the original, and are labeled as such here. **THE MGUPI OR GUPI IS A DIFFERENT INSTRUMENT**: it adds two further pain items, giving a pain subscale of 0 to 23 and a total of 0 to ${C.MGUPI_MAX}, so a total of 44 is impossible here and ordinary there, and the two must never be mixed or compared. This is a SYMPTOM INDEX. It does NOT diagnose chronic prostatitis or chronic pelvic pain syndrome, and it does not distinguish the NIH categories, which turn on inflammatory findings and cultures this instrument cannot see. It does NOT exclude the conditions that present the same way and are managed very differently, including bacterial infection, bladder pain syndrome, urethral stricture and pelvic floor dysfunction. It does NOT detect the findings that need urgent assessment: hematuria, fever with pain, acute retention and a suspicious examination all need attention REGARDLESS of the score. It does not select therapy, and a high score is not by itself an indication for antibiotics.`,
    compute: C.nihCpsi,
    fields: C.CPSI_ITEMS.map((item) => ({
      dom: `cpsi-${item.key}`, arg: item.key, kind: 'enum',
      values: item.options.map((o) => String(o.value)), required: true,
      label: `Question ${item.question} (${item.subscale} subscale). ${item.text} [${item.options.map((o) => `${o.value} = ${o.text}`).join('; ')}]`,
    })),
  },
];
