// spec-v611: the Fried frailty phenotype (Cardiovascular Health Study, 2001). A PREDECESSOR gap of the
// clearest kind: the catalog already carries FOUR instruments derived from or simplified out of this one
// (`frail-scale`, `sof-frailty-index`, `prisma-7`, `groningen-frailty-indicator`) and the original was
// missing. Every slug spelling returned 0 - the `fried` prose hits were all "Friedman" and "Friedewald".
//
// **THE GRIP-STRENGTH CUT-POINT RISES WITH BMI: A HEAVIER PERSON MUST SQUEEZE HARDER TO AVOID BEING CALLED
// WEAK.** A man with a BMI of 24 or below is weak at 29 kg or less; a man above 28 is weak at 32 kg or less.
// This reads backwards at first glance and is correct - grip scales with body mass, so a fixed threshold
// would call heavy people strong and light people weak.
//
// **THE MEN'S TABLE HAS FOUR BMI BANDS BUT ONLY THREE DISTINCT CUT-POINTS.** The 24.1-26 and 26.1-28 bands
// both cut at 30 kg. That is not a transcription error; a test asserts it.
//
// **SLOWNESS IS A TIME OVER 15 FEET, NOT A SPEED, AND SEX ENTERS ONLY THROUGH THE HEIGHT THRESHOLD.** The
// times are identical for both sexes - 7 seconds or more if shorter, 6 seconds or more if taller - and the
// only thing that differs is where "shorter" ends: 173 cm for men, 159 cm for women. Renderings that convert
// the same 6 seconds into metres per second disagree with each other (0.8 against 0.76) purely by rounding,
// which is why this lib keeps the published TIMES and does not convert.
//
// **WEIGHT LOSS HAS TWO ALTERNATIVE DEFINITIONS AND EITHER ONE SATISFIES IT**: more than 10 pounds lost
// unintentionally in the last year, OR a measured loss of 5% or more of the previous year's body weight.
//
// **LOW ACTIVITY WAS DEFINED AS THE LOWEST QUINTILE BY SEX**, and the familiar numbers - under 383 kcal per
// week for men, under 270 for women - are that quintile's values IN THE DERIVATION COHORT. They are
// cohort-specific, not universal constants, and this lib says so rather than presenting them as fixed law.
//
// **THREE OF THE FIVE CRITERIA NEED EQUIPMENT OR A QUESTIONNAIRE** - a dynamometer, a timed walk, and the
// Minnesota Leisure Time Activity Questionnaire. It is not a bedside checklist, which is precisely why the
// simplified derivatives already in this catalog exist.
//
// **PRE-FRAIL IS ONE OR TWO CRITERIA AND IS ITS OWN CATEGORY**, not "nearly frail". Frail is three or more;
// robust is none.
//
// HIGH-STAKES: this classifies a phenotype. It does NOT diagnose any disease, does NOT measure disability or
// comorbidity - which the original work is explicit are distinct from frailty - does NOT decide whether
// someone can have an operation, and does NOT set a care plan (spec-v11 section 5.3).
//
// CRITERIA, CUT-POINTS AND CLASSIFICATION RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97). All
// eight grip values, both height thresholds and both walk times matched exactly across two independent
// sources:
//   - Fried LP, Tangen CM, Walston J, et al. Frailty in older adults: evidence for a phenotype.
//     J Gerontol A Biol Sci Med Sci. 2001;56(3):M146-M156.

export const CRITERIA = [
  { key: 'weightLoss', text: 'Unintentional weight loss - more than 10 pounds in the last year, OR a measured loss of 5% or more of the previous year weight' },
  { key: 'exhaustion', text: 'Exhaustion - a positive answer to either CES-D statement: "I felt that everything I did was an effort" or "I could not get going", in the last week' },
  { key: 'weakness', text: 'Weakness - grip strength at or below the cut-point for the patient sex and BMI' },
  { key: 'slowness', text: 'Slowness - time to walk 15 feet at or above the cut-point for the patient sex and height' },
  { key: 'lowActivity', text: 'Low physical activity - lowest quintile of weekly kilocalories by sex on the Minnesota Leisure Time Activity Questionnaire' },
];

export const GRIP_CUTOFFS = {
  male: [
    { maxBmi: 24, kg: 29 },
    { maxBmi: 26, kg: 30 },
    { maxBmi: 28, kg: 30 },
    { maxBmi: Infinity, kg: 32 },
  ],
  female: [
    { maxBmi: 23, kg: 17 },
    { maxBmi: 26, kg: 17.3 },
    { maxBmi: 29, kg: 18 },
    { maxBmi: Infinity, kg: 21 },
  ],
};

// The TIMES are the same for both sexes; only the height threshold differs.
export const WALK_SECONDS_SHORTER = 7;
export const WALK_SECONDS_TALLER = 6;
export const WALK_HEIGHT_THRESHOLD_CM = { male: 173, female: 159 };
export const WALK_DISTANCE = '15 feet';

export const ACTIVITY_KCAL_PER_WEEK = { male: 383, female: 270 };

export const BANDS = [
  { max: 0, label: 'Robust', text: 'No criteria met: robust.' },
  { max: 2, label: 'Pre-frail', text: 'One or two criteria met: pre-frail - its own category, not "nearly frail".' },
  { max: 5, label: 'Frail', text: 'Three or more criteria met: frail.' },
];

