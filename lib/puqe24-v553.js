// spec-v553: the PUQE-24 (Pregnancy-Unique Quantification of Emesis and nausea, 24-hour version).
// "puqe", "emesis", "hyperemesis", "koren" and "motherisk" were all zero-hit across corpus.json, app.js and
// lib/meta.js. The "nausea" hits are unrelated prose in other tiles' symptom lists.
//
// THREE ITEMS -- NAUSEA HOURS, VOMITING EPISODES, RETCHING EPISODES -- EACH 1 TO 5, OVER THE LAST 24 HOURS.
//
// **THE TOTAL RUNS 3 TO 15, NOT 0 TO 15, AND THERE IS NO ZERO STATE.** Every item has a MINIMUM of 1 point,
// which is the "not at all" answer. A woman with no nausea, no vomiting and no retching scores 3. A reader
// who assumes a floor of 0 will read 3 as a mild burden rather than as the complete absence of symptoms,
// and will mis-scale every comparison. The source says so directly: a value of 3 means no nausea, vomiting
// or retching, and it is therefore not meaningful to construct an even lower category.
//
// **THE BAND LABEL AT THE BOTTOM OF THE SCALE DIVERGES BETWEEN RENDERINGS, AND THIS TILE DISCLOSES IT AT
// THE BOUNDARY RATHER THAN PICKING SILENTLY.** The NUMERIC boundaries are identical in every source: 7 and
// 13. What differs is only the labelling of the lowest range. The instrument's own figure labels 6 or less
// as "mild", making 3 a mild score; other renderings split the same range into 3 for "no nausea and
// vomiting of pregnancy" and 4 to 6 for "mild". This lib follows the instrument's own figure, so 3 to 6 is
// mild, and adds the alternative reading to the result WHEN THE TOTAL IS 3 -- the only value where the two
// conventions disagree about what to call the patient. Claiming 3 is both "mild" and "no NVP" at once, or
// choosing one without saying so, are both worse than stating the divergence where it changes the answer.
//
// **THE WELL-BEING QUESTION IS NOT PART OF THE TOTAL, AND IT RUNS IN THE OPPOSITE DIRECTION.** The form
// asks the patient to rate her well-being from 0, the worst possible, to 10, as good as she felt before
// pregnancy. HIGHER IS BETTER on that item while HIGHER IS WORSE on the PUQE score. Adding it to the total
// would both corrupt the score and invert the contribution, so this lib takes it as an optional separate
// input, reports it separately, and never sums it.
//
// HIGH-STAKES: this quantifies SYMPTOM SEVERITY over 24 hours. It does NOT diagnose hyperemesis gravidarum,
// which is a clinical diagnosis involving weight loss, dehydration and electrolyte or ketone disturbance
// that this instrument does not measure -- a high score supports the picture but does not establish it, and
// a woman can be severely dehydrated at a moderate score. It does not exclude the other causes of vomiting
// in pregnancy, some of which are urgent and unrelated to pregnancy at all. It does not select an
// antiemetic, decide on admission or intravenous fluids, or indicate any treatment (spec-v11 section 5.3).
// The care decision stays with the clinician.
//
// ITEMS, ANSWER OPTIONS, POINT VALUES AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97). All fifteen answer
// options and all fifteen point values agree exactly between two independent reproductions of the form:
//   - Koren G, Boskovic R, Hard M, Maltepe C, Navioz Y, Einarson A. Motherisk-PUQE (pregnancy-unique
//     quantification of emesis and nausea) scoring system for nausea and vomiting of pregnancy.
//     Am J Obstet Gynecol. 2002;186(5 Suppl):S228-S231.
//   - Birkeland E, Stokke G, Tangvik RJ, et al. Norwegian PUQE identifies patients with hyperemesis
//     gravidarum and poor nutritional intake. PLoS One. 2015;10(4):e0119962, whose Figure 1 reproduces the
//     form with permission, and an independent clinical reproduction of the same form.

export const PUQE_ITEMS = [
  {
    key: 'nauseaHours',
    text: 'In the last 24 hours, for how long have you felt nauseated or sick to your stomach?',
    options: [
      { value: 1, text: 'Not at all' },
      { value: 2, text: '1 hour or less' },
      { value: 3, text: '2 to 3 hours' },
      { value: 4, text: '4 to 6 hours' },
      { value: 5, text: 'More than 6 hours' },
    ],
  },
  {
    key: 'vomiting',
    text: 'In the last 24 hours, how many times have you vomited or thrown up?',
    options: [
      { value: 1, text: 'Not at all' },
      { value: 2, text: '1 to 2 times' },
      { value: 3, text: '3 to 4 times' },
      { value: 4, text: '5 to 6 times' },
      { value: 5, text: '7 or more times' },
    ],
  },
  {
    key: 'retching',
    text: 'In the last 24 hours, how many times have you had retching or dry heaves without bringing anything up?',
    options: [
      { value: 1, text: 'Not at all' },
      { value: 2, text: '1 to 2 times' },
      { value: 3, text: '3 to 4 times' },
      { value: 4, text: '5 to 6 times' },
      { value: 5, text: '7 or more times' },
    ],
  },
];

export const PUQE_MIN = 3;
export const PUQE_MAX = 15;

