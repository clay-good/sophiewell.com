// spec-v595: the ACEF and ACEF II risk scores for cardiac surgery. `grep -c "id: 'acef'" app.js` returned 0,
// as did every other slug spelling and every filename search. The catalog carries perioperative cardiac
// risk instruments (rcri, nsqip-derived tools, asa-ps) and had neither ACEF version.
//
// **THIS IS A RATIO, NOT A SUM OF POINTS.** The backbone is AGE DIVIDED BY EJECTION FRACTION -- a
// dimensionless quantity -- with absolute numbers bolted onto it. There is therefore NO MAXIMUM SCORE and no
// point ceiling, and the usual "x of y" framing does not apply. A 70-year-old with an ejection fraction of
// 35 percent scores 2.0 before any add-on.
//
// **EJECTION FRACTION IS A DENOMINATOR, SO THE SCORE IS NONLINEAR IN IT.** Halving the ejection fraction
// DOUBLES the score. At age 70, an ejection fraction of 30 gives 2.33 and an ejection fraction of 60 gives
// 1.17. No additive score behaves this way, and a reader who expects each risk factor to add a fixed amount
// will badly misjudge the effect of a poor ventricle.
//
// **THE CREATININE WEIGHT DOUBLES BETWEEN THE TWO VERSIONS.** The original adds 1 point; ACEF II adds 2. The
// same patient therefore does not merely score higher on ACEF II, they score higher BY A DIFFERENT
// STRUCTURE, and a value cannot be carried between the versions.
//
// **ONE REPRODUCTION OF THE ORIGINAL PRINTS THE CREATININE OPERATOR DIFFERENTLY.** Some sources give the
// original as "creatinine 2.0 mg/dL OR MORE" and others as "ABOVE 2.0"; they differ only at exactly 2.0.
// ACEF II is consistently printed as ABOVE 2.0, and that operator is applied to both here so the versions
// stay comparable. A creatinine of exactly 2.0 is the one value where renderings disagree, and the result
// says so when it occurs (spec-v97).
//
// **THE HEMATOCRIT TERM IS CONTINUOUS AND ONE-SIDED.** ACEF II adds 0.2 for EACH percentage point below 36,
// and adds NOTHING above 36. It is not a threshold flag: a hematocrit of 26 adds 2.0, as much as the
// creatinine term. A hematocrit of 40 adds nothing at all, and there is no benefit for being above 36.
//
// **THE ORIGINAL WAS DERIVED IN ELECTIVE SURGERY AND HAS NO EMERGENCY TERM.** ACEF II adds emergency surgery
// explicitly, worth 3 -- the largest single add-on in either version. Applying the ORIGINAL score to an
// emergency case is outside the setting it was derived in, and this lib flags that case rather than
// silently returning a number.
//
// HIGH-STAKES: these are group-level PREOPERATIVE mortality estimates for cardiac surgery. They do NOT
// decide whether to operate, do not choose between surgery, percutaneous intervention and medical therapy,
// and do not select an operation or a surgeon. A high score is NOT a reason to decline surgery -- for many
// of these patients the untreated course is worse, and these scores say nothing about it. They do not
// estimate stroke, renal failure, length of stay or any outcome other than the mortality they were built
// for (spec-v11 section 5.3).
//
// FORMULAS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES EACH, NEVER RECALLED (spec-v97),
// with the creatinine operator checked separately because that is the one cell where renderings diverge:
//   - Ranucci M, Castelvecchio S, Menicanti L, et al. Risk of assessing mortality risk in elective cardiac
//     operations: age, creatinine, ejection fraction, and the law of parsimony. Circulation.
//     2009;119(24):3053-3061.
//   - Ranucci M, Pistuddi V, Scolletta S, et al. The ACEF II Risk Score for cardiac surgery. Eur J
//     Cardiothorac Surg. 2018;53(5):1064-1071.

export const CREATININE_THRESHOLD = 2.0;        // mg/dL, strictly above
export const ACEF_CREATININE_POINTS = 1;
export const ACEF2_CREATININE_POINTS = 2;
export const ACEF2_EMERGENCY_POINTS = 3;
export const HCT_REFERENCE = 36;                // percent
export const HCT_POINTS_PER_POINT_BELOW = 0.2;

