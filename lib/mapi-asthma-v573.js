// spec-v573: the Modified Asthma Predictive Index (mAPI). "mapi", "guilbert", "castro-rodriguez",
// "predictive-index" and "api" were all zero-hit, and `grep -c "id: 'mapi-asthma'" app.js` returned 0.
//
// A GAP ON A DIFFERENT AXIS FROM EVERY ASTHMA TILE THE CATALOG ALREADY HAS. `asthma-control-test`,
// `childhood-act`, `pram-asthma` and `pass-asthma` all measure CURRENT control or CURRENT severity. None
// PREDICTS anything, and neither the original API nor the mAPI was present.
//
// **THIS IS NOT A SCORE. IT IS A TWO-GATE BOOLEAN, AND THERE IS NO TOTAL AND NO BAND TABLE.** The index is
// positive when BOTH gates are passed: at least four wheezing episodes in a year, AND either at least one
// major criterion or at least two minor criteria. Counting criteria into a single number would produce a
// figure the instrument does not define, and would let three minors substitute for the frequency gate,
// which they cannot.
//
// **THE CHANGE FROM THE ORIGINAL API TO THE mAPI IS A MOVE, NOT AN ADDITION, AND CALLING mAPI "API PLUS
// FOOD ALLERGY" IS WRONG.** Physician-diagnosed allergic rhinitis was REMOVED from the minor criteria and
// REPLACED by allergic sensitization to milk, egg or peanut; allergic sensitization to at least one
// aeroallergen was ADDED as a third major. Both lists end up with three items, but neither list is a
// superset of its predecessor -- a criterion left the instrument. Anyone treating the mAPI as the API with
// an extra item will score allergic rhinitis, which the mAPI does not contain.
//
// **THE TWO INDICES USE DIFFERENT WHEEZE DENOMINATORS AND THEIR INPUTS ARE NOT INTERCHANGEABLE.** The
// original API gates on a 1-to-5 frequency RATING SCALE, with the stringent version requiring 3 or more.
// The mAPI gates on a literal COUNT of at least four episodes per year. A rating of 3 is not four episodes,
// and substituting one for the other silently changes who qualifies.
//
// THE ORIGINAL API HAS TWO VARIANTS, LOOSE AND STRINGENT, WHICH IS WHY "API POSITIVE" IS AMBIGUOUS IN THE
// LITERATURE. The mAPI has only one form, so an mAPI result does not carry that ambiguity -- but a
// comparison against a quoted "API positive" does.
//
// THE EOSINOPHIL CRITERION IS AT LEAST 4 PERCENT. One secondary source renders it as "greater than 4
// percent"; the original criterion and an independent reproduction both use 4 percent OR MORE, so exactly
// 4.0 percent MEETS the criterion here, and the result says so at that value rather than everywhere
// (spec-v97).
//
// HIGH-STAKES: the outcome is not "will wheeze next winter". The index is applied at ages one to three and
// was validated against an asthma diagnosis at ages SIX, EIGHT and ELEVEN -- a horizon of years -- and in a
// HIGH-RISK cohort, so its positive predictive value is strongly population-dependent and will be lower in
// unselected children. It does NOT diagnose asthma at any age, and it does not exclude it: a negative index
// in a wheezing child does not mean the wheeze is benign, and the causes that matter most -- foreign body,
// structural airway disease, cystic fibrosis, immunodeficiency, and aspiration -- are not asthma and are
// not what this index is about. It is NOT an indication to start inhaled corticosteroids or any other
// controller, and treating a positive index as a prescription is the misuse it most invites (spec-v11
// section 5.3). The clinical decision stays with the clinician.
//
// CRITERIA AND THE POSITIVITY RULE RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// sources agreeing on the structure, the item wording and the positivity rule:
//   - Chang TS, Lemanske RF Jr, Guilbert TW, et al. Evaluation of the Modified Asthma Predictive Index in
//     High-Risk Preschool Children. J Allergy Clin Immunol Pract. 2013;1(2):152-156.

export const WHEEZE_EPISODE_THRESHOLD = 4; // episodes per year
export const EOSINOPHIL_THRESHOLD = 4;     // percent, AT LEAST
export const MAJORS_REQUIRED = 1;
export const MINORS_REQUIRED = 2;

export const MAPI_MAJOR_CRITERIA = [
  { key: 'parentalAsthma', text: 'Parental physician-diagnosed asthma' },
  { key: 'atopicDermatitis', text: 'Physician-diagnosed atopic dermatitis' },
  { key: 'aeroallergenSensitization', text: 'Allergic sensitization to at least one aeroallergen', addedInMapi: true },
];

