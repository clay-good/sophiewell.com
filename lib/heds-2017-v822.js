// spec-v822: 2017 international diagnostic criteria for hypermobile Ehlers-Danlos syndrome.
//
// Source:
//   Malfait F, Francomano C, Byers P, et al. The 2017 international classification of the
//   Ehlers-Danlos syndromes. Am J Med Genet C Semin Med Genet. 2017;175(1):8-26, and the
//   Ehlers-Danlos Society's own diagnostic checklist, from which the wording and every
//   threshold here were taken.
//
// All three criteria must hold simultaneously.
//
// CRITERION 1 - generalized joint hypermobility, by Beighton score against an AGE- AND
//   SEX-ADJUSTED cutoff:
//     >=6  pre-pubertal children and adolescents
//     >=5  pubertal men and women to age 50
//     >=4  men and women over 50
//   If the Beighton score is exactly ONE POINT BELOW the cutoff, two or more items of the
//   five-part questionnaire must also be positive for the criterion to be met.
//
// CRITERION 2 - two or more of features A, B and C:
//     A  five or more of twelve connective-tissue findings
//     B  a first-degree relative independently meeting the criteria
//     C  at least one of three musculoskeletal complications
//
// CRITERION 3 - all three prerequisites: no unusual skin fragility; other heritable and
//   acquired connective-tissue disorders excluded; alternative diagnoses excluded.
//
// THE RULE THAT CATCHES PEOPLE IS INSIDE CRITERION 3. In a patient who has an ACQUIRED
// connective-tissue disorder - lupus, rheumatoid arthritis - an additional diagnosis of hEDS
// requires meeting BOTH Feature A AND Feature B, and Feature C cannot be counted at all.
// So "any two of A, B and C" is wrong for exactly the patients most likely to be assessed
// for it: those already carrying a rheumatologic diagnosis, in whom chronic pain and
// instability are least specific. A tool applying the general rule there would diagnose hEDS
// on A+C or B+C where the criteria forbid it.
//
// Pure: no DOM, no clock, no network.

export const HEDS_NOTE = 'The 2017 international criteria for hypermobile Ehlers-Danlos syndrome (Malfait F, Francomano C, Byers P, et al, Am J Med Genet C 2017;175(1):8-26) need all three of the following at the same time. First, generalized joint hypermobility on the Beighton score against an age- and sex-adjusted cutoff: six or more for pre-pubertal children and adolescents, five or more for pubertal men and women up to fifty, four or more above fifty; and if the score is exactly one point below that cutoff, two or more items of the five-part questionnaire must also be positive. Second, two or more of three features: at least five of twelve connective-tissue findings, a first-degree relative independently meeting the criteria, and at least one of three musculoskeletal complications. Third, all of no unusual skin fragility, exclusion of other heritable and acquired connective-tissue disorders, and exclusion of alternative causes of hypermobility. One rule inside the third criterion is easy to miss and matters most in the patients most often assessed. In someone who already has an acquired connective-tissue disorder such as lupus or rheumatoid arthritis, an additional diagnosis needs both the first and second features together, and the musculoskeletal-complications feature cannot be counted at all, because chronic pain and instability are least specific in exactly that group. It applies published criteria to findings already gathered and it does not arrange genetic testing or physiotherapy.';

const FEATURE_A = [
  'unusually soft or velvety skin',
  'mild skin hyperextensibility',
  'unexplained striae without significant weight change',
  'bilateral piezogenic papules of the heel',
  'recurrent or multiple abdominal hernias',
  'atrophic scarring at two or more sites',
  'pelvic floor, rectal or uterine prolapse without a predisposing condition',
  'dental crowding and a high or narrow palate',
  'arachnodactyly by wrist or thumb sign, bilaterally',
  'arm span to height ratio of 1.05 or more',
  'mitral valve prolapse, mild or greater, on strict echocardiographic criteria',
  'aortic root dilatation with a Z score above 2',
];

const FEATURE_C = [
  'musculoskeletal pain in two or more limbs, recurring daily for at least 3 months',
  'chronic widespread pain for 3 months or more',
  'recurrent joint dislocations or frank joint instability, without trauma',
];

const QUESTIONNAIRE = [
  'can, or could ever, place the hands flat on the floor without bending the knees',
  'can, or could ever, bend the thumb to touch the forearm',
  'as a child, amused friends by contorting the body or could do the splits',
  'as a child or teenager, dislocated a shoulder or kneecap more than once',
  'considers themselves double-jointed',
];

// Age- and sex-adjusted Beighton cutoffs, from criterion 1.
const GROUPS = {
  'prepubertal-or-adolescent': { cutoff: 6, text: 'pre-pubertal children and adolescents' },
  'pubertal-to-50': { cutoff: 5, text: 'pubertal men and women to age 50' },
  'over-50': { cutoff: 4, text: 'men and women over the age of 50' },
};

