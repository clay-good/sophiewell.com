// spec-v697: King's Score for liver fibrosis (chronic hepatitis C).
//
// A simple noninvasive index of liver fibrosis, derived and validated in chronic hepatitis C.
// Source:
//   Cross TJS, Rizzi P, Berry PA, Bruce M, Portmann B, Harrison PM. King's Score: an accurate
//   marker of cirrhosis in chronic hepatitis C. Eur J Gastroenterol Hepatol.
//   2009;21(7):730-738. (PMID 19430302.)
//
//   King's Score = (Age [years] x AST [U/L] x INR) / platelet count [x10^9/L]
//
// Interpretation (original HCV derivation, Ishak staging):
//   < 12.3   low probability of significant fibrosis
//   >= 12.3  significant fibrosis likely (Ishak F3-F6); AUROC ~0.79
//   >= 16.7  cirrhosis likely; sensitivity ~86%, specificity ~80%, NPV ~96%, AUROC ~0.91
//
// The cut-points are the chronic-HCV derivation; other populations (e.g. chronic hepatitis B)
// report different thresholds, so this tile labels the population as chronic HCV.
//
// Pure: no DOM, no clock, no network.

export const KINGS_SCORE_NOTE = "King's Score for liver fibrosis in chronic hepatitis C (Cross TJS, Rizzi P, Berry PA, Bruce M, Portmann B, Harrison PM, Eur J Gastroenterol Hepatol 2009;21(7):730-738). It is a simple noninvasive index: King's Score = (age in years x AST in U/L x INR) / platelet count in x10^9/L. In the original chronic-hepatitis-C derivation a score below 12.3 makes significant fibrosis unlikely, a score of 12.3 or more indicates significant fibrosis is likely (Ishak stage F3 to F6, area under the curve about 0.79), and a score of 16.7 or more indicates cirrhosis is likely (about 86 percent sensitive and 80 percent specific, negative predictive value about 96 percent, area under the curve about 0.91). These cut-points are the chronic-HCV derivation; other liver diseases such as chronic hepatitis B report different thresholds. It is a noninvasive estimate that supports rather than replaces biopsy, elastography, and clinical judgment.";

function pos(v) {
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(String(v).trim());
}

function band(score) {
  if (score < 12.3) return { tier: 'low', label: 'low probability of significant fibrosis' };
  if (score < 16.7) return { tier: 'significant-fibrosis', label: 'significant fibrosis likely (Ishak F3-F6)' };
  return { tier: 'cirrhosis', label: 'cirrhosis likely' };
}

export function kingsScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = pos(o.age);
  if (!Number.isFinite(age) || age <= 0 || age > 130) {
    return { valid: false, code: 'MISSING_INPUT', field: 'age', message: 'Enter age in years.', note: KINGS_SCORE_NOTE };
  }
  const ast = pos(o.ast);
  if (!Number.isFinite(ast) || ast <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'ast', message: 'Enter AST in U/L.', note: KINGS_SCORE_NOTE };
  }
  const inr = pos(o.inr);
  if (!Number.isFinite(inr) || inr <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'inr', message: 'Enter INR.', note: KINGS_SCORE_NOTE };
  }
  const platelets = pos(o.platelets);
  if (!Number.isFinite(platelets) || platelets <= 0) {
    return { valid: false, code: 'MISSING_INPUT', field: 'platelets', message: 'Enter platelet count in x10^9/L (e.g. 200 for 200,000/uL).', note: KINGS_SCORE_NOTE };
  }

  const score = (age * ast * inr) / platelets;
  const rounded = Math.round(score * 10) / 10;
  const b = band(score);

  return {
    valid: true,
    score: rounded,
    tier: b.tier,
    abnormal: score >= 12.3,
    bandLabel: `Kings Score ${rounded}`,
    band: `Kings Score ${rounded} — ${b.label}.`,
    detail: `(age ${age} x AST ${ast} x INR ${inr}) / platelets ${platelets} = ${rounded}. Cut-points (chronic HCV): < 12.3 low, >= 12.3 significant fibrosis, >= 16.7 cirrhosis.`,
    note: KINGS_SCORE_NOTE,
  };
}
