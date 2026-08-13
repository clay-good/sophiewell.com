// spec-v723: Silness-Loe Plaque Index (PlI).
//
// A standardized index of the thickness of plaque at the gingival margin. Source:
//   Silness J, Loe H. Periodontal disease in pregnancy. II. Correlation between oral hygiene
//   and periodontal condition. Acta Odontol Scand. 1964;22:121-135. (PMID 14158464.)
//
// Each of 4 surfaces per tooth is scored 0-3:
//   0 = no plaque
//   1 = a film of plaque adhering to the free gingival margin/adjacent tooth, recognized only
//       by running a probe across the surface or after disclosing
//   2 = moderate soft deposits within the gingival pocket/at the margin, visible to the naked eye
//   3 = an abundance of soft matter within the gingival pocket and/or on the tooth and gingival
//       margin
// The Plaque Index is the MEAN of the surface scores.
//
// Interpretation (advisory; bands vary by source): 0 excellent; 0.1-0.9 good; 1.0-1.9 fair;
// 2.0-3.0 poor oral hygiene.
//
// This tile aggregates by the count of surfaces at each score. Pure: no DOM, no clock, no
// network.

export const PLAQUE_INDEX_NOTE = 'Silness-Loe Plaque Index (Silness J, Loe H, Acta Odontol Scand 1964;22:121-135), an index of the thickness of plaque at the gingival margin. Each of four surfaces per tooth is scored 0 to 3: 0 is no plaque, 1 is a film of plaque at the free gingival margin recognized only by running a probe or after disclosing, 2 is moderate soft deposits visible to the naked eye, and 3 is an abundance of soft matter within the gingival pocket and on the tooth and margin. The Plaque Index is the mean of the surface scores. Interpretation bands are advisory and vary by source, but a score of 0 is excellent, 0.1 to 0.9 is good, 1.0 to 1.9 is fair, and 2.0 to 3.0 is poor oral hygiene. It measures plaque to guide oral-hygiene instruction and monitoring over time, not to diagnose periodontal disease, and it supports rather than replaces the clinical dental and periodontal examination.';

function count(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

function band(pi) {
  if (pi === 0) return { tier: 'excellent', label: 'excellent (no plaque)' };
  if (pi < 1.0) return { tier: 'good', label: 'good oral hygiene' };
  if (pi < 2.0) return { tier: 'fair', label: 'fair oral hygiene' };
  return { tier: 'poor', label: 'poor oral hygiene' };
}

export function silnessLoePlaqueIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const n0 = count(o.score0);
  const n1 = count(o.score1);
  const n2 = count(o.score2);
  const n3 = count(o.score3);
  if (n0 === null || n1 === null || n2 === null || n3 === null) {
    return { valid: false, code: 'INVALID_INPUT', field: 'score0', message: 'Surface counts must be whole numbers >= 0.', note: PLAQUE_INDEX_NOTE };
  }
  const total = n0 + n1 + n2 + n3;
  if (total <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'score0', message: 'Enter how many surfaces scored 0, 1, 2, and 3 (at least one surface).', note: PLAQUE_INDEX_NOTE };
  }

  const pi = (0 * n0 + 1 * n1 + 2 * n2 + 3 * n3) / total;
  const rounded = Math.round(pi * 100) / 100;
  const b = band(pi);

  return {
    valid: true,
    index: rounded,
    tier: b.tier,
    // Fair or worse (>= 1.0) is the actionable hygiene threshold.
    abnormal: pi >= 1.0,
    surfaces: total,
    bandLabel: `Plaque Index ${rounded}`,
    band: `Plaque Index ${rounded} — ${b.label}.`,
    detail: `Mean of ${total} surface scores. Bands (advisory): 0 excellent, 0.1-0.9 good, 1.0-1.9 fair, 2.0-3.0 poor oral hygiene.`,
    note: PLAQUE_INDEX_NOTE,
  };
}
