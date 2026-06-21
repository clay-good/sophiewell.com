// spec-v136 (Wave 6 of the spec-v100 MDCalc Parity Completion program): the
// endocrine / metabolic index cluster that sits beside the existing eag-a1c
// (A1c <-> average-glucose) tile. Five deterministic instruments; none
// duplicates a live tile. Each consumes clinician-entered fasting labs or
// anthropometrics and returns an index value or a criteria verdict plus the
// source's framing -- not a browsable reference table (spec-v100 §2).
//
//   homaIr                - HOMA-IR insulin-resistance surrogate (+ linear HOMA-%B)
//   quicki                - QUICKI insulin-sensitivity index (log10 reciprocal)
//   tygIndex              - Triglyceride-Glucose (TyG) index (fasting-insulin-free)
//   metabolicSyndrome     - Metabolic syndrome (Harmonized any-3-of-5 / IDF central-obesity-required)
//   osteoporosisPrescreen - OST index + ORAI score DXA pre-screen
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v136.js render the spec-v50 §3 clinical-
// posture note. Each tile reports the index / verdict and the source's stated
// framing; the diagnosis and management decision (diagnose IR, start metformin,
// order DXA) stay with the clinician and local protocol (spec-v11 §5.3).
//
// FORMULAS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97 lesson), each
// cross-verified across >= 2 independent sources. NO-FABRICATION / SOURCE-GOV:
//   - homaIr (Matthews 1985, Diabetologia 28:412): HOMA-IR = (fasting insulin
//     uU/mL x fasting glucose) / 405 with glucose in mg/dL, or / 22.5 with
//     glucose in mmol/L (405 = 22.5 x 18). The linear HOMA-%B beta-cell estimate
//     = (20 x insulin) / (glucose_mmol/L - 3.5), %, computable only when
//     glucose_mmol/L > 3.5 (else the denominator is <= 0 -> reported N/A). No
//     universal diagnostic cut-point: higher HOMA-IR = greater insulin
//     resistance (spec-v136 §7). The proprietary HOMA2 nonlinear model is
//     excluded (spec-v100 §8); this is the free linear form.
//   - quicki (Katz 2000, J Clin Endocrinol Metab 85:2402): QUICKI =
//     1 / [log10(fasting insulin uU/mL) + log10(fasting glucose mg/dL)]. Lower
//     QUICKI = lower insulin sensitivity. Reference framing only (~0.45 healthy,
//     ~0.30-0.35 in type 2 diabetes); no diagnostic cut-point.
//   - tygIndex (Simental-Mendia 2008, Metab Syndr Relat Disord 6:299): TyG =
//     ln[(fasting TG mg/dL x fasting glucose mg/dL) / 2]. Higher = greater
//     insulin resistance; the fasting-insulin-free surrogate.
//   - metabolicSyndrome (Alberti 2009 Harmonized, Circulation 120:1640; IDF
//     2006): five criteria -- elevated waist (population/sex-specific cut-point);
//     TG >= 150 mg/dL (or on drug Rx); HDL < 40 (men) / < 50 (women) mg/dL (or on
//     Rx); BP SBP >= 130 and/or DBP >= 85 mmHg (or on antihypertensive); fasting
//     glucose >= 100 mg/dL (or on Rx). Harmonized = ANY 3 of 5 (waist not
//     mandatory); IDF = central obesity REQUIRED + any 2 of the other 4. Waist
//     cut-points: US/ATP III men 102 / women 88 cm; IDF Europid men 94 / women
//     80 cm; Asian men 90 / women 80 cm.
//   - osteoporosisPrescreen (Koh 2001 OST/OSTA, Osteoporos Int 12:699; Cadarette
//     2000 ORAI, CMAJ 162:1289): OST index = trunc((weight_kg - age_yr) x 0.2),
//     truncated TOWARD ZERO (Math.trunc, not floor -- the -3.6 -> -3 worked
//     example disambiguates). Caucasian referral cutoff: index < 2 -> increased
//     risk, consider DXA. Original OSTA tiers: low > -1, moderate -4..-1, high
//     < -4. ORAI point table: age 45-54 = 0, 55-64 = 5, 65-74 = 9, >= 75 = 15;
//     weight >= 70 = 0, 60-69 = 3, < 60 = 9 kg; not on estrogen = 2, on estrogen
//     = 0; total 0-26, score >= 9 -> select for BMD/DXA. The licensed FRAX is
//     excluded (spec-v100 §8); OST/ORAI is the free substitute.

