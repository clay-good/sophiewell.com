// spec-v821: revised Ghent nosology (2010) for Marfan syndrome and related conditions.
//
// Source:
//   Loeys BL, Dietz HC, Braverman AC, et al. The revised Ghent nosology for the Marfan
//   syndrome. J Med Genet. 2010;47(7):476-485. Box 1 (diagnostic rules) and Box 2
//   (systemic score) are encoded here verbatim from the paper.
//
// BOX 1, in the ABSENCE of a family history:
//   (1) Ao (Z>=2) AND ectopia lentis                      = MFS*
//   (2) Ao (Z>=2) AND FBN1                                = MFS
//   (3) Ao (Z>=2) AND systemic score >=7                  = MFS*
//   (4) EL AND an FBN1 known to be associated with aortic disease = MFS
//       EL with or without systemic findings, with an FBN1 NOT known with Ao or no FBN1 = ELS
//       Ao (Z<2) AND systemic >=5 with at least one skeletal feature, without EL = MASS
//       MVP AND Ao (Z<2) AND systemic <5, without EL      = MVPS
//
// BOX 1, in the PRESENCE of a family history:
//   (5) EL AND family history                             = MFS
//   (6) systemic score >=7 AND family history             = MFS*
//   (7) Ao (Z>=2 above 20 years old, Z>=3 BELOW 20) AND family history = MFS
//
// * carries the paper's own caveat: only without discriminating features of Shprintzen-
//   Goldberg, Loeys-Dietz or vascular Ehlers-Danlos, and after TGFBR1/2, collagen
//   biochemistry and COL3A1 testing where indicated.
//
// THREE THINGS THAT GET LOST WHEN THIS IS SUMMARISED:
//
//   1. The aortic Z threshold is AGE-DEPENDENT, but only in rule 7. With a family history,
//      someone under 20 needs Z>=3, not Z>=2. Applying the adult threshold to a child with
//      an affected parent calls Marfan syndrome at a root size the nosology does not.
//
//   2. The FBN1 answer is not yes/no. A mutation KNOWN to be associated with aortic root
//      disease satisfies rule 4; one NOT known with aortic disease does not, and sends the
//      same patient to ectopia lentis syndrome instead. A boolean cannot express that.
//
//   3. The nosology returns four different diagnoses, not one verdict. MASS and MVPS are
//      real outcomes of the rules, not "not Marfan". A tool that answered only yes-or-no
//      would discard the distinction the 2010 revision was largely written to draw.
//
// Pure: no DOM, no clock, no network.

export const GHENT_NOTE = 'The revised Ghent nosology (Loeys BL, Dietz HC, Braverman AC, et al, J Med Genet 2010;47(7):476-485) diagnoses Marfan syndrome from two cardinal features, aortic root enlargement and ectopia lentis, together with FBN1 status, family history and a systemic score out of 20 points. Without a family history, aortic root dilatation at a Z score of 2 or more plus ectopia lentis, or plus an FBN1 mutation, or plus a systemic score of 7 or more, each establish the diagnosis; so does ectopia lentis with an FBN1 mutation already known to be associated with aortic disease. With a family history, ectopia lentis alone, a systemic score of 7 or more alone, or aortic dilatation alone will do, but the aortic threshold there rises to a Z score of 3 for anyone under twenty. Three points get lost in summaries. That age-dependent threshold applies only to the family-history rule, so using the adult figure for a child with an affected parent calls Marfan syndrome at a root size the nosology does not. The FBN1 answer is not a yes or no, because a mutation known to be associated with aortic root disease and one not known with it lead to different diagnoses in the same patient. And the nosology returns four possible answers rather than one verdict: Marfan syndrome, ectopia lentis syndrome, MASS phenotype and mitral valve prolapse syndrome are all outcomes of the rules. It applies published criteria to findings already gathered and it does not order the echocardiogram, the slit-lamp examination or the genetic testing they depend on.';

