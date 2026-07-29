// spec-v587: the quick Pitt (qPitt) bacteremia score. A REVISED-SUCCESSOR GAP: `pitt-bacteremia` has been in
// the catalog since spec-v199 and its simplified successor was absent. `grep -ci "quick pitt" app.js`
// returned 0.
//
// **FEVER SCORES NOTHING. ONLY HYPOTHERMIA DOES.** This is the load-bearing fact and it inverts an
// expectation almost every user brings. The temperature item is a single binary: under 36 degrees C scores
// 1, and EVERYTHING ELSE SCORES 0. A patient at 40.5 degrees C scores exactly the same on this item as a
// patient at 37.0. The predecessor scored fever -- its temperature band awarded points at 40 degrees C and
// above as well as for hypothermia -- and the successor dropped that half of the item entirely. An
// implementation that scores "abnormal temperature" is wrong for every febrile patient, and wrong in the
// direction of over-scoring.
//
// **THE SUCCESSOR IS BINARY WHERE THE PREDECESSOR WAS WEIGHTED, OVER THE SAME FIVE DOMAINS.** The Pitt
// Bacteremia Score runs 0 to 14, with cardiac arrest worth 4 and graded mental-status and temperature bands.
// qPitt runs 0 to 5, one point per domain, no gradations at all. So cardiac arrest -- the single most
// ominous item on the predecessor -- is worth exactly as much here as a respiratory rate of 25. The domains
// are the same; the arithmetic is not, and a score cannot be carried between the two.
//
// **THE HIGH-RISK THRESHOLD IS ONLY 2 OF 5.** Mortality was 8.7 percent below it and 57.5 percent at or
// above it in the derivation. Two of five is a low bar for a nearly sevenfold difference, which is the point
// of the score and also its main danger if the threshold is misremembered as a higher number.
//
// **THE PUBLISHED MORTALITY LADDER STOPS SHORT.** Predicted 28-day mortality is reported as 3, 9, 22, 45 and
// 70 percent for scores of 0, 1, 2, 3 and "4 OR MORE". A score of 5 has NO figure of its own -- the source
// lumps it with 4 -- so this lib reports 70 percent for both and says the lumping is the source's, not an
// approximation of its own.
//
// **ONE OPERATOR DIVERGES BETWEEN REPRODUCTIONS.** The hypotension item is rendered as systolic blood
// pressure "under 90" in some reproductions and "90 or below" in others, which differ only at exactly 90.
// The derivation's own wording is a systolic pressure below 90 mmHg or the use of vasopressors, and that is
// applied here, with the divergence stated rather than hidden (spec-v97).
//
// HIGH-STAKES: this is a MORTALITY PROGNOSTIC score for a patient who already has a bloodstream infection.
// It does NOT diagnose bacteremia, does not identify the organism or the source, and does not select an
// antibiotic -- and in particular a low qPitt is NOT a reason to withhold or narrow empiric therapy, since
// the score knows nothing about resistance, source control or the site of infection. It is not a sepsis
// screening tool for undifferentiated patients (spec-v11 section 5.3).
//
// ITEMS, THRESHOLDS AND THE MORTALITY LADDER RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97),
// with the temperature item and the blood-pressure operator each checked separately because those are the
// two places reproductions diverge:
//   - Battle SE, Augustine MR, Watson CM, et al. Derivation of a quick Pitt bacteremia score to predict
//     mortality in patients with Gram-negative bloodstream infection. Infection. 2019;47(4):571-578.

export const QPITT_MAX = 5;
export const HIGH_RISK_THRESHOLD = 2;
export const TEMP_THRESHOLD_C = 36;
export const SBP_THRESHOLD = 90;
export const RR_THRESHOLD = 25;

export const PREDECESSOR_MAX = 14;

export const ITEMS = [
  {
    key: 'hypothermia', points: 1,
    text: `Temperature under ${TEMP_THRESHOLD_C} degrees C`,
    detail: 'HYPOTHERMIA ONLY. Fever scores nothing at all on this score, however high.',
  },
  {
    key: 'hypotension', points: 1,
    text: `Systolic blood pressure under ${SBP_THRESHOLD} mmHg, or vasopressors in use`,
    detail: 'Some reproductions print "90 or below"; the derivation reads below 90, which is what is applied.',
  },
  {
    key: 'respiratory', points: 1,
    text: `Respiratory rate of ${RR_THRESHOLD} or more, or mechanical ventilation`,
    detail: 'Worth exactly as much as cardiac arrest on this score.',
  },
  { key: 'alteredMentalStatus', points: 1, text: 'Altered mental status', detail: 'Binary. The predecessor graded it.' },
  { key: 'cardiacArrest', points: 1, text: 'Cardiac arrest', detail: 'Worth 1 here; worth 4 on the predecessor.' },
];

// Predicted 28-day mortality. The source's top row is "4 or more", so 4 and 5 share a figure.
export const MORTALITY_BY_SCORE = { 0: 3, 1: 9, 2: 22, 3: 45, 4: 70, 5: 70 };
export const MORTALITY_TOP_ROW_LUMPED = true;
export const DERIVATION_BELOW_THRESHOLD = 8.7;
export const DERIVATION_AT_OR_ABOVE_THRESHOLD = 57.5;