export const MAPI_MINOR_CRITERIA = [
  { key: 'wheezeApartFromColds', text: 'Wheezing unrelated to colds' },
  { key: 'eosinophilia', text: `Blood eosinophils ${EOSINOPHIL_THRESHOLD} percent or more` },
  { key: 'foodSensitization', text: 'Allergic sensitization to milk, egg, or peanut', addedInMapi: true },
];

// What the modification actually did, carried so the tile can say it.
export const REMOVED_FROM_API = 'Physician-diagnosed allergic rhinitis, which was a MINOR criterion in the original API and is NOT part of the mAPI.';

const TWO_GATE_TEXT = `This is not a score. It is a two-gate boolean: at least ${WHEEZE_EPISODE_THRESHOLD} wheezing episodes in a year AND either at least ${MAJORS_REQUIRED} major criterion or at least ${MINORS_REQUIRED} minor criteria. There is no total and no band table, and criteria cannot substitute for the frequency gate.`;

const MOVE_TEXT = `The modification was a MOVE, not an addition: allergic rhinitis was REMOVED from the minor criteria and replaced by sensitization to milk, egg or peanut, while aeroallergen sensitization was ADDED as a third major. Both lists have three items, but neither is a superset of its predecessor, so calling the mAPI "the API plus food allergy" is wrong and would score allergic rhinitis, which the mAPI does not contain.`;

const DENOMINATOR_TEXT = `The original API gates on a 1-to-5 frequency RATING SCALE, stringent at 3 or more, while the mAPI gates on a literal COUNT of at least ${WHEEZE_EPISODE_THRESHOLD} episodes per year. A rating of 3 is not four episodes, and the two inputs are not interchangeable. The original API also comes in loose and stringent variants, which is why a quoted "API positive" is ambiguous; the mAPI has only one form.`;

const HORIZON_TEXT = 'The index is applied at ages one to three and was validated against an asthma diagnosis at ages six, eight and eleven, a horizon of years, in a HIGH-RISK cohort. Its positive predictive value is strongly population-dependent and will be lower in unselected children.';

const EOS_BOUNDARY = `The eosinophil criterion is ${EOSINOPHIL_THRESHOLD} percent OR MORE, so exactly ${EOSINOPHIL_THRESHOLD}.0 percent MEETS it. One secondary source renders the criterion as "greater than 4 percent"; the original and an independent reproduction both use "or more", which is followed here.`;

