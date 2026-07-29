// spec-v596: the Lepine criteria for exudative pleural effusion. A DIRECT COMPANION to `heffner`, shipped in
// spec-v591: both are serum-free two-test rules built from the SAME two measurements -- pleural fluid LDH
// against the laboratory's serum reference, and pleural fluid cholesterol. `grep -c "id: 'lepine'" app.js`
// returned 0, as did every other slug spelling and every filename search.
//
// **THE TWO RULES USE THE SAME TWO TESTS WITH THRESHOLDS THAT MOVE IN OPPOSITE DIRECTIONS.** Lepine's LDH
// bar is HIGHER than Heffner's -- 0.6 against 0.45 times the upper limit of normal for serum LDH, so it is
// HARDER to trigger -- while its cholesterol bar is LOWER -- 40 against 45 mg/dL, so it is EASIER to
// trigger. NEITHER RULE DOMINATES THE OTHER. Each calls some effusions exudative that the other calls
// transudative, and it happens in BOTH directions. This lib computes both rules from the same inputs and
// says which axis the disagreement is on when they differ.
//
// **THE TRADE IS SPECIFICITY, AND IT IS LARGE.** In a head-to-head comparison of cholesterol- and
// LDH-based rules, Lepine ran 0.91 sensitive and 0.73 specific against Heffner's 0.93 and 0.58: about 15
// points of specificity bought for about 2 points of sensitivity. That comparison is why Lepine is described
// as the alternative whose accuracy is comparable to Light's criteria, and it is a statement about
// SPECIFICITY rather than about overall superiority.
//
// **IT IS AN OR RULE. THE TESTS DO NOT VOTE.** One positive test classifies the effusion as an exudate, and
// a negative second test does not outweigh it. Both of these rules are OR rules, and reading either as
// requiring both tests would call almost every exudate a transudate.
//
// **IT IS NOT ACTUALLY SERUM-FREE, AND THE EXCEPTION IS THE LDH TEST.** The cholesterol test uses the
// pleural fluid alone. The LDH test compares pleural fluid LDH against a MULTIPLE OF THE LABORATORY'S UPPER
// LIMIT OF NORMAL FOR SERUM LDH -- a reference value rather than the patient's blood, so no extra sample is
// drawn, but NOT A FIXED NUMBER, because that upper limit differs between laboratories and assays. The local
// value is required here and none is defaulted.
//
// HIGH-STAKES: this classifies an effusion as exudative or transudative. It does NOT give the CAUSE of
// either -- an exudate can be infection, malignancy, pulmonary embolism or many other things, and the
// classification is the beginning of the workup rather than the end. It does not indicate or contraindicate
// drainage, does not diagnose empyema or malignancy, and a transudative result does not exclude a
// coexisting exudative process. Diuretic treatment concentrates a transudate and can push any of these rules
// toward a false exudate (spec-v11 section 5.3).
//
// THRESHOLDS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER RECALLED (spec-v97), with
// the AND-versus-OR question checked explicitly because a two-test rule is easy to assume conjunctive:
//   - Lepine's criteria as reproduced and evaluated in a comparison of seven cholesterol- and
//     lactate-dehydrogenase-based criteria for differentiating exudative from transudative pleural
//     effusions, Scientific Reports 2025, which reports both rules side by side with their operating
//     characteristics.

export const LDH_MULTIPLIER = 0.6;               // times the laboratory upper limit of normal for SERUM LDH
export const CHOLESTEROL_THRESHOLD = 40;         // mg/dL
export const CHOLESTEROL_THRESHOLD_MMOL = 1.04;  // mmol/L, the source's SI figure

// The companion rule already in the catalog, carried so the disagreement can be computed.
export const HEFFNER_LDH_MULTIPLIER = 0.45;
export const HEFFNER_CHOLESTEROL_THRESHOLD = 45;

export const LEPINE_SENSITIVITY = 0.91;
export const LEPINE_SPECIFICITY = 0.73;
export const HEFFNER_SENSITIVITY = 0.93;
export const HEFFNER_SPECIFICITY = 0.58;