const obj = (input) => (input && typeof input === 'object' ? input : {});
const num = (v) => {
  // Number(null) === 0 and Number('') === 0, so reject the empty cases up front:
  // a blank field must surface a fallback, never silently score 0.
  if (v === null || v === undefined || v === '' || typeof v === 'boolean') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};
const pos = (v) => {
  const n = num(v);
  return n !== null && n > 0 ? n : null;
};
const nonneg = (v) => {
  const n = num(v);
  return n !== null && n >= 0 ? n : null;
};
// a yes/no flag that must be explicitly answered: 'yes'/'no'/'1'/'0'/bool.
// Returns true, false, or null (blank -> surfaced fallback).
const flag = (v) => {
  if (v === true || v === 1 || v === '1' || v === 'yes') return true;
  if (v === false || v === 0 || v === '0' || v === 'no') return false;
  return null;
};
// an OPTIONAL yes/no modifier (the "or on drug treatment" overrides): blank
// reads as "no" rather than surfacing a fallback -- treatment status is an
// optional qualifier, not a required score input.
const optFlag = (v) => flag(v) === true;
const round = (n, dp) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

// --- 2.1 homa-ir --------------------------------------------------------------
const HOMAIR_NOTE = 'HOMA-IR -- Homeostatic Model Assessment of Insulin Resistance (Matthews DR, et al, Diabetologia 1985): HOMA-IR = (fasting insulin in uU/mL x fasting glucose) / 405 with glucose in mg/dL (or / 22.5 with glucose in mmol/L). The linear HOMA-%B beta-cell estimate = (20 x insulin) / (glucose mmol/L - 3.5), reported as a percent when glucose exceeds 3.5 mmol/L. Higher HOMA-IR indicates greater insulin resistance; there is no single universal diagnostic cut-point, so the value is reported with the source framing. The proprietary nonlinear HOMA2 model is a separate tool. It frames insulin resistance; the diagnosis stays with the clinician.';

export function homaIr(input = {}) {
  const o = obj(input);
  const insulin = pos(o.insulin);
  const glucose = pos(o.glucose);
  const unit = o.unit === 'mmol' ? 'mmol' : 'mgdl';
  if (insulin === null || glucose === null) {
    return { valid: false, message: 'Enter fasting insulin (uU/mL, > 0) and fasting glucose (> 0).' };
  }
  const glucoseMmol = unit === 'mmol' ? glucose : glucose / 18;
  const homaIrValue = unit === 'mmol'
    ? (insulin * glucose) / 22.5
    : (insulin * glucose) / 405;
  if (!Number.isFinite(homaIrValue)) {
    return { valid: false, message: 'Enter fasting insulin and fasting glucose as positive numbers.' };
  }
  // Linear HOMA-%B is only defined when glucose (mmol/L) > 3.5.
  let homaB = null;
  if (glucoseMmol > 3.5) {
    const b = (20 * insulin) / (glucoseMmol - 3.5);
    if (Number.isFinite(b)) homaB = round(b, 1);
  }
  const value = round(homaIrValue, 2);
  const bPart = homaB !== null
    ? ` Linear HOMA-%B beta-cell estimate ~${homaB}%.`
    : ' Linear HOMA-%B is not defined at this glucose (requires glucose > 3.5 mmol/L).';
  return {
    valid: true,
    value,
    homaB,
    abnormal: value >= 2.9,
    band: `HOMA-IR ${value} (insulin ${insulin} uU/mL, glucose ${unit === 'mmol' ? glucose + ' mmol/L' : glucose + ' mg/dL'}). Higher values indicate greater insulin resistance; there is no universal diagnostic cut-point.${bPart}`,
    note: HOMAIR_NOTE,
  };
}

// --- 2.2 quicki ---------------------------------------------------------------
const QUICKI_NOTE = 'QUICKI -- Quantitative Insulin Sensitivity Check Index (Katz A, et al, J Clin Endocrinol Metab 2000): QUICKI = 1 / [log10(fasting insulin in uU/mL) + log10(fasting glucose in mg/dL)]. Lower QUICKI indicates lower insulin sensitivity (greater resistance); values run roughly ~0.45 in healthy adults down to ~0.30-0.35 in type 2 diabetes. There is no single universal diagnostic cut-point, so the value is reported with the source framing. It frames insulin sensitivity; the diagnosis stays with the clinician.';

