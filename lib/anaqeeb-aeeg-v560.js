// spec-v560: the al Naqeeb amplitude-integrated EEG (aEEG) amplitude classification for neonatal
// encephalopathy. "naqeeb" and "aeeg" were both zero-hit across corpus.json, app.js and lib/meta.js; the
// "eeg" hits are unrelated contexts. The catalog had no aEEG content of any kind.
//
// THREE CATEGORIES FROM TWO CONTINUOUS INPUTS -- THE UPPER AND LOWER MARGINS OF THE aEEG TRACE, IN
// MICROVOLTS. There is no arithmetic here: it is a decision table, not a score, and nothing is summed.
//
//   Normal amplitude              upper margin above 10 microV AND lower margin above 5 microV
//   Moderately abnormal amplitude upper margin above 10 microV AND lower margin 5 microV or below
//   Suppressed amplitude          upper margin below 10 microV AND lower margin below 5 microV
//
// **THE CLASSIFICATION IS NOT EXHAUSTIVE, AND THIS TILE REPORTS THAT INSTEAD OF FILLING THE HOLES.** Two
// regions of the input space fall in NO published category:
//   - an upper margin of EXACTLY 10 microV, because every category requires the upper margin to be strictly
//     above or strictly below 10; and
//   - an upper margin below 10 with a lower margin above 5, which no category describes.
// Both are reachable from real measurements. A three-way classifier that silently assigned every input to
// its nearest category would report a category the source does not define, at precisely the boundary where
// the reader most needs to know the instrument is silent. This lib returns `classified: false` with the
// reason.
//
// **THE MIDDLE BAND'S LOWER BOUNDARY DIFFERS BY ONE GLYPH BETWEEN SOURCES, AND THIS LIB FOLLOWS THE
// ORIGINAL.** The original paper prints the moderately abnormal lower margin as "5 microV or below"; an
// independent review restates it as "less than 5". The NUMBERS are identical and only the inequality
// differs, so this is a convention to choose rather than a value disagreement to refuse (spec-v97). The
// original is followed, so a lower margin of exactly 5 with an upper margin above 10 is moderately
// abnormal, and the result says so at that value rather than everywhere.
//
// **SEIZURE ACTIVITY IS A SEPARATE FLAG AND IS NEVER FOLDED INTO THE AMPLITUDE CATEGORY.** The original
// scheme defines seizures alongside the amplitude classification, not within it. An infant with a normal
// amplitude and recorded seizures is NOT thereby "moderately abnormal" -- the two findings are reported
// side by side, because collapsing them would lose the distinction the scheme is built on.
//
// **SLEEP-WAKE CYCLING IS NOT ASSESSED BY THIS CLASSIFICATION AT ALL.** It belongs to the later
// pattern-based schemes. A reader who expects it here would conclude its absence means it was normal.
//
// HIGH-STAKES: an aEEG amplitude reading, and a DEVICE- AND MONTAGE-DEPENDENT one. Voltage is affected by
// interelectrode distance, scalp edema, and extracerebral signals including the ECG, so the same brain can
// produce different margins on different setups and the numbers are not transferable between them. aEEG is
// a filtered, compressed, two-channel summary: it is NOT a conventional EEG and cannot exclude seizures,
// which it is well known to miss. This does not diagnose hypoxic-ischemic encephalopathy, which is a
// clinical diagnosis, and it does not grade it -- Sarnat staging is a different instrument on a different
// axis. **It is NOT a therapeutic hypothermia eligibility criterion**: cooling is decided on published
// clinical and biochemical criteria within a time window, and this classification neither establishes nor
// excludes eligibility, which is the decision it would most damagingly be misused to settle. It does not
// predict outcome for an individual infant (spec-v11 section 5.3). The clinical decision stays with the
// clinician.
//
// CATEGORIES AND THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the original report and
// an independent review restating it, which agree on all three categories and both thresholds:
//   - al Naqeeb N, Edwards AD, Cowan FM, Azzopardi D. Assessment of neonatal encephalopathy by
//     amplitude-integrated electroencephalography. Pediatrics. 1999;103(6 Pt 1):1263-1271.
//   - Hellstrom-Westas L, Rosen I, de Vries LS, Greisen G. Amplitude-integrated EEG classification and
//     interpretation in preterm and term infants. NeoReviews. 2006;7(2):e76-e87.

