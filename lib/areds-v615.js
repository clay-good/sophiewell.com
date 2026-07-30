// spec-v615: the AREDS simplified severity scale for age-related macular degeneration. A WHOLE-CONCEPT gap -
// `icdr-retinopathy`, `kwb-retinopathy`, `rop-stage` and `gass-macular-hole` all ship, and macular
// degeneration was entirely uncovered: "macular degeneration" and "drusen" were both zero-hit across app.js.
//
// **THE SCALE SCORES A PERSON, NOT AN EYE, BUT THE FEATURES ARE READ EYE BY EYE.** Each eye contributes one
// risk factor for large drusen and one for any pigment abnormality, so the total runs 0 to 4 across both
// eyes. Scoring a single eye and reporting 0 to 2 is a different instrument.
//
// **AN EYE THAT ALREADY HAS ADVANCED DISEASE IS ASSIGNED 2 RISK FACTORS OUTRIGHT.** Its own drusen and
// pigment are no longer counted - it has already converted - so the remaining factors come from the fellow,
// still-at-risk eye. The question the scale answers therefore changes shape: it becomes "will the OTHER eye
// convert".
//
// **INTERMEDIATE DRUSEN COUNT ONLY WHEN NO EYE HAS LARGE DRUSEN, AND ONLY WHEN THEY ARE BILATERAL.** That
// one conditional factor is easy to miss and easy to double-count: it is a single risk factor for the person,
// not one per eye, and it is silently unavailable the moment either eye has large drusen.
//
// **THE FIVE-YEAR RISK IS NOWHERE NEAR LINEAR.** It runs 0.5%, 3%, 12%, 25%, 50% - the first step multiplies
// risk about sixfold, and the last two roughly double it. A reader who treats the 0-to-4 count as evenly
// spaced severity will badly misread the bottom of the scale.
//
// **THE RISK IS FOR ADVANCED DISEASE IN AT LEAST ONE EYE, NOT IN A NOMINATED EYE.** And if BOTH eyes already
// have advanced disease there is no at-risk eye left, so the scale has nothing to predict; this lib returns
// the count with `atRiskEye` false and says so rather than reporting a risk.
//
// HIGH-STAKES: this estimates a GROUP-LEVEL five-year risk from an examination. It does NOT diagnose macular
// degeneration, does NOT grade the disease already present, does NOT decide antioxidant or zinc
// supplementation or any injection, and does NOT predict what will happen to one person (spec-v11 5.3).
//
// RULES AND RISKS RE-FETCHED AND DOUBLE-CONFIRMED, NEVER RECALLED (spec-v97). The per-eye assignment and all
// five risk figures matched across two independent sources; the two conditional rules are quoted from the
// derivation report itself:
//   - Ferris FL, Davis MD, Clemons TE, et al. A simplified severity scale for age-related macular
//     degeneration: AREDS Report No. 18. Arch Ophthalmol. 2005;123(11):1570-1574.

export const LARGE_DRUSEN_THRESHOLD = 'at or above 125 micrometres, about the width of a large vein at the disc margin';
export const ADVANCED_EYE_FACTORS = 2;

export const EYES = [
  { key: 'right', text: 'Right eye' },
  { key: 'left', text: 'Left eye' },
];

export const EYE_FEATURES = [
  { key: 'advanced', text: 'Advanced disease already present in this eye - neovascular disease or central geographic atrophy' },
  { key: 'largeDrusen', text: `One or more large drusen (${LARGE_DRUSEN_THRESHOLD})` },
  { key: 'pigment', text: 'Any pigment abnormality' },
];

export const RISKS = [
  { factors: 0, risk: 0.5 },
  { factors: 1, risk: 3 },
  { factors: 2, risk: 12 },
  { factors: 3, risk: 25 },
  { factors: 4, risk: 50 },
];

export const MAX_FACTORS = RISKS[RISKS.length - 1].factors;

