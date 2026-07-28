// spec-v566: the NIH Chronic Prostatitis Symptom Index (NIH-CPSI). "cpsi" and "prostatitis" were both
// zero-hit across corpus.json, app.js and lib/meta.js, and `grep -c "id: 'nih-cpsi'" app.js` returned 0.
//
// **NINE NUMBERED QUESTIONS, THIRTEEN SCORED ITEMS, AND BOTH COUNTS ARE CORRECT.** The form asks nine
// questions; the literature universally calls this a 13-item index. The difference is that question 1 has
// four yes/no sub-parts and question 2 has two, so 4 + 2 + 7 = 13. Neither number is wrong, and a reader
// who has seen only one of them will think the other describes a different instrument. This lib scores 13
// items under 9 questions and says so.
//
// THREE SUBSCALES, SUMMED TO A TOTAL OF 0 TO 43:
//   pain           items 1a-1d, 2a, 2b, 3, 4     0-21
//   urinary        items 5 and 6                 0-10
//   quality of life items 7, 8, 9                0-12
//
// **THE PER-ITEM RANGES ARE WILDLY HETEROGENEOUS, AND ONE ITEM CARRIES ALMOST A QUARTER OF THE TOTAL.**
// Six items score 0 or 1, two score 0 to 3, three score 0 to 5, one scores 0 to 6, and one -- the average
// pain rating -- scores 0 to 10. That single numeric rating is 10 of the 43 points, about 23 percent, and
// is worth ten times any one of the six yes/no items. A reader who treats the items as comparable will
// badly misjudge what is driving a total.
//
// **QUESTION 4 IS CONDITIONAL IN ITS WORDING BUT UNCONDITIONAL IN ITS SCORING.** It asks for average pain
// "on the days that you had it", which does not apply to a patient who answered "never" to question 3 --
// yet the instrument still requires a 0 to 10 value. This lib requires it too, because that is what the
// instrument does, and flags the combination rather than silently accepting a positive pain rating from a
// patient who reported no pain at all.
//
// **QUESTION 9 IS A SATISFACTION LADDER WHOSE NEUTRAL POINT IS NOT A MIDPOINT.** It runs from "delighted"
// at 0 to "terrible" at 6, and the neutral answer, "mixed, about equally satisfied and dissatisfied",
// scores 3. That is the midpoint of this item alone and of nothing else on the form, so it cannot be
// treated as a general neutral value.
//
// **THE ORIGINAL PAPER PUBLISHED NO TOTAL-SCORE SEVERITY BANDS.** The widely quoted mild 0 to 14, moderate
// 15 to 29, severe 30 to 43 come from a later multinational cohort, not from the development paper, and the
// pain-item bands circulate from later work too. They are reported here labeled with their own source
// rather than as part of the index, because a reader who believes the instrument ships with bands will
// over-trust them.
//
// **THE MGUPI OR GUPI IS A DIFFERENT INSTRUMENT AND ITS SCORES ARE NOT COMPARABLE.** It adds two further
// pain items, taking the pain subscale to 0 to 23 and the total to 0 to 45. A score of 44 is impossible
// here and ordinary there. This lib computes the NIH-CPSI and names the variant so the two are not mixed.
//
// HIGH-STAKES: a SYMPTOM index. It does NOT diagnose chronic prostatitis or chronic pelvic pain syndrome,
// and it does not distinguish the NIH categories, which turn on inflammatory findings and cultures this
// instrument cannot see. It does not exclude the conditions that present the same way and are managed very
// differently -- bacterial infection, bladder pain syndrome, urethral stricture, and pelvic floor
// dysfunction among them -- nor does it detect the findings that need urgent assessment, since hematuria,
// fever with pain, acute retention and a suspicious examination all need attention regardless of the score.
// It does not select therapy, and in particular a high score is not by itself an indication for antibiotics
// (spec-v11 section 5.3). The clinical decision stays with the clinician.
//
// ITEMS, RESPONSE VALUES AND SUBSCALE RANGES RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from an
// NIH-hosted case report form carrying the instrument, with the subscale ranges and the item-range
// distribution independently confirmed by two later publications:
//   - Litwin MS, McNaughton-Collins M, Fowler FJ Jr, et al. The National Institutes of Health chronic
//     prostatitis symptom index: development and validation of a new outcome measure. J Urol.
//     1999;162(2):369-375.
//   - Wagenlehner FME, et al. Eur Urol. 2013;63(5):953-959 (the severity bands and the item-range
//     distribution).

const YES_NO = [{ value: 0, text: 'No' }, { value: 1, text: 'Yes' }];

const FREQUENCY = [
  { value: 0, text: 'Never' }, { value: 1, text: 'Rarely' }, { value: 2, text: 'Sometimes' },
  { value: 3, text: 'Often' }, { value: 4, text: 'Usually' }, { value: 5, text: 'Always' },
];