export const FEVER_NOTE = `The temperature item is HYPOTHERMIA ONLY: under ${TEMP_THRESHOLD_C} degrees C scores 1 and everything else scores 0, so a patient at 40.5 degrees C scores the same as one at 37.0. The predecessor Pitt Bacteremia Score awarded points for fever as well; the successor dropped that half of the item. Scoring "abnormal temperature" over-scores every febrile patient.`;
export const WEIGHTING_NOTE = `The same five domains are WEIGHTED on the predecessor (0 to ${PREDECESSOR_MAX}, cardiac arrest worth 4, graded mental-status and temperature bands) and BINARY here (0 to ${QPITT_MAX}, one point each). Cardiac arrest is worth exactly as much as a respiratory rate of ${RR_THRESHOLD}. A score cannot be carried between the two.`;
export const LUMPED_NOTE = 'The published mortality ladder stops short: 3, 9, 22, 45 and 70 percent for 0, 1, 2, 3 and "4 or more". A score of 5 has NO figure of its own - the source lumps it with 4 - so both are reported as 70 percent, and the lumping is the source’s rather than an approximation made here.';

const NOTE = `The quick Pitt (qPitt) bacteremia score (Battle and colleagues 2019) predicts mortality in a patient who already has a bloodstream infection, from five binary items worth one point each, 0 to ${QPITT_MAX}: temperature under ${TEMP_THRESHOLD_C} degrees C, systolic blood pressure under ${SBP_THRESHOLD} mmHg or vasopressors, respiratory rate of ${RR_THRESHOLD} or more or mechanical ventilation, altered mental status, and cardiac arrest. High risk is ${HIGH_RISK_THRESHOLD} or more, with derivation mortality of ${DERIVATION_BELOW_THRESHOLD} percent below the threshold and ${DERIVATION_AT_OR_ABOVE_THRESHOLD} percent at or above it. FEVER SCORES NOTHING: the temperature item is hypothermia only, so a patient at 40.5 degrees C scores the same as one at 37.0, and the predecessor Pitt Bacteremia Score awarded points for fever while the successor dropped that half of the item. The successor is binary where the predecessor was weighted over the same five domains: the Pitt Bacteremia Score runs 0 to ${PREDECESSOR_MAX} with cardiac arrest worth 4 and graded bands, so cardiac arrest is worth exactly as much here as a respiratory rate of ${RR_THRESHOLD}, and a score cannot be carried between the two. The published mortality ladder is 3, 9, 22, 45 and 70 percent for 0, 1, 2, 3 and 4 or more, so a score of 5 has no figure of its own and is reported at 70 percent, which is the source’s lumping rather than an approximation made here. One operator diverges between reproductions, the hypotension item being printed as under 90 or as 90 or below; the derivation reads below 90, which is applied. This is a mortality prognostic for a patient who already has a bloodstream infection. It does not diagnose bacteremia, does not identify the organism or the source, and does not select an antibiotic; a low score is NOT a reason to withhold or narrow empiric therapy, since the score knows nothing about resistance, source control or the site of infection. It is not a sepsis screening tool for undifferentiated patients.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: one key per item in ITEMS, each yes/no.
export function qPitt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let read;
  try {
    read = ITEMS.map((i) => ({ i, v: readBool(o[i.key], i.text) }));
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = read.filter((r) => r.v === null).map((r) => r.i.key);
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.join(', ')}. Note that the temperature item asks about HYPOTHERMIA only - fever scores nothing.` };
  }

  const met = read.filter((r) => r.v).map((r) => r.i.key);
  const total = met.length;
  const highRisk = total >= HIGH_RISK_THRESHOLD;
  const mortality = MORTALITY_BY_SCORE[total];
  const lumped = total >= 4;

  const parts = [];
  parts.push(`qPitt ${total} of ${QPITT_MAX}: ${highRisk ? 'HIGH RISK' : 'below the high-risk threshold'}. The threshold is only ${HIGH_RISK_THRESHOLD} of ${QPITT_MAX}, across which derivation mortality moved from ${DERIVATION_BELOW_THRESHOLD} to ${DERIVATION_AT_OR_ABOVE_THRESHOLD} percent.`);
  parts.push(`Predicted 28-day mortality ${mortality} percent.${lumped ? ` ${LUMPED_NOTE}` : ''}`);
  parts.push(FEVER_NOTE);
  parts.push(WEIGHTING_NOTE);
  parts.push('This is a mortality prognostic for a patient who already has a bloodstream infection. It does not diagnose bacteremia, identify the organism or the source, or select an antibiotic, and a low score is not a reason to withhold or narrow empiric therapy.');

  return {
    valid: true,
    total,
    max: QPITT_MAX,
    highRisk,
    threshold: HIGH_RISK_THRESHOLD,
    metItems: met,
    predictedMortalityPercent: mortality,
    mortalityFigureLumped: lumped,
    band: highRisk ? 'High risk' : 'Not high risk',
    bandLabel: `qPitt ${total} of ${QPITT_MAX}, ${highRisk ? 'high risk' : 'not high risk'}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
