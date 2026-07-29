// spec-v584: the EBMT (Gratwohl) risk score for allogeneic hematopoietic stem cell transplantation. A
// COMPANION-GAP: the catalog already has `hct-ci`, the Sorror comorbidity index, which scores the patient's
// ORGAN COMORBIDITY. The EBMT score scores the DISEASE AND THE TRANSPLANT -- age, stage, timing, donor and
// sex mismatch -- and the two are explicitly complementary axes, routinely reported together.
// `grep -ci ebmt app.js` returned 0.
//
// **ONE FACTOR SILENTLY DISAPPEARS.** The time-from-diagnosis item "does not apply for patients transplanted
// in first complete remission (score 0)". A patient in first CR scores 0 for timing NO MATTER how long the
// interval was -- three years from diagnosis to transplant in first CR still scores 0. An implementation
// that reads the interval and scores it unconditionally will over-score exactly the group with the best
// prognosis, and the maximum reachable score for a first-CR patient is 6, not 7.
//
// **THE SEX-COMBINATION ITEM IS ONE-DIRECTIONAL.** Only a FEMALE DONOR into a MALE RECIPIENT scores. Male
// donor into female recipient scores 0, as do both matched combinations. It is a single asymmetric
// direction, not a "sex mismatch" item, and treating it as mismatch double-counts half the mismatched pairs.
//
// **THE DONOR ITEM HAS ONLY TWO PUBLISHED CATEGORIES**: HLA-identical sibling 0, unrelated donor 1. That is
// the whole published item. HAPLOIDENTICAL AND CORD-BLOOD DONORS HAVE NO DEFINED VALUE in this score, which
// was built before either became routine. Validation studies have applied the score to those settings, but
// the score itself does not assign them a category, so this tool refuses to invent one and says so.
//
// **ONE WIDELY REPRODUCED RENDERING OF THE TIMING THRESHOLD WOULD LEAVE A HOLE.** Some reproductions print
// "<12 months = 0, >12 months = 1", which leaves an interval of exactly 12 months unclassified. The consistent
// partition, and the one carried by the reproductions that state an operator, is 12 months OR LESS = 0 and
// MORE THAN 12 months = 1. That partition is used here, and the discrepancy is stated (spec-v97).
//
// **SEVERE APLASTIC ANEMIA ALWAYS SCORES 0 FOR DISEASE STAGE**, by definition, because the stage ladder is
// built from remission states that do not exist for it. That is a disease-specific override inside an item
// that otherwise looks like a generic three-level scale.
//
// HIGH-STAKES: this estimates survival and transplant-related mortality at a GROUP level before transplant.
// It does NOT decide whether to transplant, does not select a donor, a conditioning regimen or a graft
// source, and a high score is NOT a reason to withhold transplantation -- for many of these diseases
// transplant is the only curative option and the comparator is the untransplanted course, which this score
// says nothing about. It does not score organ comorbidity; that is what the HCT-CI does (spec-v11 5.3).
//
// POINTS AND CATEGORIES RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT REPRODUCTIONS OF THE SCORE
// TABLE, NEVER RECALLED (spec-v97), with the first-CR suppression rule and the timing operator each
// confirmed separately because they are the two places reproductions diverge:
//   - Gratwohl A. The EBMT risk score. Bone Marrow Transplant. 2012;47(6):749-756.
//   - Gratwohl A, Stern M, Brand R, et al. Risk score for outcome after allogeneic hematopoietic stem cell
//     transplantation. Cancer. 2009;115(20):4715-4726.

export const AGE_BANDS = [
  { value: 'under-20', points: 0, text: 'Under 20 years' },
  { value: '20-40', points: 1, text: '20 to 40 years' },
  { value: 'over-40', points: 2, text: 'Over 40 years' },
];