export const RATIO_NOTE = 'This is a RATIO, not a sum of points: the backbone is age divided by ejection fraction, a dimensionless quantity, with absolute numbers bolted on. There is NO maximum score and no point ceiling, so an "x of y" framing does not apply.';
export const NONLINEAR_NOTE = 'Ejection fraction is a DENOMINATOR, so the score is nonlinear in it: halving the ejection fraction DOUBLES the score. At age 70, an ejection fraction of 30 gives 2.33 and one of 60 gives 1.17. No additive score behaves this way.';
export const VERSION_NOTE = `The creatinine weight DOUBLES between the versions - ${ACEF_CREATININE_POINTS} point in the original, ${ACEF2_CREATININE_POINTS} in ACEF II - so a value cannot be carried between them.`;
export const OPERATOR_NOTE = `Some reproductions of the ORIGINAL print the creatinine criterion as "${CREATININE_THRESHOLD} mg/dL or more" and others as "above ${CREATININE_THRESHOLD}"; they differ only at exactly ${CREATININE_THRESHOLD}. ACEF II is consistently printed as ABOVE ${CREATININE_THRESHOLD}, and that operator is applied to both here so the versions stay comparable.`;
export const HCT_NOTE = `The hematocrit term in ACEF II is CONTINUOUS and ONE-SIDED: ${HCT_POINTS_PER_POINT_BELOW} for each percentage point below ${HCT_REFERENCE}, and NOTHING above it. It is not a threshold flag - a hematocrit of 26 adds 2.0, as much as the creatinine term - and there is no credit for being above ${HCT_REFERENCE}.`;
export const ELECTIVE_NOTE = `The original ACEF was derived in ELECTIVE cardiac surgery and has NO emergency term. ACEF II adds emergency surgery explicitly, worth ${ACEF2_EMERGENCY_POINTS}, the largest single add-on in either version. Applying the ORIGINAL score to an emergency case is outside the setting it was derived in.`;

const NOTE = `The ACEF score (Ranucci and colleagues 2009) estimates mortality risk before cardiac surgery as AGE DIVIDED BY EJECTION FRACTION, plus ${ACEF_CREATININE_POINTS} point if the serum creatinine is above ${CREATININE_THRESHOLD} mg/dL. ACEF II (2018) uses the same ratio plus ${ACEF2_CREATININE_POINTS} points for the same creatinine criterion, ${ACEF2_EMERGENCY_POINTS} points for emergency surgery, and ${HCT_POINTS_PER_POINT_BELOW} points for each percentage point of hematocrit below ${HCT_REFERENCE}. This is a ratio and not a sum of points, so there is no maximum score and no point ceiling. Ejection fraction is a denominator, so the score is nonlinear in it and halving the ejection fraction doubles the score, which no additive score does. The creatinine weight doubles between the versions, so a value cannot be carried between them. Some reproductions of the original print the creatinine criterion as at or above ${CREATININE_THRESHOLD} and others as above it, differing only at exactly ${CREATININE_THRESHOLD}; ACEF II is consistently above, and that operator is applied to both here. The hematocrit term is continuous and one-sided, adding nothing above ${HCT_REFERENCE} and as much as the creatinine term at a hematocrit of 26. The original was derived in ELECTIVE cardiac surgery and has no emergency term, while ACEF II adds emergency surgery as its largest single add-on, so applying the original to an emergency case is outside its derivation. These are group-level preoperative mortality estimates. They do not decide whether to operate, do not choose between surgery, percutaneous intervention and medical therapy, and do not select an operation. A high score is not a reason to decline surgery, since for many of these patients the untreated course is worse and these scores say nothing about it. They do not estimate stroke, renal failure, length of stay, or any outcome other than the mortality they were built for.`;

function readNum(v, name, { min = 0, max = Infinity } = {}) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n) || n <= min || n > max) {
    throw new Error(`${name} must be a number above ${min}${max === Infinity ? '' : ` and at most ${max}`}.`);
  }
  return n;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