const PROPORTION = [
  { value: 0, text: 'Not at all' }, { value: 1, text: 'Less than 1 time in 5' },
  { value: 2, text: 'Less than half the time' }, { value: 3, text: 'About half the time' },
  { value: 4, text: 'More than half the time' }, { value: 5, text: 'Almost always' },
];

const AMOUNT = [
  { value: 0, text: 'None' }, { value: 1, text: 'Only a little' },
  { value: 2, text: 'Some' }, { value: 3, text: 'A lot' },
];

const SATISFACTION = [
  { value: 0, text: 'Delighted' }, { value: 1, text: 'Pleased' }, { value: 2, text: 'Mostly satisfied' },
  { value: 3, text: 'Mixed (about equally satisfied and dissatisfied)' },
  { value: 4, text: 'Mostly dissatisfied' }, { value: 5, text: 'Unhappy' }, { value: 6, text: 'Terrible' },
];

const PAIN_NRS = Array.from({ length: 11 }, (_, i) => ({
  value: i,
  text: i === 0 ? '0 (no pain)' : (i === 10 ? '10 (pain as bad as you can imagine)' : String(i)),
}));

export const CPSI_ITEMS = [
  { key: 'q1a', question: '1a', subscale: 'pain', text: 'Pain or discomfort in the area between rectum and testicles (perineum), in the last week', options: YES_NO },
  { key: 'q1b', question: '1b', subscale: 'pain', text: 'Pain or discomfort in the testicles, in the last week', options: YES_NO },
  { key: 'q1c', question: '1c', subscale: 'pain', text: 'Pain or discomfort at the tip of the penis, not related to urination, in the last week', options: YES_NO },
  { key: 'q1d', question: '1d', subscale: 'pain', text: 'Pain or discomfort below the waist, in the pubic or bladder area, in the last week', options: YES_NO },
  { key: 'q2a', question: '2a', subscale: 'pain', text: 'Pain or burning during urination, in the last week', options: YES_NO },
  { key: 'q2b', question: '2b', subscale: 'pain', text: 'Pain or discomfort during or after sexual climax (ejaculation), in the last week', options: YES_NO },
  { key: 'q3', question: '3', subscale: 'pain', text: 'How often have you had pain or discomfort in any of these areas over the last week?', options: FREQUENCY },
  { key: 'q4', question: '4', subscale: 'pain', text: 'Average pain or discomfort on the days that you had it, over the last week', options: PAIN_NRS },
  { key: 'q5', question: '5', subscale: 'urinary', text: 'How often have you had a sensation of not emptying your bladder completely after you finished urinating, over the last week?', options: PROPORTION },
  { key: 'q6', question: '6', subscale: 'urinary', text: 'How often have you had to urinate again less than two hours after you finished urinating, over the last week?', options: PROPORTION },
  { key: 'q7', question: '7', subscale: 'qol', text: 'How much have your symptoms kept you from doing the kinds of things you would usually do, over the last week?', options: AMOUNT },
  { key: 'q8', question: '8', subscale: 'qol', text: 'How much did you think about your symptoms, over the last week?', options: AMOUNT },
  { key: 'q9', question: '9', subscale: 'qol', text: 'If you were to spend the rest of your life with your symptoms just the way they have been during the last week, how would you feel about that?', options: SATISFACTION },
];

export const SUBSCALE_MAXIMA = { pain: 21, urinary: 10, qol: 12 };
export const CPSI_MAX = 43;
export const NUMBERED_QUESTIONS = 9;
export const SCORED_ITEMS = 13;
export const MGUPI_MAX = 45; // the variant, for contrast only

// From a later multinational cohort, NOT from the development paper.
const BANDS = [
  { max: 14, label: 'Mild' },
  { max: 29, label: 'Moderate' },
  { max: CPSI_MAX, label: 'Severe' },
];

const COUNT_TEXT = `Nine numbered questions but ${SCORED_ITEMS} scored items: question 1 has four yes/no sub-parts and question 2 has two, so 4 plus 2 plus 7 is ${SCORED_ITEMS}. Both counts describe the same instrument.`;

const HETEROGENEITY_TEXT = 'The per-item ranges are heterogeneous: six items score 0 or 1, two score 0 to 3, three score 0 to 5, one scores 0 to 6, and the average pain rating scores 0 to 10. That single item is 10 of the 43 points, so it is worth ten times any one yes/no item, and the items must not be treated as comparable.';

const BANDS_PROVENANCE = 'The severity bands are NOT from the development paper, which published none. They come from a later multinational cohort and are reported as that study’s.';

const VARIANT_TEXT = `The MGUPI or GUPI variant is a DIFFERENT instrument with two extra pain items, a pain subscale of 0 to 23 and a total of 0 to ${MGUPI_MAX}. Its scores are not comparable with these.`;