export function quicki(input = {}) {
  const o = obj(input);
  const insulin = pos(o.insulin);
  const glucose = pos(o.glucose);
  if (insulin === null || glucose === null) {
    return { valid: false, message: 'Enter fasting insulin (uU/mL, > 0) and fasting glucose (mg/dL, > 0).' };
  }
  const denom = Math.log10(insulin) + Math.log10(glucose);
  const q = 1 / denom;
  if (!Number.isFinite(q)) {
    // denom === 0 (insulin x glucose === 1) -> reciprocal is +/-Infinity.
    return { valid: false, message: 'QUICKI is undefined when log10(insulin) + log10(glucose) equals zero; check the entered values.' };
  }
  const value = round(q, 4);
  return {
    valid: true,
    value,
    abnormal: value < 0.339,
    band: `QUICKI ${value} (insulin ${insulin} uU/mL, glucose ${glucose} mg/dL). Lower values indicate lower insulin sensitivity; reference range ~0.45 (healthy) to ~0.30-0.35 (type 2 diabetes), no universal diagnostic cut-point.`,
    note: QUICKI_NOTE,
  };
}

// --- 2.3 tyg-index ------------------------------------------------------------
const TYG_NOTE = 'TyG -- Triglyceride-Glucose index (Simental-Mendia LE, et al, Metab Syndr Relat Disord 2008): TyG = ln[(fasting triglycerides x fasting glucose) / 2], both in mg/dL. The fasting-insulin-free insulin-resistance surrogate; higher values indicate greater insulin resistance. There is no single universal diagnostic cut-point, so the value is reported with the source framing. It frames insulin resistance; the diagnosis stays with the clinician.';

export function tygIndex(input = {}) {
  const o = obj(input);
  const tg = pos(o.tg);
  const glucose = pos(o.glucose);
  if (tg === null || glucose === null) {
    return { valid: false, message: 'Enter fasting triglycerides (mg/dL, > 0) and fasting glucose (mg/dL, > 0).' };
  }
  const tyg = Math.log((tg * glucose) / 2);
  if (!Number.isFinite(tyg)) {
    return { valid: false, message: 'Enter fasting triglycerides and fasting glucose as positive numbers.' };
  }
  const value = round(tyg, 2);
  return {
    valid: true,
    value,
    abnormal: value >= 8.7,
    band: `TyG index ${value} (triglycerides ${tg} mg/dL, glucose ${glucose} mg/dL). Higher values indicate greater insulin resistance; no universal diagnostic cut-point.`,
    note: TYG_NOTE,
  };
}

// --- 2.4 metabolic-syndrome ---------------------------------------------------
const MS_NOTE = 'Metabolic syndrome (Harmonized joint interim statement, Alberti KGMM, et al, Circulation 2009; and the IDF 2006 definition): five criteria -- elevated waist circumference (population- and sex-specific cut-point), triglycerides >= 150 mg/dL (or on drug treatment), reduced HDL (< 40 mg/dL men, < 50 mg/dL women, or on treatment), blood pressure SBP >= 130 and/or DBP >= 85 mmHg (or on antihypertensive treatment), and fasting glucose >= 100 mg/dL (or on treatment). The Harmonized definition diagnoses metabolic syndrome when ANY 3 of the 5 are met (waist is not mandatory); the IDF definition requires central obesity (elevated waist) PLUS any 2 of the other 4. It reports which criteria were met under the chosen definition; the diagnosis stays with the clinician.';
// Waist cut-points (cm) by standard, [men, women].
const WAIST_CUT = {
  us: [102, 88],       // AHA/NHLBI (ATP III) -- US / Europid
  europid: [94, 80],   // IDF Europid
  asian: [90, 80],     // WHO/IDF Asian
};

