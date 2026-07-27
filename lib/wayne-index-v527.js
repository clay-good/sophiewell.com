// spec-v527: the Wayne index for the clinical diagnosis of thyrotoxicosis. Zero-hit before this tile:
// "wayne", "crooks", "thyrotoxicosis", and "hyperthyroid" across corpus.json, app.js, and lib/meta.js.
//
// A DIFFERENT AXIS FROM THE EXISTING burch-wartofsky TILE. Burch-Wartofsky grades THYROID STORM -- a
// life-threatening decompensation in someone already known to be thyrotoxic, and it answers "how sick is
// this patient right now". The Wayne index answers a diagnostic question instead: "does this patient's
// examination look thyrotoxic at all". A patient can have a Wayne index deep in the toxic range and a
// Burch-Wartofsky score of nearly nothing. Neither substitutes for the other.
//
// THE WEIGHTS ARE SIGNED, AND SEVERAL ARE NEGATIVE. This is the thing implementations get wrong. Preferring
// heat scores MINUS 5. An absent palpable thyroid scores MINUS 3, not 0. Absent hyperkinesis scores MINUS 2.
// A pulse below 80 scores MINUS 3. An implementation that treats every item as "present adds points, absent
// adds nothing" turns a euthyroid patient's protective negative findings into a neutral zero and pushes the
// total up, which is the direction that produces false positives. Every negative weight is carried
// explicitly here and pinned by a test.
//
// THREE ITEMS ARE THREE-WAY, NOT YES/NO, because the source gives them opposite-signed alternatives that
// cannot both be true: temperature preference (heat -5 / neither 0 / cold +5), appetite (increased +3 /
// unchanged 0 / decreased -3), and weight (increased -3 / unchanged 0 / decreased +3). Modeling those as two
// independent checkboxes would let a caller select both and score an impossible combination.
//
// PULSE IS ONE ITEM WITH THREE BANDS, not two separate rows: below 80 scores -3, 80 to 90 scores 0, above 90
// scores +3. The source prints it as two rows ("only if absent: >80/min, -3" and "only if present: >90/min,
// +3"), which reads as two items but is one.
//
// THE TOTAL RANGE IS COMPUTED FROM THE WEIGHT TABLE RATHER THAN ASSERTED. Secondary sources state the range
// as "+45 to -25"; summing the table as printed gives a floor of -24. Rather than repeat either number on
// authority, this module derives both ends from ITEM_WEIGHTS at load time, so the range the tile reports is
// necessarily the range the tile can actually produce, and a test asserts the derivation.
//
// HIGH-STAKES AND HISTORICALLY SITUATED: the Wayne index was published in 1959, BEFORE sensitive TSH assays
// existed, precisely because the clinical diagnosis was unreliable and something better than gestalt was
// needed. Thyrotoxicosis today is diagnosed BIOCHEMICALLY. This index is not a substitute for TSH and free
// T4, does not identify the CAUSE (Graves disease, toxic nodular goiter, thyroiditis, exogenous thyroid
// hormone) which changes management entirely, and is not an indication to start an antithyroid drug, a beta
// blocker, radioiodine, or surgery (spec-v11 section 5.3). It performs worst exactly where it would be most
// useful -- subclinical and mild disease, and older patients, whose apathetic presentation lacks the
// hyperkinesis and sweating the index rewards. A toxic score does not establish thyrotoxicosis and a
// euthyroid score does not exclude it. The diagnosis stays with the clinician and the laboratory.
//
// ITEMS, SIGNED WEIGHTS, AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// complete reproductions of the table that agree cell for cell, including every negative weight, the pulse
// bands, and the absence of a tremor item (some secondary web sources add one; both full tables refute it):
//   - Crooks J, Murray IPC, Wayne EJ. Statistical methods applied to the clinical diagnosis of
//     thyrotoxicosis. Q J Med. 1959;28(110):211-234.
//   - Two independently published full renderings of the Crooks-Murray-Wayne table in the endocrine and
//     surgical literature.

// Each entry: the item, its options, and the signed points each option contributes.
export const WAYNE_SYMPTOMS = [
  { key: 'dyspnea', text: 'Dyspnea on effort', options: [['no', 'No', 0], ['yes', 'Yes', 1]] },
  { key: 'palpitations', text: 'Palpitations', options: [['no', 'No', 0], ['yes', 'Yes', 2]] },
  { key: 'tiredness', text: 'Tiredness', options: [['no', 'No', 0], ['yes', 'Yes', 2]] },
  {
    key: 'temperature',
    text: 'Temperature preference',
    options: [['heat', 'Prefers heat', -5], ['neither', 'Neither', 0], ['cold', 'Prefers cold', 5]],
  },
  { key: 'sweating', text: 'Excessive sweating', options: [['no', 'No', 0], ['yes', 'Yes', 3]] },
  { key: 'nervousness', text: 'Nervousness', options: [['no', 'No', 0], ['yes', 'Yes', 2]] },
  {
    key: 'appetite',
    text: 'Appetite',
    options: [['decreased', 'Decreased', -3], ['unchanged', 'Unchanged', 0], ['increased', 'Increased', 3]],
  },
  {
    key: 'weight',
    text: 'Weight',
    options: [['increased', 'Increased', -3], ['unchanged', 'Unchanged', 0], ['decreased', 'Decreased', 3]],
  },
];

