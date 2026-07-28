// spec-v542: the severity (motor) subscale of the Toronto Western Spasmodic Torticollis Rating Scale
// (TWSTRS), for cervical dystonia. WHOLE-CONCEPT GAP: "twstrs", "torticollis", "dystonia", "consky",
// "laterocollis", and "cervical dystonia" were ALL zero-hit across corpus.json, app.js, and lib/meta.js. The
// catalog's movement-disorder tiles (Hoehn-Yahr, Schwab and England, Simpson-Angus, AIMS) are all
// parkinsonian or drug-induced; dystonia was uncovered entirely.
//
// **THIS TILE SCORES THE SEVERITY SUBSCALE ONLY, AND SAYS SO, BECAUSE THAT IS WHAT COULD BE VERIFIED.** The
// full TWSTRS is severity 0-35 plus disability 0-30 plus pain 0-20, for a total of 0-85. The subscale
// maxima and every severity item and range were double-confirmed. The verbatim anchors for the six
// disability items, and the arithmetic by which the pain-severity item is derived, were NOT: each rested on
// a single source. Shipping a "TWSTRS total" built on half-verified halves would produce a number that looks
// like the published instrument and is not it, so the tile scores severity, reports it out of 35, and states
// plainly that it is one of three subscales.
//
// THE SEVERITY SUBSCALE, WHICH SUMS TO EXACTLY 35:
//   A  maximal excursion, subtotal 0-12
//        rotation 0-4, laterocollis 0-3, anterocollis OR retrocollis 0-3, lateral shift 0-1, sagittal shift 0-1
//   B  duration 0-5, WEIGHTED x2 -> 0-10
//   C  effect of sensory tricks 0-2
//   D  shoulder elevation or anterior displacement 0-3
//   E  range of motion 0-4
//   F  time head can be held in neutral 0-4
//   12 + 10 + 2 + 3 + 4 + 4 = 35. That arithmetic is itself a check on the item ranges, and a test asserts it.
//
// **DURATION IS THE ONLY WEIGHTED ITEM.** It is rated 0-5 and then DOUBLED. An implementation that summed it
// raw would cap the subscale at 30 instead of 35 and would systematically under-weight the item the scale
// deliberately emphasises: how much of the time the patient is actually dystonic. The tile stores the raw
// rating and the weighted contribution separately so the doubling is visible rather than buried.
//
// **ANTEROCOLLIS AND RETROCOLLIS ARE MUTUALLY EXCLUSIVE.** A neck cannot be flexed and extended at once, so
// the scale offers them as one 0-3 slot with a direction, not as two additive items. Scoring both would push
// the excursion subtotal to 15 and the subscale to 38. This tile takes a single sagittal-deviation item with
// a direction, which makes the exclusivity structural rather than a rule the user has to remember.
//
// HIGH-STAKES: this rates the MOTOR appearance of cervical dystonia at one moment. It does not diagnose
// cervical dystonia or distinguish it from the many other causes of an abnormal head posture, including
// structural cervical spine disease, ocular torticollis, vestibular disorders, drug-induced acute dystonic
// reaction, and, in a child, posterior fossa pathology -- some of which are urgent and none of which this
// scale can see. It does not measure disability or pain, which are the other two subscales and often matter
// more to the patient than the posture does. It is not an indication for botulinum toxin, does not select a
// muscle or a dose, and does not assess deep brain stimulation candidacy (spec-v11 section 5.3). The
// clinical decision stays with the clinician.
//
// ITEMS AND RANGES RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independently hosted copies
// of the rating form that agree on every item and range, with the sum-to-35 check as corroboration:
//   - Consky ES, Lang AE. Clinical assessments of patients with cervical dystonia. In: Jankovic J, Hallett M,
//     eds. Therapy with Botulinum Toxin. New York: Marcel Dekker; 1994:211-237.
//   - Comella CL, Stebbins GT, Goetz CG, et al. Teaching tape for the motor section of the Toronto Western
//     Spasmodic Torticollis Scale. Mov Disord. 1997;12(4):570-575.