// Both lookups return null rather than throwing for a sex or measurement they cannot read.
export function gripCutoffKg(sex, bmi) {
  const table = Object.prototype.hasOwnProperty.call(GRIP_CUTOFFS, sex) ? GRIP_CUTOFFS[sex] : null;
  const n = Number(bmi);
  if (!table || !Number.isFinite(n)) return null;
  return table.find((row) => n <= row.maxBmi).kg;
}

export function walkCutoffSeconds(sex, heightCm) {
  const threshold = Object.prototype.hasOwnProperty.call(WALK_HEIGHT_THRESHOLD_CM, sex)
    ? WALK_HEIGHT_THRESHOLD_CM[sex] : null;
  const n = Number(heightCm);
  if (threshold === null || !Number.isFinite(n)) return null;
  return n <= threshold ? WALK_SECONDS_SHORTER : WALK_SECONDS_TALLER;
}

export const GRIP_NOTE = `THE GRIP-STRENGTH CUT-POINT RISES WITH BMI, so a heavier person must squeeze harder to avoid being called weak: men ${GRIP_CUTOFFS.male.map((r, i) => `${i === 0 ? 'BMI up to 24' : i === 1 ? 'BMI 24.1 to 26' : i === 2 ? 'BMI 26.1 to 28' : 'BMI above 28'} at or below ${r.kg} kg`).join('; ')}. Women: BMI up to 23 at or below 17 kg; 23.1 to 26 at or below 17.3 kg; 26.1 to 29 at or below 18 kg; above 29 at or below 21 kg. This reads backwards at first glance and is correct, because grip scales with body mass.`;
export const GRIP_BANDS_NOTE = 'The men table has FOUR BMI bands but only THREE distinct cut-points: 24.1 to 26 and 26.1 to 28 both cut at 30 kg.';
export const WALK_NOTE = `SLOWNESS IS A TIME OVER ${WALK_DISTANCE}, NOT A SPEED, and sex enters ONLY through the height threshold. The times are identical for both sexes - ${WALK_SECONDS_SHORTER} seconds or more if shorter, ${WALK_SECONDS_TALLER} seconds or more if taller - and only the boundary differs: ${WALK_HEIGHT_THRESHOLD_CM.male} cm for men, ${WALK_HEIGHT_THRESHOLD_CM.female} cm for women. Renderings that convert the same ${WALK_SECONDS_TALLER} seconds into meters per second disagree with each other by rounding, so the published times are kept and not converted.`;
export const WEIGHT_NOTE = 'WEIGHT LOSS HAS TWO ALTERNATIVE DEFINITIONS AND EITHER ONE SATISFIES IT: more than 10 pounds lost unintentionally in the last year, or a measured loss of 5% or more of the previous year weight.';
export const ACTIVITY_NOTE = `LOW ACTIVITY WAS DEFINED AS THE LOWEST QUINTILE BY SEX. The familiar numbers - under ${ACTIVITY_KCAL_PER_WEEK.male} kcal per week for men and under ${ACTIVITY_KCAL_PER_WEEK.female} for women - are that quintile values IN THE DERIVATION COHORT, so they are cohort-specific rather than universal constants.`;
export const EQUIPMENT_NOTE = 'THREE OF THE FIVE CRITERIA NEED EQUIPMENT OR A QUESTIONNAIRE - a dynamometer, a timed walk and the Minnesota Leisure Time Activity Questionnaire. It is not a bedside checklist, which is exactly why the simplified derivatives exist.';

const NOTE = `The Fried frailty phenotype (Fried and colleagues 2001, Cardiovascular Health Study) counts five criteria: unintentional weight loss, exhaustion, weakness, slowness and low physical activity. None met is robust, one or two is pre-frail, three or more is frail. ${GRIP_NOTE} ${GRIP_BANDS_NOTE} ${WALK_NOTE} ${WEIGHT_NOTE} ${ACTIVITY_NOTE} ${EQUIPMENT_NOTE} This classifies a phenotype. It does not diagnose any disease, does not measure disability or comorbidity, which the original work is explicit are distinct from frailty, does not decide whether someone can have an operation, and does not set a care plan.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: one yes/no per CRITERIA key.
export function friedFrailty(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const answers = {};
  try {
    for (const c of CRITERIA) answers[c.key] = readBool(o[c.key], c.text);
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = CRITERIA.filter((c) => answers[c.key] === null);
  if (missing.length) {
    return { valid: false, message: `Answer all ${CRITERIA.length} criteria. ${missing.length} still unanswered. ${EQUIPMENT_NOTE}` };
  }

  const met = CRITERIA.filter((c) => answers[c.key]);
  const count = met.length;
  const band = BANDS.find((b) => count <= b.max);

  const parts = [];
  parts.push(`${count} of ${CRITERIA.length} criteria met: ${band.label}. ${band.text}`);
  if (count > 0) parts.push(`Criteria met: ${met.map((c) => c.text.split(' - ')[0]).join(', ')}.`);
  parts.push(GRIP_NOTE);
  parts.push(GRIP_BANDS_NOTE);
  parts.push(WALK_NOTE);
  parts.push(WEIGHT_NOTE);
  parts.push(ACTIVITY_NOTE);
  parts.push(EQUIPMENT_NOTE);
  parts.push('This classifies a phenotype. It does not diagnose any disease, does not measure disability or comorbidity, does not decide whether someone can have an operation, and does not set a care plan.');

  return {
    valid: true,
    count,
    max: CRITERIA.length,
    criteriaMet: met.map((c) => c.key),
    band: band.label,
    bandLabel: `${count} of ${CRITERIA.length} criteria - ${band.label}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