export const WAYNE_SIGNS = [
  { key: 'thyroid', text: 'Palpable thyroid', options: [['no', 'Absent', -3], ['yes', 'Present', 3]] },
  { key: 'bruit', text: 'Bruit over the thyroid', options: [['no', 'Absent', -2], ['yes', 'Present', 2]] },
  { key: 'exophthalmos', text: 'Exophthalmos', options: [['no', 'Absent', 0], ['yes', 'Present', 2]] },
  { key: 'lidRetraction', text: 'Lid retraction', options: [['no', 'Absent', 0], ['yes', 'Present', 2]] },
  { key: 'lidLag', text: 'Lid lag', options: [['no', 'Absent', 0], ['yes', 'Present', 1]] },
  { key: 'hyperkinesis', text: 'Hyperkinesis', options: [['no', 'Absent', -2], ['yes', 'Present', 4]] },
  { key: 'handsHot', text: 'Hands hot', options: [['no', 'Absent', -2], ['yes', 'Present', 2]] },
  { key: 'handsMoist', text: 'Hands moist', options: [['no', 'Absent', -1], ['yes', 'Present', 1]] },
  { key: 'af', text: 'Atrial fibrillation', options: [['no', 'Absent', 0], ['yes', 'Present', 4]] },
  {
    key: 'pulse',
    text: 'Casual pulse rate',
    options: [['under80', 'Below 80/min', -3], ['80to90', '80 to 90/min', 0], ['over90', 'Above 90/min', 3]],
  },
];

export const WAYNE_ITEMS = [...WAYNE_SYMPTOMS, ...WAYNE_SIGNS];

// Derived from the table above rather than asserted, so the reported range is necessarily the range the
// tile can produce. Secondary sources state "+45 to -25"; the table as printed floors at -24.
export const WAYNE_RANGE = WAYNE_ITEMS.reduce(
  (acc, item) => {
    const points = item.options.map((o) => o[2]);
    return { min: acc.min + Math.min(...points), max: acc.max + Math.max(...points) };
  },
  { min: 0, max: 0 },
);

const TOXIC_ABOVE = 19;
const EUTHYROID_BELOW = 11;

const NOTE = 'The Wayne index (Crooks, Murray and Wayne 1959) scores eight symptoms and ten signs with signed weights and reads the total as above 19 toxic, 11 to 19 equivocal, and below 11 euthyroid. Several weights are negative and that is the point of the instrument: preferring heat scores minus 5, an absent palpable thyroid minus 3, absent hyperkinesis minus 2, and a pulse below 80 minus 3, so an implementation that treats absent findings as zero inflates the total toward a false positive. Temperature preference, appetite, and weight are three-way items with opposite-signed alternatives rather than checkboxes, and the casual pulse is one item with three bands rather than two. The index was published in 1959, before sensitive TSH assays existed, precisely because clinical diagnosis was unreliable. Thyrotoxicosis today is diagnosed biochemically: this is not a substitute for TSH and free T4, it does not identify the cause, whether Graves disease, toxic nodular goiter, thyroiditis, or exogenous thyroid hormone, which changes management entirely, and it is not an indication to start an antithyroid drug, a beta blocker, radioiodine, or surgery. It performs worst where it would be most useful, in subclinical and mild disease and in older patients whose apathetic presentation lacks the hyperkinesis and sweating the index rewards. A toxic score does not establish thyrotoxicosis and a euthyroid score does not exclude it. It also grades a different question from the Burch-Wartofsky score, which grades thyroid storm in someone already known to be thyrotoxic.';

function readItem(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const key = String(raw).trim().toLowerCase();
  const option = item.options.find((o) => o[0].toLowerCase() === key);
  return option ? option[2] : NaN;
}

// input: one key per entry in WAYNE_ITEMS, each set to one of that item's option values.
export function wayneIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = WAYNE_ITEMS.map((item) => ({ item, points: readItem(item, o[item.key]) }));

  const missing = scored.filter((s) => s.points === null);
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.map((s) => s.item.text).join(', ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.points));
  if (bad.length) {
    return { valid: false, message: `Unrecognized answer for: ${bad.map((s) => s.item.text).join(', ')}.` };
  }

  const symptomTotal = scored.filter((s) => WAYNE_SYMPTOMS.includes(s.item)).reduce((a, s) => a + s.points, 0);
  const signTotal = scored.filter((s) => WAYNE_SIGNS.includes(s.item)).reduce((a, s) => a + s.points, 0);
  const total = symptomTotal + signTotal;

  let reading;
  if (total > TOXIC_ABOVE) reading = 'toxic';
  else if (total >= EUTHYROID_BELOW) reading = 'equivocal';
  else reading = 'euthyroid';

  const negatives = scored.filter((s) => s.points < 0);

  return {
    valid: true,
    total,
    symptomTotal,
    signTotal,
    reading,
    negativePoints: negatives.reduce((a, s) => a + s.points, 0),
    bandLabel: `Wayne index ${total} (${reading})`,
    band: `Wayne index ${total}: ${reading} range (above 19 toxic, 11 to 19 equivocal, below 11 euthyroid). ${symptomTotal} from the symptoms and ${signTotal} from the signs, on a scale that runs ${WAYNE_RANGE.min} to ${WAYNE_RANGE.max}. A clinical index, not a thyroid function test.`,
    note: NOTE,
  };
}
