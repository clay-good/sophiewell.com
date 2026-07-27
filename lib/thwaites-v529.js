// spec-v529: the Thwaites diagnostic index (the "Vietnam rule") for distinguishing tuberculous from
// bacterial meningitis in adults. Zero-hit before this tile: "thwaites", "tuberculous", and "bandim" across
// corpus.json, app.js, and lib/meta.js.
//
// A DIFFERENT QUESTION FROM THE EXISTING bacterial-meningitis-score TILE (Nigrovic), which asks whether a
// CHILD with meningitis can safely be presumed NOT to have bacterial meningitis. Thwaites assumes meningitis
// is present in an ADULT and asks which of two organisms is causing it. One is a rule-out in pediatrics; the
// other is a discriminator between two diagnoses in adults. Neither answers the other's question.
//
// FIVE FEATURES, AND THE SCORE RUNS IN THE OPPOSITE DIRECTION TO EVERY OTHER SCORE IN THIS CATALOG.
//   age 36 years or older            +2
//   blood white cell count >= 15,000 +4
//   duration of illness >= 6 days    -5     <-- the only negative, and the largest single weight
//   CSF total white cell count >= 900 +3
//   CSF neutrophils >= 75 percent    +4
// Total range -5 to +13. **A TOTAL OF 4 OR LESS FAVORS TUBERCULOUS MENINGITIS; ABOVE 4 FAVORS BACTERIAL.**
// LOW IS THE TB END. Almost every other instrument in this catalog reads "higher means more of the thing
// being measured", and a reader who assumes that here inverts the diagnosis, so the tile states the
// direction in the result itself and never emits a bare number.
//
// THE NEGATIVE WEIGHT IS THE INSTRUMENT'S ENGINE, not a rounding detail: a longer history is the single
// strongest pull toward TB, which is exactly the clinical intuition it encodes (bacterial meningitis
// presents over hours to a couple of days; tuberculous meningitis over a week or more). An implementation
// that dropped the sign would turn the most TB-suggestive feature into the most bacterial-suggestive one.
//
// UNITS: the printed unit labels in reproductions of this table are internally inconsistent -- one renders
// both counts as "10^3/ml" while giving thresholds of 15,000 and 900, which cannot both be true. The
// clinically unambiguous reading, which this tile uses and labels: blood white cells in cells per microliter
// (15,000/uL, equivalently 15 x10^9/L) and CSF white cells in cells per microliter (900/uL). The numbers are
// reliable across sources; only the unit labels are not.
//
// HIGH-STAKES, AND THE FAILURE MODES ARE SPECIFIC AND KNOWN:
//   - Specificity collapses in PARTIALLY TREATED bacterial meningitis (reported around 24 percent), which is
//     precisely the patient who has already had antibiotics and whose CSF now looks lymphocytic. That is a
//     common presentation, and it is the one the rule handles worst.
//   - It performs poorly in HIV-positive adults (reported areas under the curve around 0.6), and it was
//     derived in HIV-negative Vietnamese adults.
//   - It is a discriminator between two diagnoses, so it says nothing about the many other causes of a
//     lymphocytic CSF: viral, fungal including cryptococcal, autoimmune, and malignant meningitis are all
//     outside what it can see.
// It does not diagnose either disease, does not replace CSF microscopy, culture, or nucleic-acid testing,
// and is not an indication to start or withhold antituberculous therapy or antibiotics (spec-v11 section
// 5.3). Empirical treatment for both is often correct while testing is pending. The diagnosis stays with the
// clinician and the laboratory.
//
// FEATURES, SIGNED WEIGHTS, AND THE CUT POINT RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two
// independent reproductions that agree on every row and on the direction of the cut:
//   - Thwaites GE, Chau TTH, Stepniewska K, et al. Diagnosis of adult tuberculous meningitis by use of
//     clinical and laboratory features. Lancet. 2002;360(9342):1287-1292.
//   - Two later validation studies reproducing the same five features, the same signed weights including the
//     -5, and the same reading that a total of 4 or less indicates tuberculous meningitis.

