// spec-v607: the modified Sartorius score for hidradenitis suppurativa. A CLUSTER-COMPLETION gap:
// `hurley-stage` and `ihs4` are both in the catalog and the third member of that trio was not. Every slug
// spelling and filename search returned 0.
//
// **THE PUBLISHED UNIT IS A SINGLE ANATOMICAL REGION, AND THE PATIENT'S TOTAL IS THE SUM ACROSS REGIONS.**
// This function computes ONE region's score, which is exactly the published formula: 3 for the region being
// involved, plus 1 per nodule, plus 6 per draining fistula, plus the distance term, plus the separation
// term. A patient with four involved regions has four regional scores that are added. This lib does NOT
// invent an aggregate rule, because the source does not give one beyond the sum.
//
// **THERE IS NO MAXIMUM.** Nodules and fistulas are counted individually and regions are summed, so the
// score is unbounded: a patient with many draining fistulas across several regions can reach the hundreds.
// Any "x of y" reading is wrong, and so is any attempt to normalize it.
//
// **A DRAINING FISTULA IS WORTH SIX NODULES.** Lesion TYPE dominates lesion COUNT: six nodules and one
// fistula score the same. A reader who counts "lesions" without separating the two types will be wrong by a
// factor of six on the item that matters most.
//
// **THE DISTANCE TERM TRIPLES AT EACH STEP.** Under 5 cm scores 1, 5 to 10 cm scores 3, and over 10 cm
// scores 9 -- so a single span greater than 10 cm is worth NINE nodules. It is not a linear measure of size.
//
// **THE SEPARATION ITEM IS THE HURLEY QUESTION IN DISGUISE.** "Lesions NOT separated by normal skin" is the
// defining feature of Hurley stage III, and one reproduction of this score states the item directly as "9
// points for a Hurley stage III area". So this score embeds a Hurley judgment as a single 9-point item --
// and `hurley-stage` is its own tile in this catalog. The two instruments are not independent.
//
// **THE SEVERITY BANDS ARE NOT WELL ESTABLISHED AND ARE NOT APPLIED HERE.** One reproduction gives activity
// as high above 60 and moderate between 20 and 60; a comparative review of hidradenitis scores states that
// no severity bands are provided for this system. Under the spec-v97 gate a single-sourced band table is
// reported rather than applied, so this lib returns the score and NO band.
//
// **IT WAS SUPERSEDED FOR BEING TIME-CONSUMING.** The IHS4, also in this catalog, was produced by a Delphi
// process explicitly to give an easy-to-use formula, and the documented weakness of this score is that it is
// time-consuming to calculate in extensive disease. It also uses examination findings only, with no
// patient-reported component.
//
// HIGH-STAKES: this measures disease EXTENT at one point in time, mainly for trials and follow-up. It does
// NOT diagnose hidradenitis suppurativa, does not select medical or surgical treatment, does not measure
// pain, drainage, odour or quality of life -- which are what patients most often report as the burden -- and
// a falling score does not by itself mean the patient feels better (spec-v11 section 5.3).
//
// WEIGHTS AND TERMS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER RECALLED
// (spec-v97). The two describe the final item differently -- "not separated by normal skin" against "a
// Hurley stage III area" -- and both assign it 9 points; they are the same criterion stated two ways:
//   - Sartorius K, Emtestam L, Jemec GBE, Lapins J. Objective scoring of hidradenitis suppurativa reflecting
//     the role of tobacco smoking and obesity. Br J Dermatol. 2009;161(4):831-839.

export const REGION_POINTS = 3;
export const NODULE_POINTS = 1;
export const FISTULA_POINTS = 6;
export const SEPARATION_POINTS = 9;

export const DISTANCE_BANDS = [
  { value: 'none', points: 0, text: 'No active lesions' },
  { value: 'under-5', points: 1, text: 'Longest distance under 5 cm' },
  { value: '5-to-10', points: 3, text: 'Longest distance 5 to 10 cm' },
  { value: 'over-10', points: 9, text: 'Longest distance over 10 cm' },
];

export const SINGLE_SOURCED_BANDS = 'One reproduction gives activity as HIGH above 60 and MODERATE between 20 and 60. A comparative review of hidradenitis scores states that NO severity bands are provided for this system. The band table is therefore single-sourced, is reported here rather than applied, and no band is returned.';

export const REGIONAL_NOTE = `The published unit is a SINGLE anatomical region and the patient's total is the SUM across involved regions. This computes ONE region's score: ${REGION_POINTS} for the region being involved, plus ${NODULE_POINTS} per nodule, plus ${FISTULA_POINTS} per draining fistula, plus the distance term, plus the separation term.`;
export const UNBOUNDED_NOTE = 'There is NO maximum: nodules and fistulas are counted individually and regions are summed, so the score is unbounded and a patient with many draining fistulas across several regions can reach the hundreds. Any "x of y" reading is wrong, and so is normalizing it.';
export const FISTULA_NOTE = `A draining fistula is worth SIX nodules (${FISTULA_POINTS} against ${NODULE_POINTS}). Lesion TYPE dominates lesion COUNT, so six nodules and one fistula score the same, and counting "lesions" without separating the two types is wrong by a factor of six on the item that matters most.`;
export const DISTANCE_NOTE = 'The distance term TRIPLES at each step - 1, 3, then 9 - so a single span greater than 10 cm is worth NINE nodules. It is not a linear measure of size.';
export const HURLEY_NOTE = `The separation item is the HURLEY QUESTION IN DISGUISE: "lesions NOT separated by normal skin" is the defining feature of Hurley stage III, and one reproduction states the item directly as ${SEPARATION_POINTS} points for a Hurley stage III area. This score therefore embeds a Hurley judgment as a single ${SEPARATION_POINTS}-point item, and hurley-stage is its own tile in this catalog - the two instruments are not independent.`;
export const SUPERSEDED_NOTE = 'It was superseded for being time-consuming: the IHS4, also in this catalog, was produced by a Delphi process explicitly to give an easy-to-use formula, and the documented weakness of this score is that it is time-consuming to calculate in extensive disease. It also uses examination findings only, with no patient-reported component.';

