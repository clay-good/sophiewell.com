// spec-v89 (fourth and final feature spec of the spec-v85 Advanced Clinical
// Calculators program): four deterministic subspecialty calculators that open
// the missing rheumatology surface and complete the hepatology/perioperative
// cluster.
//
//   das28          - DAS28-ESR / DAS28-CRP rheumatoid-arthritis disease activity
//   kingsCollege   - King's College Criteria (acetaminophen-induced ALF)
//   asaPs          - ASA Physical Status classification (I-VI + E modifier)
//   surgicalApgar  - Surgical Apgar Score (intraoperative 0-10 outcome predictor)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v15.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz
// harness can drive each field through its adversarial matrix. The DAS28
// transcendental terms (√TJC, √SJC, ln(ESR), ln(CRP+1)) are domain-guarded so
// no non-finite value reaches a returned string (spec-v59): counts are clamped
// 0-28 (never negative under the root) and the logarithm requires ESR > 0 /
// CRP ≥ 0. r1/r2 come from lib/num.js (spec-v53 §4.1). None authors a
// management order in Sophie's voice (spec-v11 §5.3) - each surfaces the
// computation and the cited source's own band / class / definition.

import { r1, r2 } from './num.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a value we can take a logarithm of).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };
// Clamp a finite value into [lo, hi]; null stays null.
const clamp = (v, lo, hi) => (v == null ? null : Math.min(hi, Math.max(lo, v)));

// --- 2.1 das28 - DAS28-ESR / DAS28-CRP disease activity ----------------------
// DAS28 is the standard rheumatoid-arthritis disease-activity measure. The ESR
// and CRP forms are NOT interchangeable (the CRP form runs ~0.6 lower at the
// same activity), so the output labels which was computed. EULAR bands
// (remission < 2.6, low ≤ 3.2, moderate ≤ 5.1, high > 5.1) drive treat-to-
// target decisions; the cutoffs are revisable (docs/citation-staleness.md).
//   DAS28-ESR = 0.56·√TJC28 + 0.28·√SJC28 + 0.70·ln(ESR)     + 0.014·GH
//   DAS28-CRP = 0.56·√TJC28 + 0.28·√SJC28 + 0.36·ln(CRP+1)   + 0.014·GH + 0.96
export function das28({
  tjc28, sjc28, form = 'esr', esr, crp, globalHealth,
} = {}) {
  // Joint counts clamp to the 28-joint range; a blank count is "not provided".
  const tjc = clamp(fin(tjc28), 0, 28);
  const sjc = clamp(fin(sjc28), 0, 28);
  const gh = fin(globalHealth);
  const useCrp = form === 'crp';
  // The inflammatory marker is form-specific: ESR must be > 0 for ln(ESR);
  // CRP ≥ 0 for ln(CRP+1) (always defined). A blank marker or VAS is a
  // complete-the-fields fallback, never a NaN.
  const esrV = pos(esr);
  const crpV = fin(crp) != null && fin(crp) >= 0 ? fin(crp) : null;
  const markerMissing = useCrp ? crpV == null : esrV == null;
  if (tjc == null || sjc == null || gh == null || markerMissing) {
    return {
      valid: false,
      band: useCrp
        ? 'Enter the tender (0–28) and swollen (0–28) joint counts, CRP (mg/L), and the patient global VAS (0–100).'
        : 'Enter the tender (0–28) and swollen (0–28) joint counts, ESR (mm/hr, > 0), and the patient global VAS (0–100).',
      note: 'DAS28 needs all four components: the 28-joint tender count, the 28-joint swollen count, the inflammatory marker for the selected form, and the patient global health VAS.',
    };
  }
  const ghC = clamp(gh, 0, 100);
  const jointTerm = 0.56 * Math.sqrt(tjc) + 0.28 * Math.sqrt(sjc);
  const markerTerm = useCrp ? 0.36 * Math.log(crpV + 1) : 0.70 * Math.log(esrV);
  const constTerm = useCrp ? 0.96 : 0;
  const score = jointTerm + markerTerm + 0.014 * ghC + constTerm;

  // EULAR disease-activity band on the (unrounded) score.
  let activity;
  if (score < 2.6) activity = 'remission';
  else if (score <= 3.2) activity = 'low';
  else if (score <= 5.1) activity = 'moderate';
  else activity = 'high';
  const activityLabel = {
    remission: 'remission (< 2.6)',
    low: 'low disease activity (2.6–3.2)',
    moderate: 'moderate disease activity (3.2–5.1)',
    high: 'high disease activity (> 5.1)',
  }[activity];

  const formLabel = useCrp ? 'DAS28-CRP' : 'DAS28-ESR';
  return {
    valid: true,
    form: useCrp ? 'crp' : 'esr',
    formLabel,
    score: r2(score),
    activity,
    band: `${formLabel} ${r2(score)}: ${activityLabel} (EULAR).`,
    note: `${formLabel} = 0.56·√TJC28 + 0.28·√SJC28 + ${useCrp ? '0.36·ln(CRP+1) + 0.014·GH + 0.96' : '0.70·ln(ESR) + 0.014·GH'}. The ESR and CRP forms are not interchangeable; the band shown is for ${formLabel}. EULAR cutoffs: remission < 2.6, low ≤ 3.2, moderate ≤ 5.1, high > 5.1. The treat-to-target escalation stays with the clinician.`,
  };
}

