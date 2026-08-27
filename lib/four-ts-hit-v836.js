// spec-v836: the 4Ts score for heparin-induced thrombocytopenia.
//
// Sources:
//   Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. Evaluation of pretest
//     clinical score (4 Ts) for the diagnosis of heparin-induced thrombocytopenia in two
//     clinical settings. J Thromb Haemost. 2006;4(4):759-765.
//   Cuker A, Arepally GM, Chong BH, et al. American Society of Hematology 2018 guidelines for
//     management of venous thromboembolism: heparin-induced thrombocytopenia. Blood Adv.
//     2018;2(22):3360-3392. The table here is taken from the Society's own pocket guide,
//     which adapts Lo 2006 with Warkentin 2010.
//
// FOUR DOMAINS, 0 TO 2 POINTS EACH, TOTAL 0-8:
//   Thrombocytopenia  2 fall >50% AND nadir >=20; 1 fall 30-50% OR nadir 10-19; 0 fall <30%
//                     OR nadir <10 (x10^9/L)
//   Timing            2 clear onset days 5-14, or a fall within 1 day with heparin exposure
//                     in the past 30 days; 1 consistent with days 5-14 but unclear, or onset
//                     after day 14, or a fall within 1 day with exposure 30-100 days ago;
//                     0 a fall within 4 days without recent exposure
//   Thrombosis        2 new confirmed thrombosis, skin necrosis at injection sites, an
//                     anaphylactoid reaction after an intravenous bolus, or adrenal
//                     haemorrhage; 1 progressive or recurrent thrombosis, non-necrotizing
//                     skin lesions, or suspected but unconfirmed thrombosis; 0 none
//   oTher causes      2 none apparent; 1 possible; 0 definite
//
//   6-8 high probability, 4-5 intermediate, 3 or below low.
//
// THE TIMING WINDOW IS DAYS 5 TO 14, NOT 5 TO 10. The original description used a narrower
// window; the version the American Society of Hematology publishes widens it. A tool still on
// 5-10 under-scores the domain in patients whose fall begins in the second week.
//
// A LOW SCORE MEANS DO NOT TEST. This is the part that inverts usual practice: at low
// probability the Society recommends AGAINST laboratory testing for heparin-induced
// thrombocytopenia, because the negative predictive value of a low score is near total while
// the positive predictive value of a high one is poor. The score rules out far better than it
// rules in, and a high score is a reason to test and treat empirically, not a diagnosis.
//
// AND MISSING INFORMATION SHOULD BE SCORED UPWARD. The Society states that where key
// information is missing it may be prudent to err on the side of a HIGHER score - the
// opposite of the usual convention of scoring absent data as zero.
//
// Pure: no DOM, no clock, no network.

export const FOUR_TS_NOTE = 'The 4Ts score (Lo GK, Juhl D, Warkentin TE, et al, J Thromb Haemost 2006;4(4):759-765, as published by the American Society of Hematology) estimates the probability of heparin-induced thrombocytopenia from four domains scored nought to two each. Thrombocytopenia scores two for a platelet fall over half with a nadir at or above twenty, one for a fall of thirty to fifty percent or a nadir of ten to nineteen, and nought below that. Timing scores two for a clear onset between days five and fourteen or a fall within a day where heparin was given in the previous month, one where that is likely but unclear or the onset is later, and nought for a fall within four days without recent exposure. Thrombosis scores two for new confirmed thrombosis, skin necrosis at injection sites, an anaphylactoid reaction after an intravenous bolus or adrenal bleeding, and one for progressive or suspected but unconfirmed events. Other causes score two when none is apparent, one when one is possible and nought when one is definite. Six to eight is high probability, four to five intermediate and three or below low. Three things matter beyond the arithmetic. The timing window is days five to fourteen and not five to ten, so a tool using the narrower window under-scores a fall beginning in the second week. A low score means do not test: at low probability the Society recommends against laboratory testing, because a low score rules the condition out far better than a high score rules it in. And where key information is missing the Society advises erring towards a higher score rather than treating absent data as nought. It estimates a pretest probability from information already gathered and it does not stop heparin or start an alternative anticoagulant.';

