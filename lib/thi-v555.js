// spec-v555: the Tinnitus Handicap Inventory (THI). "thi", "thi-25" and "tinnitus" were all zero-hit
// across corpus.json, app.js and lib/meta.js. The `handicap` and `dhi` hits belong to the Dizziness
// Handicap Inventory, which is a DIFFERENT instrument measuring a different symptom -- the two are siblings
// in design, not duplicates, and a patient can score high on one and zero on the other.
//
// TWENTY-FIVE ITEMS, EACH ANSWERED YES (4), SOMETIMES (2) OR NO (0). Total 0 to 100.
//
// **EVERY TOTAL IS EVEN, AND THAT IS WHY THE PUBLISHED BAND BOUNDARIES HAVE ONE-POINT GAPS.** The bands are
// 0-16, 18-36, 38-56, 58-76 and 78-100. The missing values -- 17, 37, 57 and 77 -- are UNREACHABLE, because
// every item contributes 0, 2 or 4 and a sum of even numbers is even. The gaps are correct as published.
// This is the single most likely thing for an implementer to "fix": rewriting the bands as 0-17, 18-37 and
// so on looks like tidying up an off-by-one, and it silently changes nothing for real patients while
// misrepresenting the source. This lib keeps the published boundaries and exports ODD_TOTALS_UNREACHABLE so
// the property is testable rather than merely asserted in a comment.
//
// **THE SUBSCALES ARE DELIBERATELY NOT COMPUTED, AND THAT IS A FINDING RATHER THAN AN OMISSION.** The
// instrument is usually described as having functional, emotional and catastrophic subscales. Two
// independent renderings of the item-to-subscale map DISAGREE ON FOUR ITEMS -- 3, 9, 14 and 18 -- and they
// do not even agree on the shape of the split, one giving 13/7/5 and the published structure being
// described as 11/9/5. The primary text could not be obtained to adjudicate. Emitting subscores would mean
// picking one map on no authority and reporting three numbers that a reader would take as the instrument's
// own. Per spec-v97 this lib computes only what is double-confirmed -- the 25-item total and the five
// grades -- and states in the result that the subscales are withheld and why.
//
// THE GRADES COME FROM A SEPARATE SOURCE FROM THE QUESTIONNAIRE. The 25 items are Newman and colleagues
// 1996; the five severity grades are a 1999 British working group published in 2001. Both are
// double-confirmed, but they are not the same publication, and the result says so rather than letting a
// reader assume the instrument shipped with its own grades.
//
// HIGH-STAKES: this measures SELF-REPORTED HANDICAP -- how much tinnitus is affecting this person's life.
// It does NOT measure the tinnitus itself: it is not a loudness match, a pitch match, or a masking level,
// and it correlates only loosely with any of them, so a quiet tinnitus can produce a catastrophic score and
// a loud one a slight score. It does not diagnose the cause. It does not detect the findings that make
// tinnitus urgent rather than chronic -- unilateral or pulsatile tinnitus, sudden hearing loss, or
// associated neurological signs all need assessment regardless of the score, and a low score does not make
// them benign. Several items overlap heavily with depression and anxiety, which are common alongside
// tinnitus and are not what this instrument is measuring. It does not select treatment (spec-v11 section
// 5.3). The clinical decision stays with the clinician.
//
// ITEMS, RESPONSE VALUES AND GRADES RE-FETCHED, NEVER RECALLED (spec-v97), checked against two independent
// reproductions of the form. The two differ only in trivial wording; the item set, its order, the response
// values and every band boundary are identical. The labels below are neutral topic cues for those items,
// not the proprietary question wording:
//   - Newman CW, Jacobson GP, Spitzer JB. Development of the Tinnitus Handicap Inventory. Arch Otolaryngol
//     Head Neck Surg. 1996;122(2):143-148.
//   - McCombe A, Baguley D, Coles R, McKenna L, McKinney C, Windle-Taylor P. Guidelines for the grading of
//     tinnitus severity. Clin Otolaryngol Allied Sci. 2001;26(5):388-393.

// Neutral topic labels for the 25 items. The instrument's verbatim question wording is
// proprietary (Newman/Jacobson/Spitzer); these are short topic cues, not the questionnaire's
// questions. Scoring is positional and key-based, never text-derived, so the labels can be
// shortened without touching the total or the grades.
export const THI_ITEMS = [
  { key: 'q1', text: 'Concentration' },
  { key: 'q2', text: 'Hearing others over the tinnitus' },
  { key: 'q3', text: 'Anger' },
  { key: 'q4', text: 'Confusion' },
  { key: 'q5', text: 'Desperation' },
  { key: 'q6', text: 'Complaining about it' },
  { key: 'q7', text: 'Falling asleep' },
  { key: 'q8', text: 'Feeling unable to escape it' },
  { key: 'q9', text: 'Social activities' },
  { key: 'q10', text: 'Frustration' },
  { key: 'q11', text: 'Fear of serious disease' },
  { key: 'q12', text: 'Enjoyment of life' },
  { key: 'q13', text: 'Work or household responsibilities' },
  { key: 'q14', text: 'Irritability' },
  { key: 'q15', text: 'Reading' },
  { key: 'q16', text: 'Feeling upset' },
  { key: 'q17', text: 'Strain on family and friendships' },
  { key: 'q18', text: 'Shifting attention away from it' },
  { key: 'q19', text: 'Sense of control over it' },
  { key: 'q20', text: 'Tiredness' },
  { key: 'q21', text: 'Depressed mood' },
  { key: 'q22', text: 'Anxiety' },
  { key: 'q23', text: 'Ability to cope' },
  { key: 'q24', text: 'Worsening under stress' },
  { key: 'q25', text: 'Feeling insecure' },
];

