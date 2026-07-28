// spec-v554: the Global Acne Grading System (GAGS). WHOLE-CONCEPT GAP: "gags", "acne", "comedone" and
// "doshi" were ALL zero-hit across corpus.json, app.js and lib/meta.js. The catalog had no acne content of
// any kind.
//
// SIX REGIONS, EACH WITH A FIXED FACTOR, TIMES A LESION GRADE 0-4. The factors sum to 11, so the global
// score runs 0 to 44.
//   forehead 2, right cheek 2, left cheek 2, nose 1, chin 1, chest and upper back 3
//
// **EACH REGION IS SCORED BY ITS SINGLE MOST SEVERE LESION TYPE, NOT BY COUNTING LESIONS AND NOT BY ADDING
// LESION TYPES TOGETHER.** The grade is 1 for at least one comedone, 2 for at least one papule, 3 for at
// least one pustule, 4 for at least one nodule -- and the grade is the HIGHEST of those present. A forehead
// carrying comedones, papules and one nodule is grade 4, not 1+2+4. Summing lesion types would roughly
// triple the score of anyone with mixed disease, which is most patients with acne.
//
// **"CHEST AND UPPER BACK" IS ONE COMBINED REGION WITH A SINGLE FACTOR OF 3, NOT TWO SITES.** A patient
// with truncal acne cannot score chest and back separately. Splitting it into two regions of 3 would take
// the maximum from 44 to 47 and would over-weight truncal disease against the face, which is the opposite
// of what the regional factors were derived to do -- they come from surface area and the density of
// pilosebaceous units.
//
// **THE SOURCE TABLE LEAVES 39 UNASSIGNED, AND THIS TILE REPORTS THAT RATHER THAN PATCHING IT.** The
// published bands are 0 none, 1-18 mild, 19-30 moderate, 31-38 SEVERE, and above 39 VERY SEVERE. A score of
// exactly 39 falls in no band. It is reachable -- several region combinations land on it -- so this is a
// real gap in the source, not a theoretical one. Two independent reproductions of the table print it the
// same way, which is why it is treated as the source's text rather than as one publisher's typo. Many
// tertiary sources silently rewrite the top band as "39 or above" and thereby erase the defect. This lib
// returns the score with `bandAssigned: false` at exactly 39 and states what the primary table prints,
// because quietly choosing a reading would hide a real ambiguity at the boundary between the two most
// severe categories -- the boundary where the choice matters most.
//
// HIGH-STAKES: a severity grading. It does NOT diagnose acne or distinguish it from rosacea, folliculitis,
// perioral dermatitis, or an acneiform drug eruption, several of which are managed quite differently. It
// does not detect the features that change management independently of severity -- scarring, post-
// inflammatory pigmentation, the psychological burden, or signs of hyperandrogenism -- and a low score in a
// patient who is scarring or severely distressed is not a reason to withhold treatment. It does not select
// therapy and is not an indication for isotretinoin or for any antibiotic (spec-v11 section 5.3). The
// treatment decision stays with the clinician.
//
// FACTORS, GRADES AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// reproductions of the original table that agree on every factor, every grade and every band boundary,
// including the gap at 39:
//   - Doshi A, Zaheer A, Stiller MJ. A comparison of current acne grading systems and proposal of a novel
//     system. Int J Dermatol. 1997;36(6):416-418.
//   - Two independent journal reproductions of that table, and a review confirming the six-region structure.

export const GAGS_REGIONS = [
  { key: 'forehead', text: 'Forehead', factor: 2 },
  { key: 'rightCheek', text: 'Right cheek', factor: 2 },
  { key: 'leftCheek', text: 'Left cheek', factor: 2 },
  { key: 'nose', text: 'Nose', factor: 1 },
  { key: 'chin', text: 'Chin', factor: 1 },
  { key: 'trunk', text: 'Chest and upper back (ONE combined region, not two)', factor: 3 },
];

// The grade is the MOST SEVERE lesion present in the region, never a sum of lesion types.
export const GAGS_GRADES = [
  { value: 0, text: 'No lesions' },
  { value: 1, text: 'At least one comedone' },
  { value: 2, text: 'At least one papule' },
  { value: 3, text: 'At least one pustule' },
  { value: 4, text: 'At least one nodule' },
];

export const GAGS_MAX = 44; // factors sum to 11, times a maximum grade of 4
export const UNASSIGNED_SCORE = 39;

const BANDS = [
  { max: 0, label: 'None' },
  { max: 18, label: 'Mild' },
  { max: 30, label: 'Moderate' },
  { max: 38, label: 'Severe' },
];
const TOP_BAND = 'Very severe';

