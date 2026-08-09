// spec-v674: Onychomycosis Severity Index (OSI).
//
// A companion to the built dermatology severity indices (pasi, easi, scorad, napsi):
// OSI grades the severity of a single onychomycotic (fungal) nail. Source:
//   Carney C, Tosti A, Daniel R, Scher R, Rich P, DeCoster J, Elewski B. A new
//   classification system for grading the severity of onychomycosis: Onychomycosis
//   Severity Index. Arch Dermatol. 2011;147(11):1277-1282. PMID 21810660.
//
// OSI = area-of-involvement score (0-5) x proximity-to-matrix score (1-5)
//       + 10 points if a dermatophytoma (longitudinal streak/patch) OR > 2 mm of
//       subungual hyperkeratosis is present (added once, an OR condition).
// Range 0-35: 0 = no involvement, 1-5 mild, 6-15 moderate, 16-35 severe.
//
// Pure: no DOM, no clock, no network.

export const OSI_NOTE = 'Onychomycosis Severity Index (Carney C, et al., Arch Dermatol 2011;147(11):1277-1282). The score for a single fungal nail multiplies the area of involvement (0 = none, 1 = 1-10%, 2 = 11-25%, 3 = 26-50%, 4 = 51-75%, 5 = more than 75%) by the proximity of disease to the nail matrix (1 = distal quarter through 5 = matrix involvement), then adds 10 points once if a dermatophytoma (a longitudinal streak or patch) or more than 2 mm of subungual hyperkeratosis is present. The total runs 0 to 35: 0 is no involvement, 1 to 5 is mild, 6 to 15 is moderate, and 16 to 35 is severe. Because the area and proximity scores are multiplied, an area score of 0 gives a total of 0 regardless of the other inputs. It grades a nail to standardize severity and track response; it is a grading instrument, not a treatment order.';

const AREA_PCT = { 0: '0%', 1: '1-10%', 2: '11-25%', 3: '26-50%', 4: '51-75%', 5: '>75%' };
const PROX_ZONE = { 1: 'distal quarter', 2: 'second quarter', 3: 'third quarter', 4: 'proximal quarter', 5: 'matrix' };

function intIn(v, lo, hi) {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < lo || n > hi) return NaN;
  return n;
}

function band(total) {
  if (total === 0) return { label: 'none', tier: 'none' };
  if (total <= 5) return { label: 'mild', tier: 'mild' };
  if (total <= 15) return { label: 'moderate', tier: 'moderate' };
  return { label: 'severe', tier: 'severe' };
}

export function osiOnychomycosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const area = intIn(o.area, 0, 5);
  if (Number.isNaN(area)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'area', message: 'Select the area of involvement score (0 = none, 1 = 1-10%, ... 5 = >75%).' };
  }
  const proximity = intIn(o.proximity, 1, 5);
  if (Number.isNaN(proximity)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'proximity', message: 'Select the proximity-to-matrix score (1 = distal quarter through 5 = matrix).' };
  }
  const bonus = o.bonus === true || o.bonus === 1 || o.bonus === '1' || o.bonus === 'on';

  const product = area * proximity;
  const total = product + (bonus ? 10 : 0);
  const b = band(total);

  return {
    valid: true,
    total,
    product,
    bonus,
    category: b.tier,
    // Flag moderate or severe disease (>= 6).
    abnormal: total >= 6,
    band: `OSI ${total}/35 — ${b.label}${total === 0 ? ' (no involvement)' : ''}.`,
    detail: `Area ${area} (${AREA_PCT[area]}) x proximity ${proximity} (${PROX_ZONE[proximity]}) = ${product}${bonus ? ' + 10 (dermatophytoma or > 2 mm subungual hyperkeratosis)' : ''}.`,
    note: OSI_NOTE,
  };
}