export const STAGE_BANDS = [
  {
    value: 'early', points: 0, text: 'Early',
    detail: 'Acute leukemia in first complete remission; MDS untreated or in first CR; CML in first chronic phase; lymphoproliferative disease or myeloma in first CR. Severe aplastic anemia is ALWAYS early.',
  },
  {
    value: 'intermediate', points: 1, text: 'Intermediate',
    detail: 'Acute leukemia in second CR; CML in intermediate stages; MDS in second CR or partial remission; lymphoproliferative disease or myeloma in second CR or stable disease.',
  },
  {
    value: 'late', points: 2, text: 'Late',
    detail: 'Acute leukemia in advanced stages; CML in blast crisis; MDS, lymphoproliferative disease or myeloma in any other stage.',
  },
];

export const DONOR_TYPES = [
  { value: 'hla-identical-sibling', points: 0, text: 'HLA-identical sibling' },
  { value: 'unrelated', points: 1, text: 'Unrelated donor' },
];

export const TIME_THRESHOLD_MONTHS = 12;
export const SEX_MATCH_POINT = 1;
export const EBMT_MAX = 7;
export const EBMT_MAX_FIRST_CR = 6;

const RISK_GROUPS = [
  { max: 2, label: 'Low risk' },
  { max: 4, label: 'Intermediate risk' },
  { max: EBMT_MAX, label: 'Poor risk' },
];

export const FIRST_CR_RULE = `The time-from-diagnosis item DOES NOT APPLY to a patient transplanted in first complete remission: it scores 0 however long the interval was. The maximum reachable score in first CR is therefore ${EBMT_MAX_FIRST_CR}, not ${EBMT_MAX}.`;
export const SEX_RULE = 'Only a FEMALE DONOR into a MALE RECIPIENT scores. Male donor into female recipient scores 0, as do both matched combinations. This is one asymmetric direction, not a "sex mismatch" item.';
export const DONOR_HOLE = 'The published donor item has only two categories, HLA-identical sibling and unrelated donor. HAPLOIDENTICAL AND CORD-BLOOD DONORS HAVE NO DEFINED VALUE in this score, which predates both as routine options. Validation studies have applied the score in those settings, but the score itself assigns them no category, and none is invented here.';
export const TIMING_OPERATOR_NOTE = `Some widely reproduced renderings print "under 12 months = 0, over 12 months = 1", which leaves an interval of exactly 12 months unclassified. The consistent partition, used here, is ${TIME_THRESHOLD_MONTHS} months or less = 0 and more than ${TIME_THRESHOLD_MONTHS} months = 1.`;

const NOTE = `The EBMT risk score (Gratwohl and colleagues) estimates survival and transplant-related mortality before allogeneic hematopoietic stem cell transplantation, from five pre-transplant factors summed to 0 through ${EBMT_MAX}: patient age (under 20 = 0, 20 to 40 = 1, over 40 = 2), disease stage (early 0, intermediate 1, late 2), time from diagnosis to transplant (${TIME_THRESHOLD_MONTHS} months or less = 0, more = 1), donor type (HLA-identical sibling 0, unrelated 1) and donor-recipient sex combination (female donor into male recipient 1, every other combination 0). Bands: 0 to 2 low risk, 3 to 4 intermediate, 5 to ${EBMT_MAX} poor. One factor silently disappears: the time item does not apply to a patient transplanted in first complete remission, scoring 0 however long the interval was, so the maximum reachable score in first CR is ${EBMT_MAX_FIRST_CR}. The sex item is one-directional, only female donor into male recipient, so treating it as a mismatch item double-counts half the mismatched pairs. The donor item has only two published categories and haploidentical and cord-blood donors have no defined value in this score, which predates both as routine options; none is invented here. Severe aplastic anemia always scores 0 for disease stage, by definition, because the stage ladder is built from remission states it does not have. Some reproductions print the timing threshold as under 12 versus over 12, which would leave exactly 12 months unclassified; the consistent partition is used here. This estimates outcome at a group level before transplant. It does not decide whether to transplant, does not select a donor, a conditioning regimen or a graft source, and a high score is not a reason to withhold transplantation, since for many of these diseases transplant is the only curative option and the comparator is the untransplanted course, about which this score says nothing. It does not score organ comorbidity, which is what the HCT-CI does; the two are complementary axes and are routinely reported together.`;

