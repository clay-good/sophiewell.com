// spec-v558 MCP wave: adapter for the Ocular Surface Disease Index in lib/osdi-v558.js. The dom keys mirror
// the browser renderer (views/group-v558.js) and META['osdi'].example: osdi-q1 .. osdi-q12.
//
// **THE DENOMINATOR IS VARIABLE AND THE SCORE IS GENERALLY NOT AN INTEGER.** Items answered "not
// applicable" are excluded from BOTH the numerator and the denominator, so the divisor is the number of
// questions ANSWERED, not 12. An agent that divides by a fixed 12, or rounds to a whole number, reports a
// different number from the instrument for most patients.
//
// **BECAUSE THE SCORE IS FRACTIONAL, THE INTEGER BAND RENDERING IS UNUSABLE, AND THIS TOOL USES HALF-OPEN
// INTERVALS.** The bands circulate two ways: intervals (0 to under 13 normal, 13 to under 23 mild, 23 to
// under 33 moderate, 33 and above severe) and integer ranges (0-12, 13-22, 23-32, 33+). Under the integer
// rendering a score of 12.5 or 22.7 falls in NO band - and such scores are ordinary here, not contrived.
// The two agree wherever both are defined, so this is not a source disagreement, just a rendering that
// cannot express a fractional score.
//
// **ONLY ITEMS 6 TO 12 ACCEPT "na". ITEMS 1 TO 5 DO NOT, AND THE TOOL REFUSES IT THERE.** The first section
// asks what the patient has EXPERIENCED, which is always answerable; the later sections ask about
// limitation in specific activities and discomfort in specific situations, which may genuinely not apply -
// someone who does not drive cannot answer about driving at night. This also makes division by zero
// structurally impossible: the denominator can never fall below 5.
//
// THE INSTRUMENT PRINTS NO NUMERIC CUT POINTS. It encodes its bands graphically only, so the numeric bands
// come from the secondary literature, and the summary says so rather than letting an agent attribute them
// to the instrument.

import * as O from '../../lib/osdi-v558.js';

export default [
  {
    id: 'osdi',
    summary: `The Ocular Surface Disease Index (OSDI; Schiffman and colleagues 2000), a 12-item PATIENT-REPORTED measure of dry-eye symptoms over THE LAST WEEK, in three sections: symptoms experienced, limitation of activities, and discomfort in particular environments. Each item is answered all of the time 4, most of the time 3, half of the time 2, some of the time 1, none of the time 0. FORMULA: OSDI = (sum of scores) x ${O.OSDI_MULTIPLIER} / (number of questions ANSWERED), range 0 to ${O.OSDI_MAX}, higher meaning greater disability. THE DENOMINATOR IS VARIABLE AND THE SCORE IS GENERALLY NOT A WHOLE NUMBER: items answered "not applicable" are excluded from BOTH the sum and the count, so the divisor is the number answered rather than 12. Twelve questions answered with a sum of 5 gives 10.4, and the instrument's own printed grid shows exactly such fractional values. Dividing by a fixed 12, or rounding to an integer, reports a different number from the instrument for most patients. BECAUSE THE SCORE IS FRACTIONAL, USE THE HALF-OPEN INTERVAL BANDS: normal from 0 to UNDER 13, mild 13 to UNDER 23, moderate 23 to UNDER 33, severe 33 OR ABOVE. An integer rendering also circulates (0 to 12, 13 to 22, 23 to 32, 33 plus) and it is UNUSABLE here, because a score of 12.5 or 22.7 falls in no band under it, and such scores are ordinary rather than contrived. The two renderings agree wherever both are defined, so this is not a source disagreement, merely a rendering that cannot express a fractional score. THE INSTRUMENT ITSELF PRINTS NO NUMERIC CUT POINTS - it encodes the bands graphically only - so the numeric bands come from the secondary literature and should not be attributed to the instrument. ONLY ITEMS 6 TO 12 ACCEPT "na", AND ITEMS 1 TO 5 DO NOT: the first section asks what the patient has EXPERIENCED and is always answerable, while the later sections ask about limitation in specific activities and discomfort in specific situations, which may genuinely not apply, since someone who does not drive cannot answer about driving at night. This also makes division by zero structurally impossible, as the denominator can never fall below ${O.MIN_DENOMINATOR}. A patient who marks every optional item not applicable is scored on five questions, and a maximum sum of 20 still gives 100. This is a SYMPTOM questionnaire. It does NOT diagnose dry eye disease, which requires symptoms TOGETHER with an objective sign such as tear break-up time, osmolarity or ocular surface staining, and symptoms and signs correlate poorly, so a high score with a normal examination and a low score with marked staining are both common and both real. Several items ask about BLURRED AND POOR VISION, which are not specific to the ocular surface and move with refractive error, cataract and retinal disease. It does not identify the causes of an irritable eye that need different management, including blepharitis, allergy, medication toxicity and contact lens problems, and it does NOT detect the red flags that make an eye urgent: pain with photophobia, vision loss, or a red eye with discharge all need examination REGARDLESS of the score. It does not select treatment.`,
    compute: O.osdi,
    fields: O.OSDI_ITEMS.map((item, i) => ({
      dom: `osdi-${item.key}`, arg: item.key, kind: 'enum',
      values: [...O.OSDI_OPTIONS.map((o) => String(o.value)),
        ...(item.allowsNotApplicable ? [O.NOT_APPLICABLE] : [])],
      required: true,
      label: `Item ${i + 1}. ${item.text} [${O.OSDI_OPTIONS.map((o) => `${o.value} = ${o.text}`).join('; ')}${item.allowsNotApplicable ? `; ${O.NOT_APPLICABLE} = not applicable, EXCLUDED from both the sum and the count` : '. This item does NOT accept "not applicable"'}]`,
    })),
  },
];