export const OPPOSITE_NOTE = `The two rules use the SAME two tests with thresholds that move in OPPOSITE directions. Lepine's LDH bar is HIGHER than Heffner's (${LDH_MULTIPLIER} against ${HEFFNER_LDH_MULTIPLIER} times the serum upper limit, so harder to trigger) while its cholesterol bar is LOWER (${CHOLESTEROL_THRESHOLD} against ${HEFFNER_CHOLESTEROL_THRESHOLD} mg/dL, so easier to trigger). NEITHER RULE DOMINATES THE OTHER: each calls some effusions exudative that the other calls transudative, in BOTH directions.`;
export const TRADE_NOTE = `The trade is specificity, and it is large: Lepine ran ${LEPINE_SENSITIVITY} sensitive and ${LEPINE_SPECIFICITY} specific against Heffner's ${HEFFNER_SENSITIVITY} and ${HEFFNER_SPECIFICITY} in a head-to-head comparison - about 15 points of specificity for about 2 points of sensitivity. Describing Lepine as the alternative comparable to Light's criteria is a statement about SPECIFICITY, not about overall superiority.`;
export const OR_NOTE = 'This is an OR rule and the tests do not vote: one positive test classifies the effusion as an exudate, and a negative second test does not outweigh it. Reading either of these rules as requiring BOTH tests would call almost every exudate a transudate.';
export const SERUM_NOTE = `It is not actually serum-free, and the exception is the LDH test. Cholesterol uses the pleural fluid alone, but the LDH test compares pleural fluid LDH against ${LDH_MULTIPLIER} times THE LABORATORY'S UPPER LIMIT OF NORMAL FOR SERUM LDH - a reference value rather than the patient's blood, so no extra sample is drawn, but NOT a fixed number, because that upper limit differs between laboratories and assays. The local value is required here and none is defaulted.`;
export const DIURETIC_NOTE = 'Diuretic treatment concentrates a transudate and raises its protein and LDH, so a patient diuresed for heart failure can be misclassified as exudative by any of these rules.';

const NOTE = `The Lepine criteria classify a pleural effusion as exudative without a paired serum sample. It is an OR rule: EITHER pleural fluid LDH above ${LDH_MULTIPLIER} times the laboratory upper limit of normal for serum LDH, OR pleural fluid cholesterol above ${CHOLESTEROL_THRESHOLD} mg/dL (${CHOLESTEROL_THRESHOLD_MMOL} mmol/L), classifies the effusion as an exudate. The tests do not vote and a negative second test does not outweigh a positive first. It uses the same two measurements as the Heffner two-test rule already in this catalog, with thresholds that move in OPPOSITE directions: Lepine's LDH bar is higher at ${LDH_MULTIPLIER} against ${HEFFNER_LDH_MULTIPLIER}, so harder to trigger, while its cholesterol bar is lower at ${CHOLESTEROL_THRESHOLD} against ${HEFFNER_CHOLESTEROL_THRESHOLD} mg/dL, so easier to trigger. Neither rule dominates the other and each calls some effusions exudative that the other calls transudative, in both directions. In a head-to-head comparison Lepine ran ${LEPINE_SENSITIVITY} sensitive and ${LEPINE_SPECIFICITY} specific against Heffner's ${HEFFNER_SENSITIVITY} and ${HEFFNER_SPECIFICITY}, so calling Lepine the alternative comparable to Light's criteria is a statement about specificity rather than about overall superiority. It is not actually serum-free: the LDH test needs the laboratory's upper limit of normal for serum LDH, which is a reference value rather than the patient's blood but is not a fixed number, so the local value is required and none is defaulted. This classifies an effusion and does not give the cause of either category. An exudate can be infection, malignancy, pulmonary embolism or many other things, and the classification is the beginning of the workup rather than the end. It does not indicate or contraindicate drainage, does not diagnose empyema or malignancy, and a transudative result does not exclude a coexisting exudative process. Diuretic treatment concentrates a transudate and can push any of these rules toward a false exudate.`;

function readNum(v, name, { min = 0 } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n < min) throw new Error(`${name} must be a number that is ${min} or more.`);
  return n;
}