export const THWAITES_FEATURES = [
  {
    key: 'age',
    text: 'Age 36 years or older',
    points: 2,
    detail: 'Older age pulls toward bacterial meningitis.',
  },
  {
    key: 'bloodWbc',
    text: 'Blood white cell count 15,000 cells/uL or more',
    points: 4,
    detail: 'A high peripheral white count pulls toward bacterial meningitis.',
  },
  {
    key: 'duration',
    text: 'Duration of illness 6 days or more',
    points: -5,
    detail: 'The only negative weight, and the largest. A longer history is the strongest single pull toward tuberculous meningitis.',
  },
  {
    key: 'csfWbc',
    text: 'CSF total white cell count 900 cells/uL or more',
    points: 3,
    detail: 'A high CSF cell count pulls toward bacterial meningitis.',
  },
  {
    key: 'csfNeutrophils',
    text: 'CSF neutrophils 75 percent or more',
    points: 4,
    detail: 'A neutrophil-predominant CSF pulls toward bacterial meningitis.',
  },
];

// Derived rather than asserted, so the reported range is the range the tile can actually produce.
export const THWAITES_RANGE = THWAITES_FEATURES.reduce(
  (acc, f) => ({
    min: acc.min + Math.min(0, f.points),
    max: acc.max + Math.max(0, f.points),
  }),
  { min: 0, max: 0 },
);

const TB_AT_OR_BELOW = 4;

const NOTE = 'The Thwaites diagnostic index (Thwaites and colleagues 2002) distinguishes tuberculous from bacterial meningitis in adults using five features: age 36 or older adds 2, a blood white cell count of 15,000 cells per microliter or more adds 4, an illness lasting 6 days or more subtracts 5, a CSF white cell count of 900 cells per microliter or more adds 3, and CSF neutrophils of 75 percent or more add 4. The total runs from minus 5 to plus 13, and it reads in the opposite direction to most scores: a total of 4 or less favors tuberculous meningitis and above 4 favors bacterial meningitis, so low is the tuberculous end. The duration weight is the only negative one and the largest, which encodes the clinical pattern that bacterial meningitis presents over hours to a couple of days while tuberculous meningitis presents over a week or more. Its failure modes are specific: specificity collapses in partially treated bacterial meningitis, around 24 percent in one validation, which is exactly the patient who has already had antibiotics and whose CSF now looks lymphocytic; and it performs poorly in HIV-positive adults, having been derived in HIV-negative Vietnamese adults. It discriminates between two diagnoses only, so it says nothing about viral, fungal including cryptococcal, autoimmune, or malignant causes of a lymphocytic CSF. It does not diagnose either disease, does not replace CSF microscopy, culture, or nucleic-acid testing, and is not an indication to start or withhold antituberculous therapy or antibiotics; treating empirically for both while testing is pending is often correct.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: age, bloodWbc, duration, csfWbc, csfNeutrophils -- each yes/no for whether the threshold is met.
export function thwaites(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const answered = THWAITES_FEATURES.map((f) => ({ feature: f, met: readBool(o[f.key]) }));

  const missing = answered.filter((a) => a.met === null);
  if (missing.length) {
    return { valid: false, message: `Answer every feature. Still needed: ${missing.map((a) => a.feature.text).join('; ')}.` };
  }
  const bad = answered.filter((a) => Number.isNaN(a.met));
  if (bad.length) {
    return { valid: false, message: `Each feature must be yes or no. Unrecognized: ${bad.map((a) => a.feature.text).join('; ')}.` };
  }

  const contributions = answered.map((a) => ({
    key: a.feature.key,
    text: a.feature.text,
    met: a.met,
    points: a.met ? a.feature.points : 0,
  }));
  const total = contributions.reduce((sum, c) => sum + c.points, 0);
  const favorsTb = total <= TB_AT_OR_BELOW;

  const reading = favorsTb
    ? 'A total of 4 or less favors TUBERCULOUS meningitis.'
    : 'A total above 4 favors BACTERIAL meningitis.';

  return {
    valid: true,
    total,
    favorsTb,
    favors: favorsTb ? 'tuberculous' : 'bacterial',
    contributions,
    bandLabel: `Thwaites ${total}, favors ${favorsTb ? 'tuberculous' : 'bacterial'} meningitis`,
    band: `Total ${total}, on a scale running ${THWAITES_RANGE.min} to ${THWAITES_RANGE.max}. ${reading} Note this score reads in the opposite direction to most: low is the tuberculous end. It discriminates between two diagnoses and does not diagnose either, and its specificity is poor in partially treated bacterial meningitis and in HIV-positive adults.`,
    note: NOTE,
  };
}