const opt = (value, text) => ({ value: String(value), text: `${value} - ${text}` });

export const TWSTRS_ITEMS = [
  {
    key: 'rotation', group: 'excursion', text: 'Rotation (turning to left or right)', max: 4,
    options: [opt(0, 'None'), opt(1, 'Slight (1 to 22 degrees)'), opt(2, 'Mild (23 to 45 degrees)'),
      opt(3, 'Moderate (46 to 67 degrees)'), opt(4, 'Severe (68 to 90 degrees)')],
  },
  {
    key: 'laterocollis', group: 'excursion', text: 'Laterocollis (tilt to the shoulder), excluding shoulder elevation', max: 3,
    options: [opt(0, 'None'), opt(1, 'Mild (1 to 15 degrees)'), opt(2, 'Moderate (16 to 35 degrees)'),
      opt(3, 'Severe (more than 35 degrees)')],
  },
  {
    key: 'sagittalDeviation', group: 'excursion',
    text: 'Sagittal deviation — anterocollis OR retrocollis. These are mutually exclusive and share one slot; a neck cannot be flexed and extended at once.',
    max: 3,
    options: [opt(0, 'None'), opt(1, 'Mild downward or backward deviation of the chin'),
      opt(2, 'Moderate deviation, about half the possible range'),
      opt(3, 'Severe (chin reaches chest, or full backward deviation)')],
  },
  {
    key: 'lateralShift', group: 'excursion', text: 'Lateral shift', max: 1,
    options: [opt(0, 'Absent'), opt(1, 'Present')],
  },
  {
    key: 'sagittalShift', group: 'excursion', text: 'Sagittal shift', max: 1,
    options: [opt(0, 'Absent'), opt(1, 'Present')],
  },
  {
    key: 'duration', group: 'duration', weight: 2,
    text: 'Duration of the deviation. THIS ITEM IS RATED 0 to 5 AND THEN DOUBLED, contributing 0 to 10.',
    max: 5,
    options: [opt(0, 'None'), opt(1, 'Occasional deviation, under 25 percent of the time, most often submaximal'),
      opt(2, 'Occasional under 25 percent most often maximal, or intermittent 25 to 50 percent most often submaximal'),
      opt(3, 'Intermittent 25 to 50 percent often maximal, or frequent 50 to 75 percent most often submaximal'),
      opt(4, 'Frequent 50 to 75 percent most often maximal, or constant over 75 percent most often submaximal'),
      opt(5, 'Constant deviation over 75 percent of the time, often maximal')],
  },
  {
    key: 'sensoryTricks', group: 'other', text: 'Effect of sensory tricks', max: 2,
    options: [opt(0, 'Complete relief'), opt(1, 'Partial or only limited relief'), opt(2, 'Little or no benefit')],
  },
  {
    key: 'shoulderElevation', group: 'other', text: 'Shoulder elevation or anterior displacement', max: 3,
    options: [opt(0, 'Absent'),
      opt(1, 'Mild (under a third of the possible range), intermittent or moderate and intermittent'),
      opt(2, 'Moderate (a third to two thirds of the range) and constant over 75 percent of the time, or severe (over two thirds) and intermittent'),
      opt(3, 'Severe and constant')],
  },
  {
    key: 'rangeOfMotion', group: 'other', text: 'Range of motion, without sensory tricks', max: 4,
    options: [opt(0, 'Able to move to the extreme opposite position'),
      opt(1, 'Well past midline but not to the extreme opposite position'), opt(2, 'Barely past midline'),
      opt(3, 'Toward but not past midline'), opt(4, 'Barely able to move the head beyond the abnormal posture')],
  },
  {
    key: 'time', group: 'other', text: 'Time the head can be held in neutral, without sensory tricks', max: 4,
    options: [opt(0, 'More than 60 seconds'), opt(1, '46 to 60 seconds'), opt(2, '31 to 45 seconds'),
      opt(3, '16 to 30 seconds'), opt(4, 'Under 15 seconds')],
  },
];