export function metabolicSyndrome(input = {}) {
  const o = obj(input);
  const definition = o.definition === 'idf' ? 'idf' : (o.definition === 'harmonized' ? 'harmonized' : null);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  const waistStandard = WAIST_CUT[o.waistStandard] ? o.waistStandard : null;
  const waist = pos(o.waist);
  const tg = pos(o.tg);
  const hdl = pos(o.hdl);
  const sbp = pos(o.sbp);
  const dbp = pos(o.dbp);
  const glucose = pos(o.glucose);
  if (definition === null || sex === null || waistStandard === null
    || waist === null || tg === null || hdl === null || sbp === null || dbp === null || glucose === null) {
    return { valid: false, message: 'Choose the definition (Harmonized / IDF), sex, and waist standard, and enter waist (cm), triglycerides, HDL, systolic and diastolic BP, and fasting glucose.' };
  }
  const tgTreated = optFlag(o.tgTreated);
  const hdlTreated = optFlag(o.hdlTreated);
  const bpTreated = optFlag(o.bpTreated);
  const glucoseTreated = optFlag(o.glucoseTreated);
  const waistCut = WAIST_CUT[waistStandard][sex === 'male' ? 0 : 1];
  const hdlCut = sex === 'male' ? 40 : 50;

  const waistMet = waist >= waistCut;
  const tgMet = tg >= 150 || tgTreated;
  const hdlMet = hdl < hdlCut || hdlTreated;
  const bpMet = sbp >= 130 || dbp >= 85 || bpTreated;
  const glucoseMet = glucose >= 100 || glucoseTreated;

  const labels = [];
  if (waistMet) labels.push(`waist >= ${waistCut} cm`);
  if (tgMet) labels.push(tgTreated && tg < 150 ? 'TG on treatment' : 'TG >= 150 mg/dL');
  if (hdlMet) labels.push(hdlTreated && hdl >= hdlCut ? 'HDL on treatment' : `HDL < ${hdlCut} mg/dL`);
  if (bpMet) labels.push(bpTreated && sbp < 130 && dbp < 85 ? 'BP on treatment' : 'BP >= 130/85 mmHg');
  if (glucoseMet) labels.push(glucoseTreated && glucose < 100 ? 'glucose on treatment' : 'glucose >= 100 mg/dL');

  const total = [waistMet, tgMet, hdlMet, bpMet, glucoseMet].filter(Boolean).length;
  const otherCount = [tgMet, hdlMet, bpMet, glucoseMet].filter(Boolean).length;

  let present;
  let rule;
  if (definition === 'idf') {
    present = waistMet && otherCount >= 2;
    rule = waistMet
      ? `IDF: central obesity present plus ${otherCount} of the other 4`
      : 'IDF: central obesity (required) absent';
  } else {
    present = total >= 3;
    rule = `Harmonized: ${total} of 5 criteria met`;
  }
  const metStr = labels.length ? ` Met: ${labels.join(', ')}.` : ' No criteria met.';
  return {
    valid: true,
    present,
    total,
    definition,
    abnormal: present,
    band: present
      ? `Metabolic syndrome PRESENT (${rule}).${metStr}`
      : `Metabolic syndrome NOT met (${rule}).${metStr}`,
    note: MS_NOTE,
  };
}

// --- 2.5 osteoporosis-prescreen -----------------------------------------------
const OST_NOTE = 'OST / ORAI osteoporosis DXA pre-screen (Koh LKH, et al, Osteoporos Int 2001 for OST/OSTA; Cadarette SM, et al, CMAJ 2000 for ORAI): two free indices that flag postmenopausal women who warrant bone densitometry. The OST index = (weight in kg - age in years) x 0.2, truncated toward zero; an index below 2 flags increased risk in Caucasian populations (the original OSTA tiers are low > -1, moderate -4 to -1, high < -4). ORAI sums age (45-54 = 0, 55-64 = 5, 65-74 = 9, >= 75 = 15), weight (>= 70 kg = 0, 60-69 = 3, < 60 = 9), and current estrogen use (no = 2, yes = 0); a score of 9 or more selects for DXA. The licensed FRAX is a separate tool. It frames who warrants testing; the decision to order DXA stays with the clinician.';

function ostaTier(index) {
  if (index > -1) return 'low (OSTA index > -1)';
  if (index < -4) return 'high (OSTA index < -4)';
  return 'moderate (OSTA index -4 to -1)';
}

export function osteoporosisPrescreen(input = {}) {
  const o = obj(input);
  const age = nonneg(o.age);
  const weight = pos(o.weight);
  const estrogen = flag(o.estrogen);
  if (age === null || age > 130 || weight === null || estrogen === null) {
    return { valid: false, message: 'Enter age (years) and weight (kg), and answer whether the patient is currently using estrogen.' };
  }
  // OST: truncate toward zero (Math.trunc), not floor -- e.g. -3.6 -> -3.
  const ost = Math.trunc((weight - age) * 0.2);
  const ostIncreasedRisk = ost < 2;
  // ORAI point table.
  let orai = 0;
  if (age >= 75) orai += 15;
  else if (age >= 65) orai += 9;
  else if (age >= 55) orai += 5;
  // age < 55 contributes 0 (45-54 band and below).
  if (weight < 60) orai += 9;
  else if (weight < 70) orai += 3;
  // weight >= 70 contributes 0.
  if (!estrogen) orai += 2;
  const oraiRefer = orai >= 9;
  return {
    valid: true,
    ost,
    orai,
    abnormal: ostIncreasedRisk || oraiRefer,
    band: `OST index ${ost} -- ${ostIncreasedRisk ? 'increased risk, consider DXA' : 'lower risk'} (Caucasian cutoff < 2; original OSTA tier: ${ostaTier(ost)}). ORAI ${orai} of 26 -- ${oraiRefer ? 'select for DXA (score >= 9)' : 'below the ORAI referral threshold'}.`,
    note: OST_NOTE,
  };
}