// --- 2.2 kingsCollege - King's College Criteria (acetaminophen ALF) ----------
// The validated rule for WHEN to refer for transplant in acetaminophen-induced
// acute liver failure. Poor prognosis when EITHER arterial pH < 7.30 after
// fluid resuscitation, OR all three of INR > 6.5 (PT > 100 s), creatinine
// > 3.4 mg/dL (> 300 µmol/L), and grade III/IV encephalopathy. The modified
// (Bernal) criterion adds arterial lactate > 3.5 mmol/L early / > 3.0 after
// resuscitation. This is the ACETAMINOPHEN pathway; the non-acetaminophen
// criteria differ and are out of scope (spec-v89 §6). A partial three-part
// limb is reported "incomplete," never a false negative.
export function kingsCollege({
  ph, lactate, lactateTiming = 'resuscitated',
  inr, pt, creatinine, creatinineUnit = 'mg/dl', encephalopathy = 'no',
} = {}) {
  const phV = pos(ph);
  const lac = fin(lactate);
  const inrV = pos(inr);
  const ptV = pos(pt);
  const cr = pos(creatinine); // kept in the entered unit; threshold is unit-aware below
  const enceph34 = encephalopathy === 'yes';

  // Nothing entered at all -> complete-the-fields fallback.
  if (phV == null && lac == null && inrV == null && ptV == null && cr == null && encephalopathy === 'no') {
    return {
      valid: false,
      band: 'Enter the arterial pH, INR/PT, creatinine, encephalopathy grade, and/or arterial lactate to apply the criteria.',
      note: 'The King’s College Criteria (acetaminophen pathway) read the arterial pH limb, the three-part coagulopathy/renal/encephalopathy limb, and the modified lactate limb.',
    };
  }

  // pH limb.
  const phLimb = phV != null ? phV < 7.30 : null;

  // Three-part limb. Coagulopathy is met by INR > 6.5 OR PT > 100 s.
  const coag = inrV != null ? inrV > 6.5 : (ptV != null ? ptV > 100 : null);
  const creatHigh = cr == null ? null
    : (creatinineUnit === 'umol/l' ? cr > 300 : cr > 3.4);
  // The three-part limb needs the coagulopathy AND the renal component present
  // (encephalopathy comes from a select and is always known). A missing one
  // makes the limb "incomplete" rather than a (false) negative.
  const threePartComplete = coag != null && creatHigh != null;
  const threePartMet = threePartComplete && coag && creatHigh && enceph34;

  // Modified (Bernal) lactate limb.
  const lactateThreshold = lactateTiming === 'early' ? 3.5 : 3.0;
  const lactateLimb = lac != null ? lac > lactateThreshold : null;

  const meets = phLimb === true || threePartMet === true || lactateLimb === true;

  const limbsMet = [];
  if (phLimb === true) limbsMet.push('arterial pH < 7.30 (after resuscitation)');
  if (threePartMet === true) limbsMet.push('the three-part limb (INR > 6.5 + creatinine > 3.4 mg/dL + grade III/IV encephalopathy)');
  if (lactateLimb === true) limbsMet.push(`the modified lactate limb (arterial lactate > ${lactateThreshold} mmol/L)`);

  let band;
  if (meets) {
    band = `Meets King’s College Criteria (acetaminophen pathway): poor prognosis — refer/list for transplant. Limb(s) met: ${limbsMet.join('; ')}.`;
  } else if (threePartComplete === false && (inrV != null || ptV != null || cr != null)) {
    band = 'Criteria not met by the entered limbs; the three-part limb is incomplete (enter INR/PT and creatinine to evaluate it).';
  } else {
    band = 'Does not meet King’s College Criteria by the entered values (acetaminophen pathway).';
  }

  return {
    valid: true,
    meets,
    phLimb,
    coag,
    creatHigh,
    enceph: enceph34,
    threePartComplete,
    threePartMet,
    lactateLimb,
    band,
    note: 'Acetaminophen pathway. Meets when EITHER arterial pH < 7.30 after adequate fluid resuscitation, OR all of INR > 6.5 (PT > 100 s) + creatinine > 3.4 mg/dL (> 300 µmol/L) + grade III/IV encephalopathy. Bernal modification: arterial lactate > 3.5 mmol/L early (or > 3.0 after resuscitation) predicts poor prognosis. The non-acetaminophen criteria differ and are not modeled here. The transplant referral and listing decision stay with the hepatology/transplant team.',
  };
}