const Q4_CONFLICT = 'Question 3 reports no pain at all, yet question 4 records a positive average pain rating. Question 4 asks about "the days that you had it", so the two answers disagree. The instrument requires question 4 regardless, so the score stands as computed and the conflict is reported rather than resolved.';

const NOTE = 'The NIH Chronic Prostatitis Symptom Index (Litwin and colleagues 1999) has nine numbered questions but thirteen scored items, because question 1 has four yes/no sub-parts and question 2 has two, and both counts describe the same instrument. Three subscales are summed to a total of 0 to 43: pain from items 1a to 1d, 2a, 2b, 3 and 4, scoring 0 to 21; urinary from items 5 and 6, scoring 0 to 10; and quality-of-life impact from items 7, 8 and 9, scoring 0 to 12. The per-item ranges are heterogeneous, with six items scoring 0 or 1, two scoring 0 to 3, three scoring 0 to 5, one scoring 0 to 6, and the average pain rating scoring 0 to 10, so that single item carries 10 of the 43 points and is worth ten times any one yes/no item. Question 4 is conditional in its wording, asking for average pain on the days the patient had it, but unconditional in its scoring, since the instrument requires a value even from a patient who answered never to question 3; that combination is reported rather than silently accepted. Question 9 is a satisfaction ladder running from delighted at 0 to terrible at 6, whose neutral answer, mixed, scores 3, which is the midpoint of that item alone and of nothing else on the form. The development paper published no total-score severity bands: the widely quoted mild 0 to 14, moderate 15 to 29 and severe 30 to 43 come from a later multinational cohort and are labeled as such. The MGUPI or GUPI variant is a different instrument with two extra pain items, a pain subscale of 0 to 23 and a total of 0 to 45, and its scores are not comparable. This is a symptom index. It does not diagnose chronic prostatitis or chronic pelvic pain syndrome, and it does not distinguish the NIH categories, which turn on inflammatory findings and cultures this instrument cannot see. It does not exclude the conditions that present the same way and are managed very differently, including bacterial infection, bladder pain syndrome, urethral stricture and pelvic floor dysfunction, and it does not detect the findings that need urgent assessment, since hematuria, fever with pain, acute retention and a suspicious examination all need attention regardless of the score. It does not select therapy, and a high score is not by itself an indication for antibiotics.';

function readItem(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  return item.options.some((o) => o.value === n) ? n : NaN;
}

// input: one key per item in CPSI_ITEMS (q1a..q9). All 13 required.
export function nihCpsi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const reads = CPSI_ITEMS.map((item) => ({ item, points: readItem(item, o[item.key]) }));

  const missing = reads.filter((r) => r.points === null);
  if (missing.length) {
    return { valid: false, message: `All ${SCORED_ITEMS} scored items are needed (${NUMBERED_QUESTIONS} numbered questions, with question 1 in four parts and question 2 in two). Still needed: ${missing.map((r) => r.item.key).join(', ')}.` };
  }
  const bad = reads.filter((r) => Number.isNaN(r.points));
  if (bad.length) {
    return { valid: false, message: `Each item must be one of its own permitted values; the ranges differ between items. Unrecognized: ${bad.map((r) => r.item.key).join(', ')}.` };
  }

  const sub = (name) => reads.filter((r) => r.item.subscale === name).reduce((a, r) => a + r.points, 0);
  const pain = sub('pain');
  const urinary = sub('urinary');
  const qol = sub('qol');
  const total = pain + urinary + qol;
  const band = BANDS.find((b) => total <= b.max);

  const q3 = reads.find((r) => r.item.key === 'q3').points;
  const q4 = reads.find((r) => r.item.key === 'q4').points;
  const painFrequencyConflict = q3 === 0 && q4 > 0;

  return {
    valid: true,
    total,
    max: CPSI_MAX,
    pain,
    urinary,
    qol,
    subscaleMaxima: SUBSCALE_MAXIMA,
    band: band.label,
    painFrequencyConflict,
    bandLabel: `NIH-CPSI ${total} of ${CPSI_MAX}, ${band.label.toLowerCase()}`,
    bandText: `NIH-CPSI ${total} of ${CPSI_MAX}: ${band.label.toLowerCase()}. Pain ${pain} of ${SUBSCALE_MAXIMA.pain}, urinary ${urinary} of ${SUBSCALE_MAXIMA.urinary}, quality-of-life impact ${qol} of ${SUBSCALE_MAXIMA.qol}. ${COUNT_TEXT} ${HETEROGENEITY_TEXT} ${BANDS_PROVENANCE} ${VARIANT_TEXT}${painFrequencyConflict ? ` ${Q4_CONFLICT}` : ''} This is a symptom index and does not diagnose chronic prostatitis or indicate antibiotics.`,
    note: NOTE,
  };
}
