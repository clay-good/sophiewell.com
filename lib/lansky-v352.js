// spec-v352: Lansky Play-Performance Scale (LPPS) — the clinician/observer-rated pediatric functional
// status scale (0-100 in steps of 10), the pediatric counterpart to the Karnofsky Performance Status
// used in adults (the catalog carries ecog-karnofsky and pps for adults but no pediatric analogue).
// It grades a child's usual play and activity level. "lansky score" / "lansky play performance scale" /
// "pediatric performance status" routed to nothing.
//
// HIGH-STAKES: this reports the Lansky score the clinician has determined from the child's usual play
// and activity, NOT a diagnosis, a treatment/eligibility decision, or a prognosis for an individual
// patient (spec-v11 §5.3). Trial-eligibility thresholds (e.g. Lansky >= 60, analogous to Karnofsky
// >= 60) are protocol-specific; the assessment stays with the treating clinician.
//
// LEVELS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Lansky SB, List MA, Lansky LL, Ritter-Sterr C, Miller DR. The measurement of performance in
//     childhood cancer patients. Cancer. 1987;60(7):1651-1656 (the original 0-100 play-performance
//     definitions).
//   - Pediatric-oncology references (COG / trial protocols) reproducing the same 11-level scale.
//
// Levels (usual play and activity):
//   100: fully active, normal.
//    90: minor restrictions in physically strenuous activity.
//    80: active, but tires more quickly.
//    70: greater restriction of, and less time spent in, play activity.
//    60: up and around, but minimal active play; keeps busy with quieter activities.
//    50: gets dressed but lies around much of the day; no active play; participates in all quiet play.
//    40: mostly in bed; participates in quiet activities.
//    30: bedbound; needs assistance even for quiet play.
//    20: often sleeping; play entirely limited to very passive activities.
//    10: no play; does not get out of bed.
//     0: unresponsive.

const LEVELS = {
  100: 'Fully active, normal.',
  90: 'Minor restrictions in physically strenuous activity.',
  80: 'Active, but tires more quickly.',
  70: 'Greater restriction of, and less time spent in, play activity.',
  60: 'Up and around, but minimal active play; keeps busy with quieter activities.',
  50: 'Gets dressed but lies around much of the day; no active play; able to participate in all quiet play and activities.',
  40: 'Mostly in bed; participates in quiet activities.',
  30: 'In bed; needs assistance even for quiet play.',
  20: 'Often sleeping; play entirely limited to very passive activities.',
  10: 'No play; does not get out of bed.',
  0: 'Unresponsive.',
};

// Coarse functional bands (analogous to the Karnofsky 3-band read):
//   80-100 : able to carry on normal activity.
//   50-70  : reduced activity but up and about; some self-care limitation.
//   0-40   : mostly bedbound / disabled. Flagged.
function band(score) {
  if (score >= 80) return { label: 'able to carry on normal activity', reduced: false };
  if (score >= 50) return { label: 'reduced activity but up and about', reduced: false };
  return { label: 'mostly bedbound / disabled', reduced: true };
}

const NOTE = 'The Lansky Play-Performance Scale (Lansky 1987) is the pediatric counterpart to the Karnofsky Performance Status: an observer-rated 0-100 measure (steps of 10) of a child\'s usual play and activity. 80-100: able to carry on normal activity. 50-70: reduced activity but up and about. 0-40: mostly bedbound / disabled. Trial-eligibility thresholds (e.g. Lansky >= 60, analogous to Karnofsky >= 60) are protocol-specific. This reports the score the clinician has determined, not a diagnosis, a treatment/eligibility decision, or a prognosis.';

// input:
//   score: 0 / 10 / 20 / ... / 100 (a multiple of 10; string or number)
export function lansky(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.score == null ? '' : o.score).trim();
  const n = Number(raw);
  if (raw === '' || !Number.isFinite(n) || !Object.prototype.hasOwnProperty.call(LEVELS, n)) {
    return { valid: false, message: 'Select the Lansky score (0 to 100 in steps of 10).' };
  }
  const b = band(n);
  return {
    valid: true,
    score: n,
    reduced: b.reduced,
    abnormal: b.reduced,
    bandLabel: `Lansky ${n}`,
    band: `Lansky ${n} - ${LEVELS[n]}`,
    functionalBand: b.label,
    note: NOTE,
  };
}