// Box 2. The graded items carry their two published levels; the rest are one point each.
const SYSTEMIC = [
  { arg: 'wristThumb', kind: 'graded', levels: { both: 3, one: 1, none: 0 },
    text: { both: 'wrist AND thumb sign', one: 'wrist OR thumb sign' }, skeletal: true },
  { arg: 'pectus', kind: 'graded', levels: { carinatum: 2, excavatum: 1, none: 0 },
    text: { carinatum: 'pectus carinatum', excavatum: 'pectus excavatum or chest asymmetry' }, skeletal: true },
  { arg: 'hindfoot', kind: 'graded', levels: { deformity: 2, planus: 1, none: 0 },
    text: { deformity: 'hindfoot deformity', planus: 'plain pes planus' }, skeletal: true },
  { arg: 'pneumothorax', kind: 'flag', points: 2, text: 'pneumothorax', skeletal: false },
  { arg: 'duralEctasia', kind: 'flag', points: 2, text: 'dural ectasia', skeletal: false },
  { arg: 'protrusioAcetabuli', kind: 'flag', points: 2, text: 'protrusio acetabuli', skeletal: true },
  { arg: 'segmentRatio', kind: 'flag', points: 1, text: 'reduced upper/lower segment ratio AND increased arm span to height AND no severe scoliosis', skeletal: true },
  { arg: 'scoliosis', kind: 'flag', points: 1, text: 'scoliosis or thoracolumbar kyphosis', skeletal: true },
  { arg: 'reducedElbowExtension', kind: 'flag', points: 1, text: 'reduced elbow extension', skeletal: true },
  { arg: 'facialFeatures', kind: 'flag', points: 1, text: 'facial features, 3 of 5', skeletal: true },
  { arg: 'skinStriae', kind: 'flag', points: 1, text: 'skin striae', skeletal: false },
  { arg: 'myopia', kind: 'flag', points: 1, text: 'myopia over 3 diopters', skeletal: false },
  { arg: 'mvp', kind: 'flag', points: 1, text: 'mitral valve prolapse, all types', skeletal: false },
];

export const MAX_SYSTEMIC = 20;
export const SYSTEMIC_MFS = 7;
export const SYSTEMIC_MASS = 5;
export const Z_ADULT = 2;
export const Z_UNDER_20_WITH_FH = 3;
export const AGE_CUTOFF = 20;

const FBN1_STATES = ['none', 'known-with-ao', 'not-known-with-ao'];

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }
function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function pick(v, fallback) { return String(v == null ? '' : v).trim().toLowerCase() || fallback; }

