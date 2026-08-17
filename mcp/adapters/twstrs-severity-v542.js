// spec-v542 MCP wave: adapter for the TWSTRS severity subscale in lib/twstrs-severity-v542.js. The dom keys
// mirror the browser renderer (views/group-v542.js) and META['twstrs-severity'].example: twstrs-<key> maps
// to the lib arg <key>.
//
// **THE TOOL IS NAMED AND SCOPED AS ONE SUBSCALE, AND THE SUMMARY SAYS SO REPEATEDLY.** The full TWSTRS is
// 85 points: severity 35, disability 30, pain 20. Only the severity subscale could be verified to the
// standard this catalog requires, so an agent asked for "the TWSTRS" must be told it is receiving 35 points
// of an 85-point instrument. Reporting this total as "TWSTRS 20" without the denominator would understate a
// patient by a factor of more than two.
//
// **THE PER-ITEM ENUM RANGES DIFFER, WHICH IS THE THING A SHARED VOCABULARY WOULD BREAK.** Rotation runs
// 0-4, laterocollis and sagittal deviation 0-3, the two shifts 0-1, sensory tricks 0-2, duration 0-5. A
// single 0-4 vocabulary across all ten would let an agent send a 4 for a lateral shift, which has only
// "absent" and "present". Each field publishes only its own legal values, generated from the lib.
//
// **DURATION IS DOUBLED, AND THE LABEL SAYS SO IN CAPITALS.** It is the only weighted item. An agent that
// reported the raw 0-5 rating as the item's contribution would under-count by up to five points on the item
// the scale deliberately emphasises. The result returns `durationRaw` and `durationPoints` separately so the
// doubling is auditable rather than buried in a total.
//
// **ANTEROCOLLIS AND RETROCOLLIS SHARE ONE FIELD.** They are mutually exclusive - a neck cannot be flexed
// and extended at once - so the schema offers a single sagittal-deviation item rather than two. There is no
// way for an agent to score both and reach 38.

import * as T from '../../lib/twstrs-severity-v542.js';

export default [
  {
    id: 'twstrs-severity',
    summary: `The severity (motor) subscale of the Toronto Western Spasmodic Torticollis Rating Scale for cervical dystonia (Consky and Lang 1994; motor section validated by Comella and colleagues 1997), scored out of ${T.TWSTRS_SEVERITY_MAX}. IMPORTANT SCOPE: this is ONE OF THREE SUBSCALES. The full TWSTRS is 85 points - severity 35, disability 30, and pain 20 - and only the severity subscale is implemented here, because the verbatim anchors for the disability items and the arithmetic deriving the pain-severity item each rested on a single source. Always report this result as a severity subscale out of 35, never as "the TWSTRS", or a patient will be understated by more than a factor of two. Maximal excursion contributes 0 to 12 from rotation (0-4), laterocollis (0-3), a sagittal deviation (0-3), a lateral shift (0-1) and a sagittal shift (0-1). DURATION IS RATED 0 TO 5 AND THEN DOUBLED, contributing 0 to 10; it is the only weighted item, and reporting the raw rating as its contribution would under-count by up to five points on the item the scale deliberately emphasises. Sensory tricks contribute 0-2, shoulder elevation 0-3, range of motion 0-4, and time the head can be held in neutral 0-4. Twelve plus ten plus two plus three plus four plus four is thirty-five. ANTEROCOLLIS AND RETROCOLLIS ARE MUTUALLY EXCLUSIVE and share a single sagittal-deviation field, since a neck cannot be flexed and extended at once; there is deliberately no way to score both. Note that the items have DIFFERENT ranges - a lateral shift is only absent or present - so do not assume a shared 0-4 scale. This rates the motor appearance of cervical dystonia at one moment. It does NOT diagnose cervical dystonia or distinguish it from the other causes of an abnormal head posture, including structural cervical spine disease, ocular torticollis, vestibular disorders, a drug-induced acute dystonic reaction, and in a child posterior fossa pathology, some of which are urgent. It does not measure disability or pain, which are the other two subscales and often matter more to the patient than the posture does. It is not an indication for botulinum toxin, does not select a muscle or a dose, and does not assess deep brain stimulation candidacy.`,
    compute: T.twstrsSeverity,
    fields: T.TWSTRS_ITEMS.map((item) => ({
      dom: `twstrs-${item.key}`,
      arg: item.key,
      kind: 'enum',
      values: item.options.map((o) => o.value),
      required: true,
      label: `${item.text} [${item.options.map((o) => o.text).join('; ')}]`,
    })),
  },
];
