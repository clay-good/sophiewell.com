// spec-v722: Loe-Silness Gingival Index (GI).
//
// A standardized index of gingival inflammation. Source:
//   Loe H, Silness J. Periodontal disease in pregnancy. I. Prevalence and severity. Acta
//   Odontol Scand. 1963;21:533-551. (PMID 14121956.)
//
// Each of 4 surfaces per tooth is scored 0-3:
//   0 = normal gingiva
//   1 = mild inflammation: slight color change and slight edema; NO bleeding on probing
//   2 = moderate inflammation: redness, edema, glazing; bleeding on probing
//   3 = severe inflammation: marked redness and edema, ulceration; tendency to spontaneous
//       bleeding
// The Gingival Index is the MEAN of the surface scores (weighted mean of all surfaces scored).
//
// Interpretation: 0 healthy; 0.1-1.0 mild gingivitis; 1.1-2.0 moderate; 2.1-3.0 severe.
//
// This tile aggregates by the count of surfaces at each score. Pure: no DOM, no clock, no
// network.

export const GINGIVAL_INDEX_NOTE = 'Loe-Silness Gingival Index (Loe H, Silness J, Acta Odontol Scand 1963;21:533-551), a standardized index of gingival inflammation. Each of four surfaces per tooth is scored 0 to 3: 0 is normal gingiva, 1 is mild inflammation with a slight color change and slight edema but no bleeding on probing, 2 is moderate inflammation with redness, edema, and glazing and bleeding on probing, and 3 is severe inflammation with marked redness and edema, ulceration, and a tendency to spontaneous bleeding. The Gingival Index is the mean of all the surface scores. A value of 0 is healthy, 0.1 to 1.0 is mild gingivitis, 1.1 to 2.0 is moderate, and 2.1 to 3.0 is severe. It grades gingival inflammation to guide oral-hygiene instruction and monitoring, not to diagnose periodontitis, and it supports rather than replaces the clinical periodontal examination.';

function count(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

function band(gi) {
  if (gi === 0) return { tier: 'healthy', label: 'healthy gingiva' };
  if (gi <= 1.0) return { tier: 'mild', label: 'mild gingivitis' };
  if (gi <= 2.0) return { tier: 'moderate', label: 'moderate gingivitis' };
  return { tier: 'severe', label: 'severe gingivitis' };
}

export function loeSilnessGingivalIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const n0 = count(o.score0);
  const n1 = count(o.score1);
  const n2 = count(o.score2);
  const n3 = count(o.score3);
  if (n0 === null || n1 === null || n2 === null || n3 === null) {
    return { valid: false, code: 'INVALID_INPUT', field: 'score0', message: 'Surface counts must be whole numbers >= 0.', note: GINGIVAL_INDEX_NOTE };
  }
  const total = n0 + n1 + n2 + n3;
  if (total <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'score0', message: 'Enter how many surfaces scored 0, 1, 2, and 3 (at least one surface).', note: GINGIVAL_INDEX_NOTE };
  }

  const gi = (0 * n0 + 1 * n1 + 2 * n2 + 3 * n3) / total;
  const rounded = Math.round(gi * 100) / 100;
  const b = band(gi);

  return {
    valid: true,
    index: rounded,
    tier: b.tier,
    // Moderate or worse (>= 1.1) is the actionable inflammation threshold.
    abnormal: gi > 1.0,
    surfaces: total,
    bandLabel: `Gingival Index ${rounded}`,
    band: `Gingival Index ${rounded} — ${b.label}.`,
    detail: `Mean of ${total} surface scores. Bands: 0 healthy, 0.1-1.0 mild, 1.1-2.0 moderate, 2.1-3.0 severe gingivitis.`,
    note: GINGIVAL_INDEX_NOTE,
  };
}
