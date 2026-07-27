// spec-v530: the Vesikari clinical severity score for acute gastroenteritis. Zero-hit before this tile:
// "vesikari", "ruuska", and "rotavirus" across corpus.json, app.js, and lib/meta.js.
//
// A DIFFERENT AXIS FROM THE EXISTING gorelick AND clinical-dehydration-scale TILES. Those grade DEHYDRATION
// on examination at one moment: how dry is this child right now. Vesikari grades the SEVERITY OF THE WHOLE
// EPISODE -- how bad was this bout of gastroenteritis, counted over its entire course. It was built as a
// vaccine-trial endpoint, which is why it asks for durations and daily maxima rather than a bedside
// impression, and why dehydration is only one of its seven items. A child can be profoundly dehydrated today
// from a short, mild-scoring episode, and can score severely on Vesikari while looking well at the visit.
//
// SEVEN ITEMS, TOTAL 0-20. SIX ITEMS SCORE 0-3; THE SEVENTH SCORES 0-2:
//   duration of diarrhea (days)     0 / 1-4 / 5 / >=6
//   max diarrheal stools per 24h    0 / 1-3 / 4-5 / >=6
//   duration of vomiting (days)     0 / 1 / 2 / >=3
//   max vomiting episodes per 24h   0 / 1 / 2-4 / >=5
//   max temperature                 <37.1 / 37.1-38.4 / 38.5-38.9 / >=39.0 (Celsius)
//   dehydration (% body-weight loss) none / -- / 1-5% / >=6%     <-- NO 1-POINT ROW
//   treatment                       none / rehydration / hospitalization   <-- ONE item, max 2
// 3*6 + 2 = 20. Bands: below 7 mild, 7-10 moderate, 11 or more severe.
//
// TWO SHAPES THAT ARE EASY TO GET WRONG, BOTH PINNED BY TESTS:
//
// (1) DEHYDRATION HAS NO 1-POINT ROW. It scores 0, 2, or 3 -- never 1. Most sources agree; a minority
//     reproduction inserts a "little to mild" 1-point option, which would change mid-range totals. The
//     majority reading is used here and the gap is stated rather than quietly closed.
// (2) REHYDRATION AND HOSPITALIZATION ARE ONE ITEM, NOT TWO. Treatment is a single 0-2 item: no treatment 0,
//     rehydration 1, hospitalization 2. Scoring them as two separate items would push the maximum to 23 and
//     inflate every hospitalized child by a point.
//
// TEMPERATURE IS RECTAL-EQUIVALENT, AND THIS IS THE MOST COMMON SCORING ERROR. The scoring manual converts
// all non-rectal temperatures to their rectal equivalent before banding: add about 1 degree Fahrenheit for an
// oral or tympanic reading and about 2 for an axillary one. An axillary 38.5 C is NOT a 2-point fever. This
// tile takes the rectal-equivalent temperature and says so in the label rather than silently accepting
// whatever was measured.
//
// THIS IS NOT THE 24-POINT SCORE. A separate norovirus-specific instrument (Chen 2016) is also called a
// "modified Vesikari" score, adds four items (fever duration, GI hemorrhage, convulsion, abdominal
// pain/flatulence), compresses four others, and totals 24 with different bands. A third instrument, the
// Schnadower/Freedman "Modified Vesikari Score", also totals 20 but swaps dehydration for a future-healthcare
// visit and uses different band edges. This tile is the ORIGINAL Ruuska-Vesikari 20-point score and says so.
//
// HIGH-STAKES: it grades an episode's severity in retrospect. It is NOT a triage tool, NOT a measure of
// current dehydration -- the catalog's Gorelick and clinical dehydration scales answer that -- and NOT an
// indication to give oral or intravenous fluids, to admit, or to prescribe anything (spec-v11 section 5.3).
// It does not identify the pathogen, and it says nothing about the causes of vomiting and diarrhea that are
// not gastroenteritis, which is the assessment that has to happen first. The clinical decision stays with the
// clinician.
//
// ITEMS, POINTS, AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from sources agreeing on every
// row:
//   - Ruuska T, Vesikari T. Rotavirus disease in Finnish children: use of numerical scores for clinical
//     severity of diarrhoeal episodes. Scand J Infect Dis. 1990;22(3):259-267.
//   - A published scoring manual for the Vesikari system and multiple validation studies reproducing the same
//     seven items, the same 0-20 range, the same absent 1-point dehydration row, and the same bands.

