// spec-v314: Deauville 5-point score (FDG-PET metabolic response in lymphoma) — the
// PET-response companion to the existing Ann Arbor / Lugano anatomic staging tile
// (a catalog gap: the lymphoma cluster had anatomic staging but no metabolic-response
// scale). The clinician picks the 5-point uptake score (1-5); the tile reports the
// score, its uptake description, and the standard Lugano interpretation (1-2
// negative, 4-5 positive, 3 by clinical context).
//
// This reports the classification's own score and interpretation, NOT a treatment
// decision (spec-v11 §5.3) — the response assessment and management stay with the
// clinician; score 3 in particular is read in the clinical context.
//
// SCALE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified at build against the
// Lugano classification and independent references that agree:
//   - Barrington SF, Mikhaeel NG, Kostakoglu L, et al. Role of imaging in the staging
//     and response assessment of lymphoma: consensus of the ICML Imaging Working
//     Group. J Clin Oncol. 2014;32(27):3048-3058 (the Deauville 5-point scale within
//     the Lugano classification).
//   - Radiopaedia (Deauville five-point scale), which reproduces the same scale.

const SCORE_DESC = {
  1: 'no uptake above background',
  2: 'uptake ≤ mediastinum',
  3: 'uptake > mediastinum but ≤ liver',
  4: 'uptake moderately increased compared to the liver at any site',
  5: 'uptake markedly increased compared to the liver at any site, and/or new lesions',
};
const SCORE_INTERP = {
  1: 'negative — complete metabolic response',
  2: 'negative — complete metabolic response',
  3: 'interpreted by clinical context; in many patients (especially at end of treatment) it indicates complete metabolic response / good prognosis with standard treatment',
  4: 'positive — inadequate metabolic response (residual uptake above the liver)',
  5: 'positive — inadequate metabolic response (uptake markedly above the liver and/or new lesions)',
};

function parseScore(raw) {
  const n = Number(typeof raw === 'string' ? raw.trim() : raw);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new RangeError('Deauville score must be a whole number from 1 to 5.');
  }
  return n;
}

const NOTE = 'Deauville 5-point score (Lugano classification; Barrington 2014) for FDG-PET response assessment in lymphoma. Score 1 = no uptake above background; 2 = uptake ≤ mediastinum; 3 = uptake > mediastinum but ≤ liver; 4 = uptake moderately > liver; 5 = uptake markedly > liver and/or new lesions (X = new uptake unlikely related to lymphoma). Scores 1-2 are negative (complete metabolic response) and 4-5 are positive; score 3 is read in the clinical context (often a good prognosis, and complete metabolic response at end of treatment). This reports the score and its interpretation, not a treatment decision, which stays with the clinician.';

// input.score: 1-5. Returns the Deauville score with its uptake description, the
// Lugano interpretation, and the positive (4-5) flag.
export function deauvilleScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const score = parseScore(o.score);

  const positive = score >= 4;
  const negative = score <= 2;
  const label = `Deauville score ${score}`;
  const band = `${label} — ${SCORE_DESC[score]}. ${SCORE_INTERP[score].charAt(0).toUpperCase()}${SCORE_INTERP[score].slice(1)}.`;

  return {
    valid: true,
    score,
    positive,
    negative,
    abnormal: positive,
    description: SCORE_DESC[score],
    interpretation: SCORE_INTERP[score],
    bandLabel: label,
    band,
    note: NOTE,
  };
}