const round2 = (n) => Number(n.toFixed(2));

// input: age (years), ejectionFraction (percent), creatinine (mg/dL), emergency (yes/no),
// hematocrit (percent).
export function acef(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let age, ef, creat, emergency, hct;
  try {
    age = readNum(o.age, 'Age');
    ef = readNum(o.ejectionFraction, 'Ejection fraction', { min: 0, max: 100 });
    creat = readNum(o.creatinine, 'Serum creatinine');
    hct = readNum(o.hematocrit, 'Hematocrit', { min: 0, max: 100 });
    emergency = readBool(o.emergency, 'Emergency surgery');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if ([age, ef, creat, hct].some((x) => x === null) || emergency === null) {
    return { valid: false, message: 'Enter the age, ejection fraction, serum creatinine and hematocrit, and say whether the surgery is an emergency. The ejection fraction is a DENOMINATOR here, not a point-scoring item.' };
  }

  const ratio = age / ef;
  const creatinineHigh = creat > CREATININE_THRESHOLD;
  const atOperatorBoundary = creat === CREATININE_THRESHOLD;
  const hctDeficit = Math.max(0, HCT_REFERENCE - hct);
  const hctPoints = round2(hctDeficit * HCT_POINTS_PER_POINT_BELOW);

  const acefScore = round2(ratio + (creatinineHigh ? ACEF_CREATININE_POINTS : 0));
  const acef2Score = round2(
    ratio
    + (creatinineHigh ? ACEF2_CREATININE_POINTS : 0)
    + (emergency ? ACEF2_EMERGENCY_POINTS : 0)
    + hctPoints,
  );

  const parts = [];
  parts.push(`ACEF ${acefScore}; ACEF II ${acef2Score}. The shared backbone is age ${age} divided by ejection fraction ${ef}, which is ${round2(ratio)}.`);
  parts.push(RATIO_NOTE);
  parts.push(NONLINEAR_NOTE);
  if (creatinineHigh) parts.push(`Creatinine ${creat} mg/dL is above ${CREATININE_THRESHOLD}, adding ${ACEF_CREATININE_POINTS} to ACEF and ${ACEF2_CREATININE_POINTS} to ACEF II. ${VERSION_NOTE}`);
  else parts.push(VERSION_NOTE);
  if (atOperatorBoundary) {
    parts.push(`THIS CREATININE IS EXACTLY ${CREATININE_THRESHOLD}, THE ONE VALUE AT WHICH PUBLISHED RENDERINGS DISAGREE. ${OPERATOR_NOTE} Under the "or more" rendering of the original this patient would score ${round2(acefScore + ACEF_CREATININE_POINTS)} on ACEF instead.`);
  }
  if (emergency) {
    parts.push(`Emergency surgery adds ${ACEF2_EMERGENCY_POINTS} to ACEF II, the largest single add-on in either version. THE ORIGINAL ACEF HAS NO EMERGENCY TERM AND WAS DERIVED IN ELECTIVE SURGERY, so the ACEF value above is outside the setting it was built for.`);
  }
  parts.push(hctPoints > 0
    ? `Hematocrit ${hct} is ${round2(hctDeficit)} below ${HCT_REFERENCE}, adding ${hctPoints} to ACEF II. ${HCT_NOTE}`
    : HCT_NOTE);
  parts.push('These are group-level preoperative mortality estimates. They do not decide whether to operate, do not choose between surgery, percutaneous intervention and medical therapy, and a high score is not a reason to decline surgery.');

  return {
    valid: true,
    acef: acefScore,
    acefII: acef2Score,
    ratio: round2(ratio),
    creatinineAboveThreshold: creatinineHigh,
    atCreatinineOperatorBoundary: atOperatorBoundary,
    hematocritPoints: hctPoints,
    emergency,
    acefOutsideDerivation: emergency,
    band: `ACEF ${acefScore}, ACEF II ${acef2Score}`,
    bandLabel: `ACEF ${acefScore} / ACEF II ${acef2Score}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