export const UPPER_THRESHOLD = 10; // microvolts
export const LOWER_THRESHOLD = 5;  // microvolts

export const ANAQEEB_CATEGORIES = [
  {
    value: 'normal',
    label: 'Normal amplitude',
    text: 'Upper margin above 10 microV and lower margin above 5 microV.',
  },
  {
    value: 'moderately-abnormal',
    label: 'Moderately abnormal amplitude',
    text: 'Upper margin above 10 microV and lower margin 5 microV or below.',
  },
  {
    value: 'suppressed',
    label: 'Suppressed amplitude',
    text: 'Upper margin below 10 microV and lower margin below 5 microV.',
  },
];

// Reference values from the original healthy controls, for orientation only.
export const HEALTHY_CONTROL_REFERENCE = 'In the original healthy control infants the median upper margin was 37.5 microV (range 30 to 48) and the median lower margin was 8 microV (range 6.5 to 11).';

const UNCLASSIFIED_AT_TEN = `An upper margin of exactly ${UPPER_THRESHOLD} microV falls in NO published category: every category requires the upper margin to be strictly above or strictly below ${UPPER_THRESHOLD}. The classification is not exhaustive, and this value is reachable from a real measurement, so no category is assigned rather than rounding to the nearest one.`;

const UNCLASSIFIED_LOW_UPPER_HIGH_LOWER = `An upper margin below ${UPPER_THRESHOLD} microV together with a lower margin above ${LOWER_THRESHOLD} microV matches no published category: the suppressed category requires BOTH margins to be low. No category is assigned. Check the margins, since a lower margin above the upper margin is not physically possible and a narrow high-lying band is unusual.`;

const BOUNDARY_DISCLOSURE = `A lower margin of exactly ${LOWER_THRESHOLD} microV sits on a boundary where the sources differ by one glyph: the original prints the moderately abnormal band as "${LOWER_THRESHOLD} microV or below", while an independent review restates it as "less than ${LOWER_THRESHOLD}". The numbers are identical and only the inequality differs. The original is followed here, so this is moderately abnormal.`;

const SEIZURE_TEXT = 'Seizure activity is recorded as a SEPARATE finding and is never folded into the amplitude category: an infant with a normal amplitude and recorded seizures is not thereby moderately abnormal.';

const NOT_ASSESSED = 'Sleep-wake cycling is not assessed by this classification at all; it belongs to the later pattern-based schemes.';

const NOTE = 'The al Naqeeb classification (al Naqeeb and colleagues 1999) sorts the amplitude-integrated EEG into three categories from the upper and lower margins of the trace in microvolts. Normal amplitude is an upper margin above 10 and a lower margin above 5; moderately abnormal is an upper margin above 10 with a lower margin of 5 or below; suppressed is an upper margin below 10 with a lower margin below 5. It is a decision table rather than a score, and nothing is summed. The classification is not exhaustive: an upper margin of exactly 10 microvolts falls in no category, because every category requires the upper margin to be strictly above or strictly below 10, and an upper margin below 10 with a lower margin above 5 matches no category either. Both are reachable from real measurements, so no category is assigned rather than rounding to the nearest one. The moderately abnormal band’s lower boundary differs by one glyph between sources, the original printing 5 or below and an independent review restating it as less than 5; the numbers are identical and only the inequality differs, and the original is followed here. Seizure activity is a separate finding in the original scheme and is never folded into the amplitude category, so an infant with a normal amplitude and recorded seizures is not thereby moderately abnormal. Sleep-wake cycling is not assessed by this classification at all and belongs to the later pattern-based schemes. In the original healthy control infants the median upper margin was 37.5 microvolts and the median lower margin was 8. The reading is device and montage dependent: voltage is affected by interelectrode distance, scalp edema and extracerebral signals including the ECG, so the same brain can produce different margins on different setups and the numbers are not transferable between them. aEEG is a filtered, compressed, two-channel summary rather than a conventional EEG, and it cannot exclude seizures, which it is well known to miss. This does not diagnose hypoxic-ischemic encephalopathy, which is a clinical diagnosis, and it does not grade it, since Sarnat staging is a different instrument on a different axis. It is not a therapeutic hypothermia eligibility criterion: cooling is decided on published clinical and biochemical criteria within a time window, and this classification neither establishes nor excludes eligibility. It does not predict outcome for an individual infant.';

