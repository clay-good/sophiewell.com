// spec-v729: Activities-specific Balance Confidence (ABC) Scale.
//
// A 16-item self-report of balance confidence during everyday activities. Source:
//   Powell LE, Myers AM. The Activities-specific Balance Confidence (ABC) Scale. J Gerontol A
//   Biol Sci Med Sci. 1995;50A(1):M28-M34. (PMID 7814786.)
//
// The person rates their confidence (0-100%) of not losing balance or becoming unsteady during
// each of 16 activities. The ABC score is the MEAN of the 16 ratings (0-100).
//
// Interpretation: < 67% indicates an increased risk of falling in community-dwelling older
// adults. Myers functioning bands: < 50 low, 50-80 moderate, > 80 high level of physical
// functioning.
//
// Pure: no DOM, no clock, no network.

export const ABC_NOTE = 'Activities-specific Balance Confidence (ABC) Scale (Powell LE, Myers AM, J Gerontol A Biol Sci Med Sci 1995;50A(1):M28-M34), a 16-item self-report of balance confidence. For each of 16 everyday activities the person rates, from 0 to 100 percent, how confident they are of not losing their balance or becoming unsteady. The ABC score is the mean of the 16 ratings, from 0 to 100. A score below 67 percent indicates an increased risk of falling in community-dwelling older adults, and the Myers functioning bands are under 50 low, 50 to 80 moderate, and above 80 a high level of physical functioning. It measures balance confidence to gauge fall risk and track change, it is not a performance test or a diagnosis, and it supports rather than replaces the physical and fall-risk assessment.';

function pct(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return n;
}

const ITEMS = Array.from({ length: 16 }, (_, i) => `a${i + 1}`);

function band(score) {
  if (score < 50) return { tier: 'low', label: 'low level of physical functioning' };
  if (score <= 80) return { tier: 'moderate', label: 'moderate level of physical functioning' };
  return { tier: 'high', label: 'high level of physical functioning' };
}

export function abcScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  let sum = 0;
  for (const k of ITEMS) {
    const v = pct(o[k]);
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      return { valid: false, code: 'MISSING_INPUT', field: k, message: `Rate ${k} from 0 to 100 (% confidence).`, note: ABC_NOTE };
    }
    sum += v;
  }

  const score = sum / 16;
  const rounded = Math.round(score * 10) / 10;
  const b = band(score);
  const fallRisk = score < 67;

  return {
    valid: true,
    score: rounded,
    tier: b.tier,
    abnormal: fallRisk,
    fallRisk,
    bandLabel: `ABC ${rounded}%`,
    band: `ABC ${rounded}% — ${fallRisk ? 'increased fall risk (< 67%); ' : ''}${b.label}.`,
    detail: 'Mean of 16 activity confidence ratings (0-100%). < 67% indicates increased fall risk. Functioning: < 50 low, 50-80 moderate, > 80 high.',
    note: ABC_NOTE,
  };
}