// --- 2.3 asaPs - ASA Physical Status classification --------------------------
// The single most-documented preoperative descriptor. The compute is the
// descriptor->class mapping plus the E-modifier application (E is not
// assignable to class I or VI; the tile enforces that). ASA-PS describes
// preoperative physical status and is not, by itself, a predictor of operative
// risk. The published example conditions are 2020 ASA definitions (revisable;
// docs/citation-staleness.md).
const ASA_DEFS = {
  1: {
    label: 'ASA I',
    definition: 'A normal healthy patient.',
    examples: 'Healthy, non-smoking, no or minimal alcohol use.',
  },
  2: {
    label: 'ASA II',
    definition: 'A patient with mild systemic disease.',
    examples: 'Mild disease only without substantive functional limitations: current smoker, social alcohol drinker, pregnancy, obesity (30 < BMI < 40), well-controlled diabetes or hypertension, mild lung disease.',
  },
  3: {
    label: 'ASA III',
    definition: 'A patient with severe systemic disease.',
    examples: 'Substantive functional limitations from one or more diseases: poorly controlled diabetes or hypertension, COPD, morbid obesity (BMI ≥ 40), active hepatitis, alcohol dependence, implanted pacemaker, moderate reduction of ejection fraction, ESRD on regular dialysis, history (> 3 months) of MI, CVA, TIA, or CAD/stents.',
  },
  4: {
    label: 'ASA IV',
    definition: 'A patient with severe systemic disease that is a constant threat to life.',
    examples: 'Recent (< 3 months) MI, CVA, TIA, or CAD/stents; ongoing cardiac ischemia or severe valve dysfunction; severe reduction of ejection fraction; sepsis; DIC; ARD; or ESRD not undergoing regularly scheduled dialysis.',
  },
  5: {
    label: 'ASA V',
    definition: 'A moribund patient who is not expected to survive without the operation.',
    examples: 'Ruptured abdominal/thoracic aneurysm, massive trauma, intracranial bleed with mass effect, ischemic bowel in the face of significant cardiac pathology, or multiple organ/system dysfunction.',
  },
  6: {
    label: 'ASA VI',
    definition: 'A declared brain-dead patient whose organs are being removed for donor purposes.',
    examples: 'Declared brain-dead organ donor.',
  },
};
export function asaPs({ asaClass, emergency = false } = {}) {
  const n = fin(asaClass);
  const cls = n != null && Number.isInteger(n) && n >= 1 && n <= 6 ? n : null;
  if (cls == null) {
    return {
      valid: false,
      band: 'Select the ASA Physical Status class (I–VI).',
      note: 'Choose the descriptor (I–VI) that best fits the patient’s preoperative physical status.',
    };
  }
  const def = ASA_DEFS[cls];
  const emerg = emergency === true || emergency === 'yes' || emergency === 'on';
  // The E modifier is not assignable to class I (normal healthy) or VI (organ
  // donor); the tile enforces that and surfaces a note when it is suppressed.
  const eApplicable = cls !== 1 && cls !== 6;
  const eApplied = emerg && eApplicable;
  const eSuppressed = emerg && !eApplicable;
  const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'][cls];
  const display = eApplied ? `ASA ${roman}-E` : `ASA ${roman}`;
  return {
    valid: true,
    asaClass: cls,
    display,
    eApplied,
    eSuppressed,
    definition: def.definition,
    examples: def.examples,
    band: `${display} — ${def.definition}`,
    note: `ASA Physical Status describes preoperative physical status; it is not, by itself, a predictor of operative risk. The E modifier denotes an emergency (a delay in treatment would lead to a significant increase in the threat to life or body part) and is not assignable to ASA I or VI.${eSuppressed ? ' The emergency modifier was not applied because it is invalid for the selected class.' : ''}`,
  };
}