export const PERSON_NOTE = `THE SCALE SCORES A PERSON, NOT AN EYE. Each eye contributes one risk factor for large drusen and one for any pigment abnormality, so the total runs 0 to ${MAX_FACTORS} across BOTH eyes. Scoring one eye and reporting 0 to 2 is a different instrument.`;
export const ADVANCED_NOTE = `AN EYE THAT ALREADY HAS ADVANCED DISEASE IS ASSIGNED ${ADVANCED_EYE_FACTORS} RISK FACTORS OUTRIGHT, and its own drusen and pigment are no longer counted - it has already converted. The remaining factors come from the fellow, still-at-risk eye, so the question becomes whether the OTHER eye converts.`;
export const INTERMEDIATE_NOTE = 'INTERMEDIATE DRUSEN COUNT ONLY WHEN NEITHER EYE HAS LARGE DRUSEN, AND ONLY WHEN THEY ARE BILATERAL. It is ONE risk factor for the person, not one per eye, and it becomes unavailable the moment either eye has large drusen.';
export const NONLINEAR_NOTE = `THE FIVE-YEAR RISK IS NOWHERE NEAR LINEAR: ${RISKS.map((r) => `${r.factors} factors ${r.risk}%`).join(', ')}. The first step multiplies risk about sixfold and the last two roughly double it, so treating the count as evenly spaced severity badly misreads the bottom of the scale.`;
export const INTERMEDIATE_SCOPE_NOTE = 'The intermediate-drusen rule is about DRUSEN GRADING, so it requires at least one eye that is still gradable. Applied literally to two already-advanced eyes the published rules would total 5, outside the published 0 to 4 scale - a state in which the scale has nothing to predict anyway - so the factor is not added there, and this is disclosed rather than silently clamped.';
export const AT_LEAST_ONE_NOTE = 'THE RISK IS FOR ADVANCED DISEASE IN AT LEAST ONE EYE, not in a nominated eye. If BOTH eyes already have advanced disease there is no at-risk eye left and the scale has nothing to predict.';