const DOMAINS = {
  thrombocytopenia: {
    2: 'a platelet fall over 50 percent with a nadir at or above 20',
    1: 'a platelet fall of 30 to 50 percent, or a nadir of 10 to 19',
    0: 'a platelet fall under 30 percent, or a nadir below 10',
  },
  timing: {
    2: 'a clear onset between days 5 and 14, or a fall within 1 day with heparin exposure in the past 30 days',
    1: 'consistent with days 5 to 14 but unclear, or onset after day 14, or a fall within 1 day with exposure 30 to 100 days ago',
    0: 'a platelet fall within 4 days without recent exposure',
  },
  thrombosis: {
    2: 'new confirmed thrombosis, skin necrosis at injection sites, an anaphylactoid reaction after an intravenous bolus, or adrenal hemorrhage',
    1: 'progressive or recurrent thrombosis, non-necrotizing skin lesions, or suspected but unconfirmed thrombosis',
    0: 'none',
  },
  otherCauses: {
    2: 'no other cause of thrombocytopenia apparent',
    1: 'another cause is possible',
    0: 'another cause is definite',
  },
};

export const HIGH_MIN = 6;
export const INTERMEDIATE_MIN = 4;

function num(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function fourTsHit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const parts = {};
  let score = 0;
  const contributions = [];
  for (const key of Object.keys(DOMAINS)) {
    const raw = num(o[key]);
    const v = raw === null ? 0 : raw;
    if (!Object.prototype.hasOwnProperty.call(DOMAINS[key], String(v))) {
      return { valid: false, message: `${key} must be 0, 1 or 2.` };
    }
    parts[key] = v;
    score += v;
    contributions.push(`${DOMAINS[key][v]} (${v})`);
  }

  // `band` is the result SENTENCE by convention in this codebase, so the probability tier
  // gets its own name rather than shadowing it.
  const probability = score >= HIGH_MIN ? 'high' : (score >= INTERMEDIATE_MIN ? 'intermediate' : 'low');

  // The recommendation that inverts usual practice.
  const testingAdvice = probability === 'low'
    ? 'At low probability the Society recommends AGAINST laboratory testing for heparin-induced thrombocytopenia. The negative predictive value of a low score is near total, while the positive predictive value of a high one is poor: this score rules out far better than it rules in.'
    : 'At intermediate or high probability the Society recommends an immunoassay. A high score is a reason to test and to consider stopping heparin empirically, not a diagnosis on its own.';

  // Missing information should push the score UP, not down.
  const missingInfo = truthy(o.keyInformationMissing);
  const missingNote = missingInfo
    ? 'Key information is recorded as missing. The Society states that where that is so it may be prudent to err on the side of a HIGHER 4Ts score, rather than the usual convention of scoring absent data as zero. Treat this total as a floor.'
    : null;

  const lowWithMissing = missingInfo && probability === 'low'
    ? 'Laboratory testing may still be appropriate despite a low-probability score, because the Society names uncertainty about the score itself - for example from missing data - as a reason to test anyway.'
    : null;

  return {
    valid: true,
    score,
    probability,
    parts,
    contributions,
    testingAdvice,
    missingNote,
    lowWithMissing,
    abnormal: probability !== 'low',
    bandLabel: `${probability.charAt(0).toUpperCase()}${probability.slice(1)} probability`,
    band: `4Ts score ${score} of 8 — ${probability} probability of heparin-induced thrombocytopenia.`,
    detail: `${HIGH_MIN} to 8 is high probability, ${INTERMEDIATE_MIN} to ${HIGH_MIN - 1} intermediate, ${INTERMEDIATE_MIN - 1} or below low. The timing domain uses days 5 to 14, not the narrower 5 to 10 of the original description. Reassess and recalculate if the clinical picture changes.`,
    note: FOUR_TS_NOTE,
  };
}

export { DOMAINS };