export function ghentMarfan(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const z = num(o.aorticZScore);
  const age = num(o.age);
  if (z !== null && (z < -20 || z > 40)) return { valid: false, message: 'Aortic root Z score is out of range.' };
  if (age !== null && (age < 0 || age > 130)) return { valid: false, message: 'Age must be between 0 and 130 years.' };

  const fbn1 = pick(o.fbn1, 'none');
  if (!FBN1_STATES.includes(fbn1)) {
    return { valid: false, message: 'FBN1 status must be none, known-with-ao or not-known-with-ao.' };
  }

  // Systemic score, Box 2.
  let score = 0;
  const contributing = [];
  let skeletalPresent = false;
  for (const item of SYSTEMIC) {
    let pts = 0, label = null;
    if (item.kind === 'graded') {
      const level = pick(o[item.arg], 'none');
      if (!Object.prototype.hasOwnProperty.call(item.levels, level)) {
        return { valid: false, message: `Unrecognized value for ${item.arg}.` };
      }
      pts = item.levels[level];
      if (pts > 0) label = item.text[level];
    } else if (truthy(o[item.arg])) {
      pts = item.points;
      label = item.text;
    }
    if (pts > 0) {
      score += pts;
      contributing.push(`${label} (+${pts})`);
      if (item.skeletal) skeletalPresent = true;
    }
  }

  const familyHistory = truthy(o.familyHistory);
  const ectopiaLentis = truthy(o.ectopiaLentis);
  const mvp = truthy(o.mvp);
  const differentialExcluded = truthy(o.differentialExcluded);

  // The aortic threshold. Age-dependent ONLY in the family-history rule.
  const zThreshold = (familyHistory && age !== null && age < AGE_CUTOFF) ? Z_UNDER_20_WITH_FH : Z_ADULT;
  const aoDilated = z !== null && z >= Z_ADULT;
  const aoMeetsFhRule = z !== null && z >= zThreshold;

  const rules = [];
  let diagnosis = null;
  let caveated = false;

  if (familyHistory) {
    if (ectopiaLentis) { rules.push('rule 5: ectopia lentis with a family history'); diagnosis = 'Marfan syndrome'; }
    if (score >= SYSTEMIC_MFS) { rules.push(`rule 6: systemic score ${score} of ${MAX_SYSTEMIC} with a family history`); diagnosis = 'Marfan syndrome'; caveated = true; }
    if (aoMeetsFhRule) { rules.push(`rule 7: aortic root Z ${z} at or above the ${zThreshold} required ${age !== null && age < AGE_CUTOFF ? 'under 20 years of age' : 'from 20 years of age'}, with a family history`); diagnosis = 'Marfan syndrome'; }
  } else {
    if (aoDilated && ectopiaLentis) { rules.push('rule 1: aortic root dilatation and ectopia lentis'); diagnosis = 'Marfan syndrome'; caveated = true; }
    if (aoDilated && fbn1 !== 'none') { rules.push('rule 2: aortic root dilatation and an FBN1 mutation'); diagnosis = 'Marfan syndrome'; }
    if (aoDilated && score >= SYSTEMIC_MFS) { rules.push(`rule 3: aortic root dilatation and a systemic score of ${score}`); diagnosis = 'Marfan syndrome'; caveated = true; }
    if (ectopiaLentis && fbn1 === 'known-with-ao') { rules.push('rule 4: ectopia lentis with an FBN1 mutation known to be associated with aortic disease'); diagnosis = 'Marfan syndrome'; }

    if (!diagnosis) {
      if (ectopiaLentis && (fbn1 === 'not-known-with-ao' || fbn1 === 'none')) {
        diagnosis = 'Ectopia lentis syndrome';
        rules.push('ectopia lentis without an FBN1 mutation known to be associated with aortic disease');
      } else if (!ectopiaLentis && z !== null && z < Z_ADULT && score >= SYSTEMIC_MASS && skeletalPresent) {
        diagnosis = 'MASS phenotype';
        rules.push(`aortic root Z below ${Z_ADULT}, systemic score ${score} with at least one skeletal feature, no ectopia lentis`);
      } else if (!ectopiaLentis && mvp && z !== null && z < Z_ADULT && score < SYSTEMIC_MASS) {
        diagnosis = 'Mitral valve prolapse syndrome';
        rules.push(`mitral valve prolapse with aortic root Z below ${Z_ADULT} and a systemic score under ${SYSTEMIC_MASS}`);
      }
    }
  }

  // The age-dependent threshold, said out loud whenever it is doing work.
  const ageNote = familyHistory && age !== null && age < AGE_CUTOFF && z !== null && z >= Z_ADULT && z < Z_UNDER_20_WITH_FH
    ? `With a family history, someone under ${AGE_CUTOFF} needs a Z score of ${Z_UNDER_20_WITH_FH}, not ${Z_ADULT}. A Z of ${z} does NOT satisfy rule 7 at this age, though it would from ${AGE_CUTOFF} years old.`
    : null;

  // The FBN1 distinction, said out loud when it changed the answer.
  const fbn1Note = ectopiaLentis && fbn1 === 'not-known-with-ao' && !familyHistory
    ? 'An FBN1 mutation that is NOT known to be associated with aortic root disease does not satisfy rule 4. The same patient with a mutation known to be associated with aortic disease would meet the criteria for Marfan syndrome; here the nosology gives ectopia lentis syndrome.'
    : null;

  const caveat = caveated && !differentialExcluded
    ? 'This route carries the paper’s own caveat: it holds only without discriminating features of Shprintzen-Goldberg, Loeys-Dietz or vascular Ehlers-Danlos syndrome, and after TGFBR1/2, collagen biochemistry and COL3A1 testing where indicated. That has not been confirmed here.'
    : null;

  const isMfs = diagnosis === 'Marfan syndrome';
  return {
    valid: true,
    diagnosis,
    marfan: isMfs,
    systemicScore: score,
    systemicContributions: contributing,
    skeletalFeaturePresent: skeletalPresent,
    rulesSatisfied: rules,
    zThresholdApplied: familyHistory ? zThreshold : Z_ADULT,
    ageNote,
    fbn1Note,
    caveat,
    abnormal: !!diagnosis,
    bandLabel: diagnosis || 'No Ghent diagnosis met',
    band: diagnosis
      ? `${diagnosis} — ${rules.join('; ')}.`
      : `No diagnosis under the revised Ghent nosology on these entries. Systemic score ${score} of ${MAX_SYSTEMIC}.`,
    detail: `Systemic score ${score} of ${MAX_SYSTEMIC}; ${SYSTEMIC_MFS} or more indicates systemic involvement, and ${SYSTEMIC_MASS} or more with at least one skeletal feature is part of the MASS route. The nosology returns four possible diagnoses: Marfan syndrome, ectopia lentis syndrome, MASS phenotype and mitral valve prolapse syndrome.`,
    note: GHENT_NOTE,
  };
}