const NOTE = 'The Modified Asthma Predictive Index (mAPI, as validated by Chang and colleagues 2013) predicts later asthma in preschool children who wheeze. It is not a score but a two-gate boolean: the index is positive when there have been at least four wheezing episodes in a year AND either at least one major criterion or at least two minor criteria. The major criteria are parental physician-diagnosed asthma, physician-diagnosed atopic dermatitis, and allergic sensitization to at least one aeroallergen. The minor criteria are wheezing unrelated to colds, blood eosinophils of 4 percent or more, and allergic sensitization to milk, egg or peanut. There is no total and no band table, and criteria cannot substitute for the frequency gate. The change from the original API was a move rather than an addition: physician-diagnosed allergic rhinitis was removed from the minor criteria and replaced by food sensitization, while aeroallergen sensitization was added as a third major, so both lists have three items but neither is a superset of its predecessor, and describing the mAPI as the API plus food allergy is wrong because it would score allergic rhinitis, which the mAPI does not contain. The two indices also use different wheeze denominators: the original gates on a 1-to-5 frequency rating scale with the stringent version requiring 3 or more, while the mAPI gates on a literal count of at least four episodes per year, so a rating of 3 is not four episodes and the inputs are not interchangeable. The original API further comes in loose and stringent variants, which is why a quoted API positive is ambiguous, whereas the mAPI has only one form. The eosinophil criterion is 4 percent or more, so exactly 4.0 percent meets it, one secondary source rendering it as greater than 4 percent being a loose paraphrase. The outcome is not near-term wheezing: the index is applied at ages one to three and was validated against an asthma diagnosis at ages six, eight and eleven, a horizon of years, and in a high-risk cohort, so its positive predictive value is strongly population-dependent and will be lower in unselected children. It does not diagnose asthma at any age and does not exclude it, so a negative index in a wheezing child does not mean the wheeze is benign, and the causes that matter most, including foreign body, structural airway disease, cystic fibrosis, immunodeficiency and aspiration, are not asthma and are not what this index is about. It is not an indication to start inhaled corticosteroids or any other controller, and treating a positive index as a prescription is the misuse it most invites.';

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
//   wheezeEpisodes -- count of wheezing episodes in the past year.
//   one key per criterion in MAPI_MAJOR_CRITERIA and MAPI_MINOR_CRITERIA, each yes/no.
//   eosinophilPercent -- optional; if given it decides the eosinophilia criterion instead of the yes/no.
export function mapiAsthma(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const rawEpisodes = o.wheezeEpisodes;
  if (rawEpisodes === '' || rawEpisodes === null || rawEpisodes === undefined) {
    return { valid: false, message: `Enter the number of wheezing episodes in the past year. The mAPI gates on a literal COUNT of at least ${WHEEZE_EPISODE_THRESHOLD}, not on the original API's 1-to-5 rating scale.` };
  }
  const episodes = Number(String(rawEpisodes).trim());
  if (!Number.isFinite(episodes) || episodes < 0 || episodes > 365) {
    return { valid: false, message: 'The wheezing episode count must be a number between 0 and 365.' };
  }

  // An explicit eosinophil percentage overrides the yes/no, and pins the boundary.
  let eosinophilPercent = null;
  const rawEos = o.eosinophilPercent;
  if (rawEos !== '' && rawEos !== null && rawEos !== undefined) {
    const n = Number(String(rawEos).trim());
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      return { valid: false, message: 'The eosinophil percentage must be a number between 0 and 100.' };
    }
    eosinophilPercent = n;
  }

  const readCriterion = (c) => {
    if (c.key === 'eosinophilia' && eosinophilPercent !== null) {
      return eosinophilPercent >= EOSINOPHIL_THRESHOLD;
    }
    return readBool(o[c.key]);
  };

  const majors = [];
  for (const c of MAPI_MAJOR_CRITERIA) {
    const v = readCriterion(c);
    if (v === null) return { valid: false, message: `Answer every major criterion. Still needed: ${c.key}.` };
    if (Number.isNaN(v)) return { valid: false, message: `Each criterion must be yes or no. Unrecognized: ${c.key}.` };
    majors.push({ key: c.key, present: v });
  }

  const minors = [];
  for (const c of MAPI_MINOR_CRITERIA) {
    const v = readCriterion(c);
    if (v === null) return { valid: false, message: `Answer every minor criterion, or supply an eosinophil percentage. Still needed: ${c.key}.` };
    if (Number.isNaN(v)) return { valid: false, message: `Each criterion must be yes or no. Unrecognized: ${c.key}.` };
    minors.push({ key: c.key, present: v });
  }

  const majorCount = majors.filter((m) => m.present).length;
  const minorCount = minors.filter((m) => m.present).length;

  const frequencyGate = episodes >= WHEEZE_EPISODE_THRESHOLD;
  const criteriaGate = majorCount >= MAJORS_REQUIRED || minorCount >= MINORS_REQUIRED;
  const positive = frequencyGate && criteriaGate;

  const onEosBoundary = eosinophilPercent !== null && eosinophilPercent === EOSINOPHIL_THRESHOLD;

  const why = [];
  if (!frequencyGate) why.push(`the frequency gate is not met: ${episodes} wheezing episodes, and at least ${WHEEZE_EPISODE_THRESHOLD} are required`);
  if (!criteriaGate) why.push(`neither criteria gate is met: ${majorCount} major and ${minorCount} minor, and at least ${MAJORS_REQUIRED} major or ${MINORS_REQUIRED} minor are required`);

  return {
    valid: true,
    positive,
    wheezeEpisodes: episodes,
    frequencyGate,
    criteriaGate,
    majorCount,
    minorCount,
    eosinophilPercent,
    onEosBoundary,
    bandLabel: positive ? 'mAPI positive' : 'mAPI negative',
    bandText: `mAPI ${positive ? 'POSITIVE' : 'NEGATIVE'}: ${episodes} wheezing episodes in the past year, ${majorCount} of ${MAPI_MAJOR_CRITERIA.length} major and ${minorCount} of ${MAPI_MINOR_CRITERIA.length} minor criteria.${positive ? '' : ` Not met because ${why.join('; and ')}.`} ${TWO_GATE_TEXT} ${MOVE_TEXT} ${DENOMINATOR_TEXT}${onEosBoundary ? ` ${EOS_BOUNDARY}` : ''} ${HORIZON_TEXT} This does not diagnose or exclude asthma and is not an indication to start inhaled corticosteroids.`,
    note: NOTE,
  };
}