export const VESIKARI_ITEMS = [
  {
    key: 'diarrheaDays',
    text: 'Duration of diarrhea',
    options: [
      { value: '0', text: '0 - none' },
      { value: '1', text: '1 - 1 to 4 days' },
      { value: '2', text: '2 - 5 days' },
      { value: '3', text: '3 - 6 days or more' },
    ],
  },
  {
    key: 'stoolsPerDay',
    text: 'Maximum diarrheal stools in 24 hours',
    options: [
      { value: '0', text: '0 - none' },
      { value: '1', text: '1 - 1 to 3' },
      { value: '2', text: '2 - 4 to 5' },
      { value: '3', text: '3 - 6 or more' },
    ],
  },
  {
    key: 'vomitingDays',
    text: 'Duration of vomiting',
    options: [
      { value: '0', text: '0 - none' },
      { value: '1', text: '1 - 1 day' },
      { value: '2', text: '2 - 2 days' },
      { value: '3', text: '3 - 3 days or more' },
    ],
  },
  {
    key: 'vomitsPerDay',
    text: 'Maximum vomiting episodes in 24 hours',
    options: [
      { value: '0', text: '0 - none' },
      { value: '1', text: '1 - 1' },
      { value: '2', text: '2 - 2 to 4' },
      { value: '3', text: '3 - 5 or more' },
    ],
  },
  {
    key: 'temperature',
    text: 'Maximum temperature, as a rectal-equivalent reading',
    options: [
      { value: '0', text: '0 - below 37.1 C' },
      { value: '1', text: '1 - 37.1 to 38.4 C' },
      { value: '2', text: '2 - 38.5 to 38.9 C' },
      { value: '3', text: '3 - 39.0 C or above' },
    ],
  },
  {
    key: 'dehydration',
    text: 'Dehydration, as percentage of body weight lost',
    // No 1-point row exists in the published table.
    options: [
      { value: '0', text: '0 - none' },
      { value: '2', text: '2 - 1 to 5 percent' },
      { value: '3', text: '3 - 6 percent or more' },
    ],
  },
  {
    key: 'treatment',
    text: 'Treatment (one item, not two)',
    options: [
      { value: '0', text: '0 - none' },
      { value: '1', text: '1 - rehydration' },
      { value: '2', text: '2 - hospitalization' },
    ],
  },
];

const MAX_TOTAL = 20;
const MODERATE_AT = 7;
const SEVERE_AT = 11;

const NOTE = 'The Vesikari clinical severity score (Ruuska and Vesikari 1990) grades a whole episode of acute gastroenteritis across seven items for a total of 0 to 20: below 7 is mild, 7 to 10 moderate, and 11 or more severe. It grades the episode, not the child at this moment: the Gorelick and clinical dehydration scales answer how dry a child is now, while this counts durations and daily maxima over the whole illness, which is why it was built as a vaccine-trial endpoint. Two shapes are easy to get wrong. Dehydration has no 1-point row, scoring 0, 2, or 3 and never 1. And rehydration and hospitalization are a single treatment item scoring 0 to 2, not two separate items, which is what keeps the maximum at 20. The temperature is a rectal-equivalent reading: the scoring manual converts other routes first, adding about one degree Fahrenheit for an oral or tympanic reading and about two for an axillary one, so an axillary 38.5 C is not a 2-point fever. This is the original 20-point score, not the 24-point norovirus modification, which adds four items and uses different bands, and not the Schnadower modified score, which also totals 20 but replaces dehydration with a future healthcare visit. It grades severity in retrospect. It is not a triage tool, not a measure of current dehydration, and not an indication to give fluids, to admit, or to prescribe anything. It does not identify the pathogen and says nothing about causes of vomiting and diarrhea that are not gastroenteritis, which is the assessment that has to happen first.';

function readItem(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const key = String(raw).trim();
  const option = item.options.find((o) => o.value === key);
  return option ? Number(option.value) : NaN;
}

// input: one key per entry in VESIKARI_ITEMS, each set to one of that item's option values.
export function vesikari(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = VESIKARI_ITEMS.map((item) => ({ item, points: readItem(item, o[item.key]) }));

  const missing = scored.filter((s) => s.points === null);
  if (missing.length) {
    return { valid: false, message: `Score every item. Still needed: ${missing.map((s) => s.item.text).join('; ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.points));
  if (bad.length) {
    const detail = bad.map((s) => `${s.item.text} (allowed: ${s.item.options.map((x) => x.value).join(', ')})`).join('; ');
    return { valid: false, message: `Unrecognized score for: ${detail}. Note dehydration has no 1-point option and treatment stops at 2.` };
  }

  const total = scored.reduce((a, s) => a + s.points, 0);

  let severity;
  if (total >= SEVERE_AT) severity = 'severe';
  else if (total >= MODERATE_AT) severity = 'moderate';
  else severity = 'mild';

  return {
    valid: true,
    total,
    severity,
    bandLabel: `Vesikari ${total} of ${MAX_TOTAL}`,
    band: `Vesikari ${total} of ${MAX_TOTAL}: ${severity} (below 7 mild, 7 to 10 moderate, 11 or more severe). This grades the whole episode in retrospect, not how dehydrated the child is now, and it is not a triage tool.`,
    note: NOTE,
  };
}