export const FEATURE_A_THRESHOLD = 5;
export const BEIGHTON_MAX = 9;

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function countTrue(o, prefix, n) {
  let c = 0;
  for (let i = 1; i <= n; i += 1) if (truthy(o[prefix + i])) c += 1;
  return c;
}

export function heds2017(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const beighton = num(o.beightonScore);
  if (beighton !== null && (beighton < 0 || beighton > BEIGHTON_MAX)) {
    return { valid: false, message: `Beighton score must be between 0 and ${BEIGHTON_MAX}.` };
  }

  const groupKey = String(o.ageGroup == null ? '' : o.ageGroup).trim().toLowerCase() || 'pubertal-to-50';
  const group = GROUPS[groupKey];
  if (!group) return { valid: false, message: 'Age group must be prepubertal-or-adolescent, pubertal-to-50 or over-50.' };

  // Criterion 1, with the one-point-below rescue.
  const questionnaireCount = countTrue(o, 'q', QUESTIONNAIRE.length);
  const atCutoff = beighton !== null && beighton >= group.cutoff;
  const onePointBelow = beighton !== null && beighton === group.cutoff - 1;
  const rescued = onePointBelow && questionnaireCount >= 2;
  const criterion1 = atCutoff || rescued;

  const rescueNote = onePointBelow
    ? (rescued
      ? `A Beighton score of ${beighton} is one point below the cutoff of ${group.cutoff} for ${group.text}, but ${questionnaireCount} of the five questionnaire items are positive, which meets criterion 1.`
      : `A Beighton score of ${beighton} is one point below the cutoff of ${group.cutoff} for ${group.text}. Two or more of the five questionnaire items would meet criterion 1; ${questionnaireCount} ${questionnaireCount === 1 ? 'is' : 'are'} positive.`)
    : null;

  // Criterion 2.
  const featureACount = countTrue(o, 'a', FEATURE_A.length);
  const featureA = featureACount >= FEATURE_A_THRESHOLD;
  const featureB = truthy(o.familyHistory);
  const featureCCount = countTrue(o, 'c', FEATURE_C.length);
  const featureC = featureCCount >= 1;

  const acquiredCtd = truthy(o.acquiredCtd);
  // The special rule: with an acquired CTD, A AND B are required and C counts for nothing.
  const criterion2 = acquiredCtd
    ? (featureA && featureB)
    : ([featureA, featureB, featureC].filter(Boolean).length >= 2);

  const acquiredNote = acquiredCtd
    ? (featureC && !(featureA && featureB)
      ? 'An acquired connective-tissue disorder is recorded. In that situation the criteria require BOTH feature A and feature B, and feature C cannot be counted at all - so the musculoskeletal complications here do not contribute. Two of A, B and C is not the rule for this patient.'
      : 'An acquired connective-tissue disorder is recorded, so criterion 2 requires both feature A and feature B; feature C cannot be counted.')
    : null;

  // Criterion 3.
  const noSkinFragility = truthy(o.noSkinFragility);
  const otherCtdExcluded = truthy(o.otherCtdExcluded);
  const alternativesExcluded = truthy(o.alternativesExcluded);
  const criterion3 = noSkinFragility && otherCtdExcluded && alternativesExcluded;

  const met = criterion1 && criterion2 && criterion3;

  const missing = [];
  if (!criterion1) missing.push(`criterion 1, generalized joint hypermobility (Beighton cutoff ${group.cutoff} for ${group.text})`);
  if (!criterion2) missing.push(acquiredCtd ? 'criterion 2, which here needs both feature A and feature B' : 'criterion 2, two or more of features A, B and C');
  if (!criterion3) missing.push('criterion 3, all three exclusion prerequisites');

  return {
    valid: true,
    criteriaMet: met,
    criterion1,
    criterion2,
    criterion3,
    beightonCutoff: group.cutoff,
    questionnaireCount,
    featureACount,
    features: { a: featureA, b: featureB, c: featureC },
    featureCCounted: !acquiredCtd,
    rescueNote,
    acquiredNote,
    missing,
    abnormal: met,
    bandLabel: met ? 'hEDS criteria met' : 'hEDS criteria not met',
    band: met
      ? 'The 2017 criteria for hypermobile Ehlers-Danlos syndrome are met — all three criteria hold simultaneously.'
      : `The 2017 criteria for hypermobile Ehlers-Danlos syndrome are not met — outstanding: ${missing.join('; ')}.`,
    detail: `Criterion 1 uses an age- and sex-adjusted Beighton cutoff, ${group.cutoff} for ${group.text}, with a five-part questionnaire rescue exactly one point below it. Criterion 2 needs two of three features, except in an acquired connective-tissue disorder where features A and B are both required and feature C cannot be counted. Criterion 3 needs all three prerequisites.`,
    note: HEDS_NOTE,
  };
}

export { FEATURE_A, FEATURE_C, QUESTIONNAIRE, GROUPS };