// --- 2.4 surgicalApgar - Surgical Apgar Score --------------------------------
// A 10-point intraoperative outcome predictor (Gawande 2007) from estimated
// blood loss and the lowest intraoperative MAP and heart rate. Distinct from
// the neonatal `apgar` tile (same name lineage, different instrument). Each
// input clamps to its band edges; the sum is bounded 0-10. ≤ 4 flags high
// major-complication/death risk.
export function surgicalApgar({ ebl, lowestMap, lowestHr } = {}) {
  const eblV = fin(ebl);
  const mapV = fin(lowestMap);
  const hrV = fin(lowestHr);
  if (eblV == null && mapV == null && hrV == null) {
    return {
      valid: false,
      band: 'Enter the estimated blood loss, the lowest MAP, and the lowest heart rate.',
      note: 'The Surgical Apgar Score sums three intraoperative point bands: estimated blood loss, lowest mean arterial pressure, and lowest heart rate.',
    };
  }
  // Estimated blood loss (mL): ≤100=3; 101-600=2; 601-1000=1; >1000=0.
  const eblPts = eblV == null ? null
    : (eblV <= 100 ? 3 : (eblV <= 600 ? 2 : (eblV <= 1000 ? 1 : 0)));
  // Lowest MAP (mmHg): ≥70=3; 55-69=2; 40-54=1; <40=0.
  const mapPts = mapV == null ? null
    : (mapV >= 70 ? 3 : (mapV >= 55 ? 2 : (mapV >= 40 ? 1 : 0)));
  // Lowest heart rate (bpm): ≤55=4; 56-65=3; 66-75=2; 76-85=1; >85=0.
  const hrPts = hrV == null ? null
    : (hrV <= 55 ? 4 : (hrV <= 65 ? 3 : (hrV <= 75 ? 2 : (hrV <= 85 ? 1 : 0))));

  const complete = eblPts != null && mapPts != null && hrPts != null;
  const score = (eblPts || 0) + (mapPts || 0) + (hrPts || 0);

  // Risk band on the complete score (Gawande/Regenbogen gradient).
  let risk = null;
  if (complete) {
    if (score <= 4) risk = 'high';
    else if (score <= 6) risk = 'intermediate';
    else if (score <= 8) risk = 'low-intermediate';
    else risk = 'low';
  }
  const riskText = {
    high: 'high risk of major complication or death (≤ 4)',
    intermediate: 'intermediate risk (5–6)',
    'low-intermediate': 'low-to-intermediate risk (7–8)',
    low: 'low risk (9–10)',
  };

  let band;
  if (!complete) {
    band = `Partial score ${score} of 10 so far (enter all three inputs for the risk band).`;
  } else {
    band = `Surgical Apgar Score ${score} of 10: ${riskText[risk]}.`;
  }

  return {
    valid: true,
    complete,
    score,
    eblPts,
    mapPts,
    hrPts,
    risk,
    band,
    note: 'Surgical Apgar = blood-loss points (≤100 mL=3, 101–600=2, 601–1000=1, >1000=0) + lowest-MAP points (≥70=3, 55–69=2, 40–54=1, <40=0) + lowest-HR points (≤55=4, 56–65=3, 66–75=2, 76–85=1, >85=0). Lower scores carry a higher major-complication/death risk (≈4% at 9–10 rising to ≈14–58% at ≤4). This is the surgical score, distinct from the neonatal Apgar. Disposition stays with the operative and critical-care teams.',
  };
}