function readMargin(raw, name) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > 200) return NaN;
  void name;
  return n;
}

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input:
//   upperMargin, lowerMargin -- microvolts. Both required.
//   seizures -- optional yes/no. Reported alongside the category, never folded into it.
export function anaqeebAeeg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const upper = readMargin(o.upperMargin);
  const lower = readMargin(o.lowerMargin);
  if (upper === null || lower === null) {
    return { valid: false, message: 'Enter both the upper and lower margins of the aEEG trace, in microvolts.' };
  }
  if (Number.isNaN(upper) || Number.isNaN(lower)) {
    return { valid: false, message: 'Each margin must be a number of microvolts from 0 to 200.' };
  }
  if (lower > upper) {
    return { valid: false, message: 'The lower margin cannot exceed the upper margin. Check which value is which.' };
  }

  const seizures = readBool(o.seizures);
  if (Number.isNaN(seizures)) {
    return { valid: false, message: 'The seizure answer must be yes or no, or left blank.' };
  }

  let category = null;
  let unclassifiedReason = null;

  if (upper > UPPER_THRESHOLD) {
    category = lower > LOWER_THRESHOLD ? 'normal' : 'moderately-abnormal';
  } else if (upper < UPPER_THRESHOLD) {
    if (lower < LOWER_THRESHOLD) category = 'suppressed';
    else unclassifiedReason = UNCLASSIFIED_LOW_UPPER_HIGH_LOWER;
  } else {
    unclassifiedReason = UNCLASSIFIED_AT_TEN;
  }

  const onLowerBoundary = category === 'moderately-abnormal' && lower === LOWER_THRESHOLD;
  const seizureText = seizures === null ? '' : ` Seizure activity: ${seizures ? 'recorded' : 'not recorded'}. ${SEIZURE_TEXT}`;

  if (!category) {
    return {
      valid: true,
      classified: false,
      category: null,
      categoryLabel: 'No published category',
      upperMargin: upper,
      lowerMargin: lower,
      seizures,
      bandLabel: 'aEEG amplitude: no published category',
      bandText: `Upper margin ${upper} microV, lower margin ${lower} microV. ${unclassifiedReason}${seizureText} ${NOT_ASSESSED} ${HEALTHY_CONTROL_REFERENCE}`,
      note: NOTE,
    };
  }

  const match = ANAQEEB_CATEGORIES.find((c) => c.value === category);

  return {
    valid: true,
    classified: true,
    category: match.value,
    categoryLabel: match.label,
    upperMargin: upper,
    lowerMargin: lower,
    seizures,
    onLowerBoundary,
    bandLabel: `aEEG amplitude: ${match.label.toLowerCase()}`,
    bandText: `${match.label}. ${match.text} Measured upper margin ${upper} microV, lower margin ${lower} microV.${onLowerBoundary ? ` ${BOUNDARY_DISCLOSURE}` : ''}${seizureText} ${NOT_ASSESSED} ${HEALTHY_CONTROL_REFERENCE} The reading is device and montage dependent, and this is not a therapeutic hypothermia eligibility criterion.`,
    note: NOTE,
  };
}