const BANDS = [
  { max: 6, label: 'Mild', text: 'Mild nausea and vomiting of pregnancy, defined as a score of 6 or less.' },
  { max: 12, label: 'Moderate', text: 'Moderate nausea and vomiting of pregnancy, defined as 7 to 12.' },
  { max: PUQE_MAX, label: 'Severe', text: 'Severe nausea and vomiting of pregnancy, defined as 13 or more.' },
];

const FLOOR_TEXT = 'This is the LOWEST POSSIBLE score. Each of the three items has a minimum of 1 point, so the scale runs 3 to 15 and there is no zero: a score of 3 means no nausea, no vomiting and no retching at all. The instrument’s own figure labels 6 or less as mild, which is the convention used here, while some renderings instead label 3 separately as no nausea and vomiting of pregnancy and reserve mild for 4 to 6. The numeric band boundaries at 7 and 13 are identical in every source; only the name for this one value differs.';

const WELLBEING_TEXT = 'Well-being is reported separately and is NOT part of the total. It runs in the OPPOSITE direction to the score: 0 is the worst possible and 10 is as good as the patient felt before pregnancy, so higher is better on this item while higher is worse on the PUQE score.';

const NOTE = 'The PUQE-24 (Koren and colleagues 2002) quantifies nausea and vomiting of pregnancy over the last 24 hours with three items: hours of nausea, episodes of vomiting, and episodes of retching or dry heaves without bringing anything up. Each item scores 1 to 5, so the total runs from 3 to 15 and there is no zero state: every item has a minimum of 1 point, and a score of 3 means no nausea, no vomiting and no retching at all, which the source notes makes a lower category meaningless. A reader who assumes a floor of 0 will read 3 as a mild symptom burden rather than as the complete absence of symptoms. The bands are 6 or less mild, 7 to 12 moderate, and 13 or more severe. The numeric boundaries at 7 and 13 are identical across sources, but the label at the bottom of the scale diverges: the instrument’s own figure calls 6 or less mild, which is the convention used here, while other renderings label 3 separately as no nausea and vomiting of pregnancy and reserve mild for 4 to 6. That divergence is reported at a score of 3, the only value where the conventions disagree. The form also asks the patient to rate her well-being from 0, the worst possible, to 10, as good as she felt before pregnancy. That item is NOT part of the total and runs in the opposite direction, higher being better where a higher PUQE score is worse, so adding it would both corrupt the score and invert the contribution. This quantifies symptom severity over 24 hours. It does not diagnose hyperemesis gravidarum, which is a clinical diagnosis involving weight loss, dehydration and electrolyte or ketone disturbance that this instrument does not measure, so a high score supports the picture without establishing it and a woman can be severely dehydrated at a moderate score. It does not exclude the other causes of vomiting in pregnancy, some of which are urgent and unrelated to pregnancy. It does not select an antiemetic, decide on admission or intravenous fluids, or indicate any treatment.';

function readItem(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 1 || n > 5) return NaN;
  return n;
}

// input:
//   nauseaHours, vomiting, retching -- each 1-5. All three required.
//   wellbeing -- optional, 0-10. Reported separately, NEVER summed, and higher is better.
export function puqe24(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = PUQE_ITEMS.map((item) => ({ item, points: readItem(item, o[item.key]) }));

  const missing = scored.filter((s) => s.points === null);
  if (missing.length) {
    return { valid: false, message: `Answer all three items, each 1 to 5. Note that 1 is "not at all", so there is no zero. Still needed: ${missing.map((s) => s.item.key).join(', ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.points));
  if (bad.length) {
    return { valid: false, message: `Each item must be a whole number from 1 to 5. The scale has no zero: 1 means "not at all". Unrecognized: ${bad.map((s) => s.item.key).join(', ')}.` };
  }

  const total = scored.reduce((a, s) => a + s.points, 0);
  const band = BANDS.find((b) => total <= b.max);
  const atFloor = total === PUQE_MIN;

  let wellbeing = null;
  const rawWellbeing = o.wellbeing;
  if (rawWellbeing !== '' && rawWellbeing !== null && rawWellbeing !== undefined) {
    const n = Number(String(rawWellbeing).trim());
    if (!Number.isInteger(n) || n < 0 || n > 10) {
      return { valid: false, message: 'Well-being must be a whole number from 0 to 10, where 0 is the worst possible and 10 is as good as before pregnancy. It is reported separately and is never added to the score.' };
    }
    wellbeing = n;
  }

  return {
    valid: true,
    total,
    min: PUQE_MIN,
    max: PUQE_MAX,
    band: band.label,
    atFloor,
    wellbeing,
    bandLabel: `PUQE-24 ${total} of ${PUQE_MAX}, ${band.label.toLowerCase()}`,
    bandText: `PUQE-24 ${total} (range ${PUQE_MIN} to ${PUQE_MAX}). ${band.text}${atFloor ? ` ${FLOOR_TEXT}` : ''}${wellbeing === null ? '' : ` Well-being ${wellbeing} of 10. ${WELLBEING_TEXT}`} This measures symptom severity over 24 hours and does not diagnose hyperemesis gravidarum, which involves weight loss, dehydration and electrolyte disturbance that this does not measure.`,
    note: NOTE,
  };
}