// The same three answers for every item. There is no other value.
export const THI_OPTIONS = [
  { value: 4, text: 'Yes' },
  { value: 2, text: 'Sometimes' },
  { value: 0, text: 'No' },
];

export const THI_MAX = 100;

// Every item contributes 0, 2 or 4, so every total is even and these can never occur.
export const ODD_TOTALS_UNREACHABLE = [17, 37, 57, 77];

// Published exactly as below. The one-point gaps are a consequence of the even-only totals.
const GRADES = [
  { grade: 1, min: 0, max: 16, label: 'Slight or no handicap' },
  { grade: 2, min: 18, max: 36, label: 'Mild handicap' },
  { grade: 3, min: 38, max: 56, label: 'Moderate handicap' },
  { grade: 4, min: 58, max: 76, label: 'Severe handicap' },
  { grade: 5, min: 78, max: THI_MAX, label: 'Catastrophic handicap' },
];

const EVEN_TEXT = 'Every item scores 0, 2 or 4, so every total is EVEN and the totals 17, 37, 57 and 77 are unreachable. That is why the published bands read 0 to 16, 18 to 36, 38 to 56, 58 to 76 and 78 to 100 rather than running edge to edge: the one-point gaps are correct as published and are not an off-by-one to be tidied away.';

const SUBSCALES_WITHHELD = 'The functional, emotional and catastrophic SUBSCORES are deliberately not reported. Two independent renderings of the item-to-subscale map disagree on four items and do not agree on the shape of the split, and the primary text could not be obtained to settle it, so emitting subscores would mean choosing one map on no authority and presenting three numbers as the instrument’s own. Only the total and grade, which are double-confirmed, are given.';

const GRADES_PROVENANCE = 'The 25 items are Newman and colleagues 1996; the five severity grades come from a separate British working group published in 2001.';

const NOTE = 'The Tinnitus Handicap Inventory (Newman and colleagues 1996) asks 25 questions about how much tinnitus is affecting the respondent, each answered yes for 4 points, sometimes for 2, or no for 0, giving a total from 0 to 100. Because every item contributes 0, 2 or 4, every total is even and the values 17, 37, 57 and 77 can never occur, which is why the published grades read 0 to 16 slight or no handicap, 18 to 36 mild, 38 to 56 moderate, 58 to 76 severe, and 78 to 100 catastrophic rather than running edge to edge. Those one-point gaps are correct as published and rewriting the bands to close them misrepresents the source. The grades come from a separate British working group published in 2001 rather than from the questionnaire itself. The functional, emotional and catastrophic subscores are deliberately not reported here: two independent renderings of the item-to-subscale map disagree on four items and do not even agree on the shape of the split, and the primary text could not be obtained to adjudicate, so reporting subscores would mean choosing one map on no authority. This is a companion to the Dizziness Handicap Inventory rather than a duplicate of it: the two share a design but measure different symptoms, and a patient can score high on one and zero on the other. It measures self-reported handicap, meaning how much tinnitus is affecting this person’s life. It does not measure the tinnitus itself, being neither a loudness match, a pitch match nor a masking level, and it correlates only loosely with all of them, so a quiet tinnitus can produce a catastrophic score and a loud one a slight score. It does not diagnose the cause, and it does not detect the findings that make tinnitus urgent rather than chronic: unilateral or pulsatile tinnitus, sudden hearing loss and associated neurological signs all need assessment regardless of the score, and a low score does not make them benign. Several items overlap heavily with depression and anxiety, which are common alongside tinnitus and are not what this instrument measures. It does not select treatment.';

function readItem(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (n !== 0 && n !== 2 && n !== 4) return NaN;
  return n;
}

// input: one key per item in THI_ITEMS (q1..q25), each 0, 2 or 4. All 25 required.
export function thi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = THI_ITEMS.map((item) => ({ item, points: readItem(o[item.key]) }));

  const missing = scored.filter((s) => s.points === null);
  if (missing.length) {
    return { valid: false, message: `Answer all 25 items. Each is yes (4), sometimes (2) or no (0); there is no other value. Still needed: ${missing.map((s) => s.item.key).join(', ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.points));
  if (bad.length) {
    return { valid: false, message: `Each item must be 4 for yes, 2 for sometimes, or 0 for no. Odd values and 1 or 3 are not on this scale. Unrecognized: ${bad.map((s) => s.item.key).join(', ')}.` };
  }

  const total = scored.reduce((a, s) => a + s.points, 0);
  const grade = GRADES.find((g) => total >= g.min && total <= g.max);
  const yesCount = scored.filter((s) => s.points === 4).length;
  const sometimesCount = scored.filter((s) => s.points === 2).length;

  return {
    valid: true,
    total,
    max: THI_MAX,
    grade: grade.grade,
    gradeLabel: grade.label,
    yesCount,
    sometimesCount,
    subscalesReported: false,
    bandLabel: `THI ${total} of ${THI_MAX}, grade ${grade.grade}, ${grade.label.toLowerCase()}`,
    bandText: `THI ${total} of ${THI_MAX}: grade ${grade.grade}, ${grade.label.toLowerCase()}. ${GRADES_PROVENANCE} ${EVEN_TEXT} ${SUBSCALES_WITHHELD} It measures self-reported handicap rather than the tinnitus itself, and it is not a loudness or pitch match.`,
    note: NOTE,
  };
}