const GAP_TEXT = 'The published table assigns NO band to a score of exactly 39. It prints severe as 31 to 38 and very severe as ABOVE 39, so 39 itself falls in neither, and this score is reachable. Two independent reproductions of the table print it the same way, so this is the source’s text rather than one publisher’s typo. Many tertiary sources silently rewrite the top band as 39 or above and erase the gap; this reports it instead, because the ambiguity sits exactly on the boundary between the two most severe categories, where the choice matters most.';

const GRADE_RULE = 'Each region is graded by its single MOST SEVERE lesion, never by counting lesions or adding lesion types: a region with comedones, papules and one nodule is grade 4, not 1 plus 2 plus 4.';

const NOTE = 'The Global Acne Grading System (Doshi and colleagues 1997) multiplies a fixed factor for each of six regions by a lesion grade from 0 to 4, and sums the six products. The factors are 2 for the forehead, 2 for each cheek, 1 for the nose, 1 for the chin, and 3 for the chest and upper back together; they sum to 11, so the global score runs from 0 to 44. Each region is graded by its single most severe lesion, 1 for at least one comedone, 2 for at least one papule, 3 for at least one pustule and 4 for at least one nodule, and never by counting lesions or by adding lesion types, so a region with comedones, papules and one nodule is grade 4 rather than 1 plus 2 plus 4. Summing lesion types would roughly triple the score of anyone with mixed disease, which is most patients. The chest and upper back are ONE combined region with a single factor of 3, not two sites, so truncal acne cannot be scored separately for chest and back; splitting them would take the maximum from 44 to 47 and over-weight the trunk against the face, which is the opposite of what the regional factors, derived from surface area and pilosebaceous unit density, were meant to do. The bands are 0 none, 1 to 18 mild, 19 to 30 moderate, 31 to 38 severe, and above 39 very severe. A score of exactly 39 falls in NO band in the published table, and it is reachable; two independent reproductions print it the same way, so this is the source’s own gap rather than a typo, and it is reported rather than silently patched, since many tertiary sources rewrite the top band as 39 or above and thereby erase a real ambiguity at the boundary between the two most severe categories. This grades severity. It does not diagnose acne or distinguish it from rosacea, folliculitis, perioral dermatitis or an acneiform drug eruption, several of which are managed quite differently. It does not detect the features that change management independently of severity, including scarring, post-inflammatory pigmentation, psychological burden and signs of hyperandrogenism, and a low score in a patient who is scarring or severely distressed is not a reason to withhold treatment. It does not select therapy and is not an indication for isotretinoin or for any antibiotic.';

function readGrade(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

// input: one key per region in GAGS_REGIONS, each a grade 0-4. All six required.
export function gags(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const scored = GAGS_REGIONS.map((region) => ({ region, grade: readGrade(o[region.key]) }));

  const missing = scored.filter((s) => s.grade === null);
  if (missing.length) {
    return { valid: false, message: `Grade all six regions from 0 to 4, using the most severe lesion in each. Still needed: ${missing.map((s) => s.region.key).join(', ')}.` };
  }
  const bad = scored.filter((s) => Number.isNaN(s.grade));
  if (bad.length) {
    return { valid: false, message: `Each region grade must be a whole number from 0 to 4, and is the MOST SEVERE lesion present rather than a sum of lesion types. Unrecognized: ${bad.map((s) => s.region.key).join(', ')}.` };
  }

  const regionScores = scored.map((s) => ({
    key: s.region.key, factor: s.region.factor, grade: s.grade, local: s.region.factor * s.grade,
  }));
  const total = regionScores.reduce((a, r) => a + r.local, 0);

  const gapAtThirtyNine = total === UNASSIGNED_SCORE;
  const matched = BANDS.find((b) => total <= b.max);
  const band = gapAtThirtyNine ? null : (matched ? matched.label : TOP_BAND);

  return {
    valid: true,
    total,
    max: GAGS_MAX,
    regionScores,
    band,
    bandAssigned: !gapAtThirtyNine,
    bandLabel: gapAtThirtyNine ? `GAGS ${total} of ${GAGS_MAX}, no band in the published table` : `GAGS ${total} of ${GAGS_MAX}, ${band.toLowerCase()}`,
    bandText: gapAtThirtyNine
      ? `GAGS ${total} of ${GAGS_MAX}. ${GAP_TEXT} ${GRADE_RULE} This grades severity and does not diagnose acne or select therapy.`
      : `GAGS ${total} of ${GAGS_MAX}: ${band.toLowerCase()}. ${GRADE_RULE} This grades severity and does not diagnose acne or select therapy, and it does not capture scarring, pigmentation or psychological burden, any of which can change management at a low score.`,
    note: NOTE,
  };
}