function pick(list, v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const found = list.find((i) => i.value === String(v).trim());
  if (!found) throw new Error(`${name} must be one of: ${list.map((i) => i.value).join(', ')}.`);
  return found;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
function readNum(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a number that is 0 or more.`);
  return n;
}

// input: ageBand, diseaseStage, firstCompleteRemission, monthsFromDiagnosis, donorType,
// femaleDonorMaleRecipient.
export function ebmtScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let age, stage, donor, firstCR, months, sex;
  try {
    age = pick(AGE_BANDS, o.ageBand, 'Age band');
    stage = pick(STAGE_BANDS, o.diseaseStage, 'Disease stage');
    donor = pick(DONOR_TYPES, o.donorType, 'Donor type');
    firstCR = readBool(o.firstCompleteRemission, 'First complete remission');
    sex = readBool(o.femaleDonorMaleRecipient, 'Female donor into male recipient');
    months = readNum(o.monthsFromDiagnosis, 'Months from diagnosis');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (!age || !stage || !donor || firstCR === null || sex === null) {
    return { valid: false, message: 'Answer the age band, disease stage, donor type, whether the transplant is in first complete remission, and the donor-recipient sex combination.' };
  }
  // The interval is only needed when the first-CR suppression does not apply.
  if (!firstCR && months === null) {
    return { valid: false, message: `Enter the months from diagnosis to transplant. It is only needed outside first complete remission: in first CR the item scores 0 regardless, so the interval is not asked for.` };
  }

  const timePoints = firstCR ? 0 : (months > TIME_THRESHOLD_MONTHS ? 1 : 0);
  const sexPoints = sex ? SEX_MATCH_POINT : 0;
  const total = age.points + stage.points + timePoints + donor.points + sexPoints;
  const group = RISK_GROUPS.find((g) => total <= g.max);
  const maxReachable = firstCR ? EBMT_MAX_FIRST_CR : EBMT_MAX;

  const parts = [];
  parts.push(`EBMT score ${total} of ${EBMT_MAX}: ${group.label.toLowerCase()}.`);
  if (firstCR) {
    parts.push(`${FIRST_CR_RULE} This patient is in first CR, so the timing item scored 0 and the interval was not used.`);
  } else if (months > TIME_THRESHOLD_MONTHS) {
    parts.push(`${months} months from diagnosis exceeds ${TIME_THRESHOLD_MONTHS}, scoring 1. ${TIMING_OPERATOR_NOTE}`);
  } else {
    parts.push(`${months} months from diagnosis is within ${TIME_THRESHOLD_MONTHS}, scoring 0. ${TIMING_OPERATOR_NOTE}`);
  }
  parts.push(SEX_RULE);
  parts.push(DONOR_HOLE);
  parts.push('Severe aplastic anemia always scores 0 for disease stage, by definition, because the stage ladder is built from remission states it does not have.');
  parts.push('This is a group-level estimate before transplant. It does not decide whether to transplant, does not select a donor, conditioning or graft source, and a high score is not a reason to withhold transplantation. It scores the disease and the transplant, not organ comorbidity, which is the HCT-CI’s axis.');

  return {
    valid: true,
    total,
    max: EBMT_MAX,
    maxReachable,
    riskGroup: group.label,
    points: { age: age.points, stage: stage.points, time: timePoints, donor: donor.points, sex: sexPoints },
    timeItemSuppressed: firstCR,
    band: group.label,
    bandLabel: `EBMT ${total} of ${EBMT_MAX}, ${group.label.toLowerCase()}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