// input: pleuralLdh, serumLdhUln, pleuralCholesterol.
export function lepine(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let ldh, uln, chol;
  try {
    ldh = readNum(o.pleuralLdh, 'Pleural fluid LDH');
    uln = readNum(o.serumLdhUln, 'Laboratory upper limit of normal for serum LDH', { min: 1 });
    chol = readNum(o.pleuralCholesterol, 'Pleural fluid cholesterol');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if ([ldh, uln, chol].some((x) => x === null)) {
    return { valid: false, message: `Enter the pleural fluid LDH and cholesterol, and YOUR LABORATORY'S upper limit of normal for SERUM LDH. ${SERUM_NOTE}` };
  }

  const round2 = (n) => Number(n.toFixed(2));
  const lepineLdhCutoff = round2(LDH_MULTIPLIER * uln);
  const heffnerLdhCutoff = round2(HEFFNER_LDH_MULTIPLIER * uln);

  const lepineLdh = ldh > lepineLdhCutoff;
  const lepineChol = chol > CHOLESTEROL_THRESHOLD;
  const lepineExudate = lepineLdh || lepineChol;

  const heffnerLdh = ldh > heffnerLdhCutoff;
  const heffnerChol = chol > HEFFNER_CHOLESTEROL_THRESHOLD;
  const heffnerExudate = heffnerLdh || heffnerChol;

  const disagree = lepineExudate !== heffnerExudate;
  let disagreementAxis = null;
  if (disagree) {
    if (lepineChol !== heffnerChol) disagreementAxis = 'cholesterol';
    else if (lepineLdh !== heffnerLdh) disagreementAxis = 'ldh';
  }

  const parts = [];
  parts.push(`${lepineExudate ? 'EXUDATE' : 'Transudate'} by the Lepine criteria${lepineExudate ? ` (positive: ${[lepineLdh ? 'ldh' : null, lepineChol ? 'cholesterol' : null].filter(Boolean).join(', ')})` : ' (neither test positive)'}.`);
  parts.push(`By the Heffner two-test rule already in this catalog: ${heffnerExudate ? 'EXUDATE' : 'transudate'}.`);
  if (disagree) {
    parts.push(disagreementAxis === 'cholesterol'
      ? `THE TWO RULES DISAGREE, ON THE CHOLESTEROL AXIS: a cholesterol of ${chol} mg/dL is above Lepine's ${CHOLESTEROL_THRESHOLD} and not above Heffner's ${HEFFNER_CHOLESTEROL_THRESHOLD}. Lepine's cholesterol bar is the LOWER of the two.`
      : `THE TWO RULES DISAGREE, ON THE LDH AXIS: a pleural LDH of ${ldh} is above Heffner's cutoff of ${heffnerLdhCutoff} and not above Lepine's ${lepineLdhCutoff}. Lepine's LDH bar is the HIGHER of the two.`);
  }
  parts.push(`The LDH cutoffs used here are ${lepineLdhCutoff} for Lepine and ${heffnerLdhCutoff} for Heffner, both from your laboratory upper limit of ${uln}. ${SERUM_NOTE}`);
  parts.push(OPPOSITE_NOTE);
  parts.push(TRADE_NOTE);
  parts.push(OR_NOTE);
  parts.push(DIURETIC_NOTE);
  parts.push('This classifies the effusion and does not give the cause. An exudate can be infection, malignancy, pulmonary embolism or many other things. It does not indicate or contraindicate drainage.');

  return {
    valid: true,
    exudate: lepineExudate,
    exudateByHeffner: heffnerExudate,
    rulesDisagree: disagree,
    disagreementAxis,
    ldhPositive: lepineLdh,
    cholesterolPositive: lepineChol,
    ldhCutoffUsed: lepineLdhCutoff,
    heffnerLdhCutoffForContrast: heffnerLdhCutoff,
    band: lepineExudate ? 'Exudate' : 'Transudate',
    bandLabel: `${lepineExudate ? 'Exudate' : 'Transudate'} by Lepine`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