const NOTE = `The AREDS simplified severity scale (Ferris and colleagues 2005, AREDS Report No. 18) counts risk factors across both eyes and reads off an approximate five-year risk of advanced age-related macular degeneration. ${PERSON_NOTE} ${ADVANCED_NOTE} ${INTERMEDIATE_NOTE} ${INTERMEDIATE_SCOPE_NOTE} ${NONLINEAR_NOTE} ${AT_LEAST_ONE_NOTE} This estimates a group-level risk from an examination. It does not diagnose macular degeneration, does not grade disease already present, does not decide antioxidant or zinc supplementation or any injection, and does not predict what will happen to one person.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

export function riskForFactors(factors) {
  const row = RISKS.find((r) => r.factors === factors);
  return row ? row.risk : null;
}

// input: rightAdvanced, rightLargeDrusen, rightPigment, leftAdvanced, leftLargeDrusen, leftPigment,
// bilateralIntermediateDrusen - all yes/no.
export function aredsSimplified(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const answers = {};
  const keyFor = (eye, feature) => `${eye}${feature[0].toUpperCase()}${feature.slice(1)}`;
  try {
    for (const eye of EYES) {
      for (const f of EYE_FEATURES) {
        const k = keyFor(eye.key, f.key);
        answers[k] = readBool(o[k], `${eye.text}: ${f.text}`);
      }
    }
    answers.bilateralIntermediateDrusen = readBool(o.bilateralIntermediateDrusen, 'Bilateral intermediate drusen');
  } catch (err) {
    return { valid: false, message: err.message };
  }
  if (Object.values(answers).some((v) => v === null)) {
    return { valid: false, message: `Answer all ${EYES.length * EYE_FEATURES.length + 1} items - three per eye plus the bilateral intermediate-drusen question. ${PERSON_NOTE}` };
  }

  const perEye = EYES.map((eye) => {
    const advanced = answers[keyFor(eye.key, 'advanced')];
    const largeDrusen = answers[keyFor(eye.key, 'largeDrusen')];
    const pigment = answers[keyFor(eye.key, 'pigment')];
    const factors = advanced ? ADVANCED_EYE_FACTORS : (largeDrusen ? 1 : 0) + (pigment ? 1 : 0);
    return { eye: eye.key, text: eye.text, advanced, largeDrusen, pigment, factors };
  });

  const anyLargeDrusen = perEye.some((e) => !e.advanced && e.largeDrusen);
  // The intermediate-drusen rule is about DRUSEN GRADING, and an eye that has already converted is not
  // graded. So it requires at least one still-gradable eye. Applied literally to two advanced eyes the
  // published rules would total 5, outside the published 0 to 4 scale - a state in which the scale has
  // nothing to predict anyway. See INTERMEDIATE_SCOPE_NOTE.
  const anyGradableEye = perEye.some((e) => !e.advanced);
  const intermediateApplies = anyGradableEye && !anyLargeDrusen && answers.bilateralIntermediateDrusen;
  const intermediateFactor = intermediateApplies ? 1 : 0;
  const factors = perEye.reduce((a, e) => a + e.factors, 0) + intermediateFactor;
  const bothAdvanced = perEye.every((e) => e.advanced);
  const atRiskEye = !bothAdvanced;
  const risk = atRiskEye ? riskForFactors(factors) : null;

  const parts = [];
  if (!atRiskEye) {
    parts.push(`${factors} risk factors of ${MAX_FACTORS}. NO RISK IS REPORTED: both eyes already have advanced disease, so there is no at-risk eye and the scale has nothing to predict.`);
  } else if (risk === null) {
    parts.push(`${factors} risk factors, which is outside the published 0 to ${MAX_FACTORS} scale, so no risk is reported.`);
  } else {
    parts.push(`${factors} risk factors of ${MAX_FACTORS}. Approximate five-year risk of advanced disease in at least one eye: ${risk}%.`);
  }
  parts.push(`Per eye: ${perEye.map((e) => `${e.text} ${e.factors}${e.advanced ? ' (advanced disease already present, so its own drusen and pigment are not counted)' : ''}`).join('; ')}.`);
  if (intermediateApplies) {
    parts.push(`Bilateral intermediate drusen added 1 factor, because neither eye has large drusen. ${INTERMEDIATE_NOTE}`);
  } else if (answers.bilateralIntermediateDrusen && anyLargeDrusen) {
    parts.push(`Bilateral intermediate drusen were NOT counted, because an eye has large drusen. ${INTERMEDIATE_NOTE}`);
  } else if (answers.bilateralIntermediateDrusen && !anyGradableEye) {
    parts.push(`Bilateral intermediate drusen were NOT counted, because neither eye is still gradable. ${INTERMEDIATE_SCOPE_NOTE}`);
  } else {
    parts.push(INTERMEDIATE_NOTE);
  }
  parts.push(PERSON_NOTE);
  parts.push(ADVANCED_NOTE);
  parts.push(NONLINEAR_NOTE);
  parts.push(AT_LEAST_ONE_NOTE);
  parts.push('This estimates a group-level five-year risk from an examination. It does not diagnose macular degeneration, does not grade disease already present, does not decide antioxidant or zinc supplementation or any injection, and does not predict what will happen to one person.');

  return {
    valid: true,
    factors,
    maxFactors: MAX_FACTORS,
    perEye,
    intermediateApplies,
    intermediateSuppressed: answers.bilateralIntermediateDrusen && !intermediateApplies,
    intermediateSuppressedReason: !answers.bilateralIntermediateDrusen || intermediateApplies
      ? null : (anyLargeDrusen ? 'an eye has large drusen' : 'neither eye is still gradable'),
    bothAdvanced,
    atRiskEye,
    fiveYearRiskPercent: risk,
    band: risk === null ? 'No risk reported' : `${factors} of ${MAX_FACTORS}`,
    bandLabel: risk === null
      ? `${factors} risk factors of ${MAX_FACTORS} — no risk reported`
      : `${factors} risk factors of ${MAX_FACTORS} — about ${risk}% at five years`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