// Derived, so the reported maximum is necessarily the maximum the tile can produce.
export const TWSTRS_SEVERITY_MAX = TWSTRS_ITEMS.reduce((a, i) => a + i.max * (i.weight || 1), 0);

const NOTE = 'The Toronto Western Spasmodic Torticollis Rating Scale severity subscale (Consky and Lang 1994; motor section validated by Comella and colleagues 1997) rates the motor appearance of cervical dystonia out of 35. This tile scores the SEVERITY subscale only. The full TWSTRS is severity out of 35 plus disability out of 30 plus pain out of 20, for a total of 85, but the verbatim anchors for the disability items and the arithmetic deriving the pain-severity item each rested on a single source, so they are not implemented here rather than shipping a total that looks like the published instrument without being it. Within the severity subscale, maximal excursion contributes 0 to 12 from rotation, laterocollis, a sagittal deviation, and lateral and sagittal shifts; duration contributes 0 to 10; and sensory tricks, shoulder elevation, range of motion, and time contribute 2, 3, 4 and 4. Duration is the only weighted item: it is rated 0 to 5 and then doubled, so summing it raw would cap the subscale at 30 instead of 35 and under-weight how much of the time the patient is actually dystonic. Anterocollis and retrocollis are mutually exclusive and share one slot, since a neck cannot be flexed and extended at once; scoring both would push the subscale to 38. This rates the motor appearance at one moment. It does not diagnose cervical dystonia or distinguish it from the other causes of an abnormal head posture, including structural cervical spine disease, ocular torticollis, vestibular disorders, a drug-induced acute dystonic reaction, and in a child posterior fossa pathology, some of which are urgent. It does not measure disability or pain, which are the other two subscales and often matter more to the patient than the posture does. It is not an indication for botulinum toxin, does not select a muscle or a dose, and does not assess deep brain stimulation candidacy.';

function readItem(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > item.max) return NaN;
  return n;
}

// input: one key per entry in TWSTRS_ITEMS, each within that item's own range.
export function twstrsSeverity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = TWSTRS_ITEMS.map((item) => ({ item, raw: readItem(item, o[item.key]) }));
  const missing = scored.filter((s) => s.raw === null);
  if (missing.length) {
    return { valid: false, message: `Score every item. Still needed: ${missing.map((s) => s.item.key).join(', ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.raw));
  if (bad.length) {
    const detail = bad.map((s) => `${s.item.key} (0 to ${s.item.max})`).join('; ');
    return { valid: false, message: `Each item must be a whole number within its own range. Out of range: ${detail}.` };
  }

  const contributions = scored.map((s) => ({
    key: s.item.key,
    raw: s.raw,
    weight: s.item.weight || 1,
    points: s.raw * (s.item.weight || 1),
  }));

  const total = contributions.reduce((a, c) => a + c.points, 0);
  const excursionSubtotal = contributions
    .filter((c) => TWSTRS_ITEMS.find((i) => i.key === c.key).group === 'excursion')
    .reduce((a, c) => a + c.points, 0);
  const durationContribution = contributions.find((c) => c.key === 'duration');

  return {
    valid: true,
    total,
    max: TWSTRS_SEVERITY_MAX,
    excursionSubtotal,
    durationRaw: durationContribution.raw,
    durationPoints: durationContribution.points,
    contributions,
    bandLabel: `TWSTRS severity ${total} of ${TWSTRS_SEVERITY_MAX}`,
    band: `TWSTRS severity subscale ${total} of ${TWSTRS_SEVERITY_MAX}. Maximal excursion contributed ${excursionSubtotal} of 12; duration was rated ${durationContribution.raw} of 5 and doubled to ${durationContribution.points} of 10. This is the severity subscale ALONE — the full TWSTRS also has a disability subscale out of 30 and a pain subscale out of 20, which this tile does not score. It rates motor appearance: it does not diagnose cervical dystonia, does not measure disability or pain, and is not an indication for botulinum toxin.`,
    note: NOTE,
  };
}