const NOTE = `The modified Sartorius score (Sartorius and colleagues 2009) measures the extent of hidradenitis suppurativa. The published unit is a single anatomical region, scored as ${REGION_POINTS} points for the region being involved, plus ${NODULE_POINTS} point per nodule, plus ${FISTULA_POINTS} points per draining fistula, plus a distance term of 1 for under 5 cm, 3 for 5 to 10 cm and 9 for over 10 cm, plus ${SEPARATION_POINTS} points if the lesions are not separated by normal skin. The patient's total is the sum of the regional scores. There is no maximum, since lesions are counted individually and regions are summed, so the score is unbounded and any "x of y" reading is wrong. A draining fistula is worth six nodules, so lesion type dominates lesion count. The distance term triples at each step, so a single span over 10 cm is worth nine nodules. The separation item is the Hurley question in disguise, since lesions not separated by normal skin is the defining feature of Hurley stage III and one reproduction states the item directly as a Hurley stage III area, so this score embeds a Hurley judgment as a single nine-point item and the two instruments are not independent. The severity bands are not well established: one reproduction gives high activity above 60 and moderate between 20 and 60, while a comparative review states that no bands are provided, so no band is returned here. The score was superseded for being time-consuming, which is why the IHS4 was produced by a Delphi process to give an easy-to-use formula, and it uses examination findings only with no patient-reported component. This measures disease extent at one point in time, mainly for trials and follow-up. It does not diagnose hidradenitis suppurativa, does not select medical or surgical treatment, and does not measure pain, drainage, odor or quality of life, which are what patients most often report as the burden, so a falling score does not by itself mean the patient feels better.`;

function readCount(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0) throw new Error(`${name} must be a whole number that is 0 or more.`);
  return n;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: nodules, fistulas (counts in ONE region), distance (a DISTANCE_BANDS value),
// separatedByNormalSkin (yes/no).
export function sartoriusRegion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let nodules, fistulas, distance, separated;
  try {
    nodules = readCount(o.nodules, 'Nodules');
    fistulas = readCount(o.fistulas, 'Draining fistulas');
    distance = o.distance === '' || o.distance === undefined || o.distance === null
      ? null : DISTANCE_BANDS.find((d) => d.value === String(o.distance).trim());
    if (o.distance && !distance) {
      throw new Error(`Distance must be one of: ${DISTANCE_BANDS.map((d) => d.value).join(', ')}.`);
    }
    separated = readBool(o.separatedByNormalSkin, 'Lesions separated by normal skin');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (nodules === null || fistulas === null || !distance || separated === null) {
    return { valid: false, message: `Enter the nodule and draining-fistula counts FOR ONE REGION, the longest distance between lesions, and whether the lesions are separated by normal skin. ${REGIONAL_NOTE}` };
  }

  const anyLesions = nodules > 0 || fistulas > 0;
  const regionPoints = anyLesions ? REGION_POINTS : 0;
  const nodulePoints = nodules * NODULE_POINTS;
  const fistulaPoints = fistulas * FISTULA_POINTS;
  const distancePoints = distance.points;
  const separationPoints = separated ? 0 : SEPARATION_POINTS;
  const total = regionPoints + nodulePoints + fistulaPoints + distancePoints + separationPoints;

  // How many nodules the non-count terms are worth, to make the weighting visible.
  const fistulasInNodules = fistulas * FISTULA_POINTS;
  const distanceInNodules = distancePoints;

  const parts = [];
  parts.push(`Regional Sartorius score ${total} for this region: region ${regionPoints}, nodules ${nodulePoints}, draining fistulas ${fistulaPoints}, distance ${distancePoints}, separation ${separationPoints}.`);
  parts.push(REGIONAL_NOTE);
  if (fistulas > 0) {
    parts.push(`The ${fistulas} draining fistula${fistulas === 1 ? '' : 's'} contributed ${fistulaPoints} points - as much as ${fistulasInNodules} nodules. ${FISTULA_NOTE}`);
  } else {
    parts.push(FISTULA_NOTE);
  }
  if (distancePoints === 9) {
    parts.push(`The distance term contributed ${distancePoints} points, as much as ${distanceInNodules} nodules. ${DISTANCE_NOTE}`);
  } else {
    parts.push(DISTANCE_NOTE);
  }
  if (!separated) {
    parts.push(`Lesions are NOT separated by normal skin, adding ${SEPARATION_POINTS}. ${HURLEY_NOTE}`);
  } else {
    parts.push(HURLEY_NOTE);
  }
  parts.push(UNBOUNDED_NOTE);
  parts.push(`No severity band is returned. ${SINGLE_SOURCED_BANDS}`);
  parts.push(SUPERSEDED_NOTE);
  parts.push('This measures disease extent at one point in time. It does not diagnose hidradenitis suppurativa, does not select treatment, and does not measure pain, drainage, odor or quality of life - so a falling score does not by itself mean the patient feels better.');

  return {
    valid: true,
    regionalScore: total,
    regionPoints,
    nodulePoints,
    fistulaPoints,
    distancePoints,
    separationPoints,
    fistulasWorthNodules: fistulasInNodules,
    band: null,              // deliberately: the band table is single-sourced
    bandLabel: `Regional Sartorius score ${total}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
