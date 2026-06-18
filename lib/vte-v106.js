// spec-v106 (first spec of Wave 2 of the spec-v100 MDCalc Parity Completion
// program): six deterministic venous-thromboembolism workup instruments that
// fill confirmed gaps in the VTE pathway. None duplicates a live tile.
//
//   peged           - PEGeD graduated D-dimer rule (C-PTP tier x D-dimer threshold)
//   fourPeps        - 4-Level Pulmonary Embolism Clinical Probability Score
//   bovaPe          - Bova Score (30-day complications in normotensive PE)
//   hestia          - Hestia criteria for outpatient PE treatment (any-positive gate)
//   genevaOriginal  - original (Wicki 2001) Geneva pretest probability score
//   constansUedvt   - Constans score for upper-extremity DVT (signed total)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v31.js wire these to the home grid.
//
// COEFFICIENTS / TABLES RE-FETCHED, NEVER RECALLED (spec-v97 lesson; spec-v106 §3),
// each cross-verified across >= 2 independent sources (original paper + MDCalc /
// clinical reference):
//   - 4PEPS item points (Roy PM, et al, JAMA Cardiol 2021): age < 50 -2, age
//     50-64 -1, age >= 65 0; chronic respiratory disease -1; HR < 80 -1; chest
//     pain + acute dyspnea +1; male sex +2; estrogen therapy +2; prior VTE +2;
//     syncope +2; immobility/surgery within 4 weeks +2; SpO2 < 95% +3; calf pain
//     and/or unilateral lower-limb edema +3; PE the most likely diagnosis +5.
//     Total -5..+21. Tiers: < 0 very low (no test), 0-5 low (D-dimer < 1000),
//     6-12 moderate (age-adjusted D-dimer), >= 13 high (direct imaging).
//   - PEGeD (Kearon C, et al, NEJM 2019): Wells 3-tier C-PTP; low C-PTP excluded
//     if D-dimer < 1000 ng/mL FEU, moderate excluded if < 500, high always images.
//   - Bova (Bova C, et al, Eur Respir J 2014): sBP 90-100 mmHg +2, troponin +2,
//     RV dysfunction +2, HR >= 110 +1. Total 0-7. Stage I 0-2, II 3-4, III > 4.
//   - Hestia (Zondag W, et al, J Thromb Haemost 2011): 11 yes/no items; any
//     positive excludes outpatient management.
//   - original Geneva (Wicki J, et al, Arch Intern Med 2001): age 60-79 +1 / >= 80
//     +2; prior VTE +2; surgery within 4 weeks +3; HR > 100 +1; PaCO2 < 36 mmHg
//     (< 4.8 kPa) +2 / 36-38.9 (4.8-5.19 kPa) +1; PaO2 < 48.7 mmHg (< 6.5 kPa) +4 /
//     48.7-59.9 (6.5-7.99) +3 / 60-71.1 (8-9.49) +2 / 71.2-82.4 (9.5-10.99) +1;
//     band atelectasis +1; elevated hemidiaphragm +1. Total 0-16. Low 0-4,
//     intermediate 5-8, high >= 9.
//   - Constans (Constans J, et al, Thromb Haemost 2008): venous material +1,
//     localized pain +1, unilateral pitting edema +1, alternative diagnosis at
//     least as plausible -1. Total -1..+3. Low <= 0, intermediate 1, high 2-3.
//
// Robustness (spec-v106 §3): every total is clamped to its published range and
// the band/stage is read off the clamped value so the shown number matches its
// band. constansUedvt carries the signed -1 term and keys its band on the signed
// sum. peged and fourPeps are strategy selectors: a missing tier / D-dimer renders
// a complete-the-fields fallback rather than a verdict from a missing value. None
// authors an imaging, anticoagulation, or admission order in Sophie's voice
// (spec-v11 §5.3); the image / treat / admit decision stays with the clinician.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// --- 2.1 peged - PEGeD graduated D-dimer rule ---------------------------------
const PEGED_NOTE = 'PEGeD graduated D-dimer rule (Kearon C, de Wit K, Parpia S, et al, N Engl J Med 2019): set the clinical pretest probability (C-PTP) by the 3-tier Wells categorization, then apply a probability-graduated D-dimer threshold in ng/mL FEU. Low C-PTP: PE excluded if D-dimer < 1000. Moderate C-PTP: PE excluded if D-dimer < 500. High C-PTP: proceed directly to CT pulmonary angiography (no D-dimer rule-out). In the derivation cohort no low- or moderate-C-PTP patient ruled out by these thresholds had VTE at 90 days. A rule-out aid, not an imaging order; assumes a FEU-calibrated D-dimer assay.';
const PEGED_THRESHOLD = { low: 1000, moderate: 500 };

export function peged({ tier, dDimer } = {}) {
  const t = tier === 'low' || tier === 'moderate' || tier === 'high' ? tier : null;
  if (t == null) {
    return { valid: false, band: 'Select the clinical pretest probability tier (low / moderate / high, by Wells) to apply PEGeD.', note: PEGED_NOTE };
  }
  if (t === 'high') {
    return {
      valid: true, tier: t, excluded: false, threshold: null,
      band: 'High C-PTP (Wells): proceed directly to CT pulmonary angiography -- no D-dimer rule-out applies.',
      abnormal: true, note: PEGED_NOTE,
    };
  }
  const d = fin(dDimer);
  if (d == null || d < 0) {
    return { valid: false, band: `Enter the measured D-dimer (ng/mL FEU) to apply the ${t} C-PTP threshold (< ${PEGED_THRESHOLD[t]}).`, note: PEGED_NOTE };
  }
  const threshold = PEGED_THRESHOLD[t];
  const excluded = d < threshold;
  return {
    valid: true, tier: t, dDimer: d, threshold, excluded,
    band: excluded
      ? `${t[0].toUpperCase() + t.slice(1)} C-PTP with D-dimer ${d} < ${threshold} ng/mL FEU: PE excluded by PEGeD -- imaging can be safely avoided.`
      : `${t[0].toUpperCase() + t.slice(1)} C-PTP with D-dimer ${d} >= ${threshold} ng/mL FEU: above the PEGeD threshold -- CT pulmonary angiography indicated.`,
    abnormal: !excluded, note: PEGED_NOTE,
  };
}

// --- 2.2 4peps - 4-Level PE Clinical Probability Score -------------------------
const PEPS_NOTE = '4-Level Pulmonary Embolism Clinical Probability Score (Roy PM, Friou E, Germeau B, et al, JAMA Cardiol 2021): a 13-item weighted pretest score that selects the D-dimer strategy. Total -5 to +21. Tiers: < 0 very low (PE ruled out, no testing); 0-5 low (rule out if D-dimer < 1000 ng/mL FEU); 6-12 moderate (rule out if below the age-adjusted cutoff, age x 10 ng/mL for age > 50); >= 13 high (direct CT pulmonary angiography, no D-dimer). A pretest tool, not an imaging order.';
const PEPS_TIER = [
  { max: -1, key: 'very low', strategy: 'PE ruled out -- no D-dimer, no imaging' },
  { max: 5, key: 'low', strategy: 'D-dimer; PE ruled out if < 1000 ng/mL FEU' },
  { max: 12, key: 'moderate', strategy: 'D-dimer; PE ruled out if below the age-adjusted cutoff (age x 10 ng/mL for age > 50)' },
  { max: Infinity, key: 'high', strategy: 'direct CT pulmonary angiography -- no D-dimer rule-out' },
];

export function fourPeps({
  age, heartRate, spo2, chronicResp, chestPainDyspnea, male, estrogen,
  priorVte, syncope, immobility, calfPainEdema, peMostLikely,
} = {}) {
  const a = pos(age);
  if (a == null) {
    return { valid: false, band: 'Enter the patient age (years) to compute the 4PEPS total.', note: PEPS_NOTE };
  }
  const terms = [];
  let total = 0;
  const add = (label, value) => { total += value; terms.push({ label, value }); };

  if (a < 50) add('Age < 50 years', -2);
  else if (a < 65) add('Age 50-64 years', -1);
  else terms.push({ label: 'Age >= 65 years', value: 0 });

  if (onFlag(chronicResp)) add('Chronic respiratory disease', -1);

  const hr = fin(heartRate);
  if (hr != null && hr < 80) add('Heart rate < 80/min', -1);

  if (onFlag(chestPainDyspnea)) add('Chest pain AND acute dyspnea', 1);
  if (onFlag(male)) add('Male sex', 2);
  if (onFlag(estrogen)) add('Hormonal estrogenic treatment', 2);
  if (onFlag(priorVte)) add('Prior VTE', 2);
  if (onFlag(syncope)) add('Syncope', 2);
  if (onFlag(immobility)) add('Immobility / surgery within 4 weeks', 2);

  const o2 = fin(spo2);
  if (o2 != null && o2 < 95) add('SpO2 < 95%', 3);

  if (onFlag(calfPainEdema)) add('Calf pain and/or unilateral lower-limb edema', 3);
  if (onFlag(peMostLikely)) add('PE is the most likely diagnosis', 5);

  total = clamp(total, -5, 21);
  const tier = PEPS_TIER.find((b) => total <= b.max);
  return {
    valid: true, total, tier: tier.key, strategy: tier.strategy, terms,
    band: `4PEPS total ${total >= 0 ? '+' : ''}${total}: ${tier.key} clinical probability -- ${tier.strategy}.`,
    abnormal: tier.key === 'high' || tier.key === 'moderate',
    note: PEPS_NOTE,
  };
}

// --- 2.3 bova-pe - Bova Score -------------------------------------------------
const BOVA_NOTE = 'Bova Score (Bova C, Sanchez O, Prandoni P, et al, Eur Respir J 2014): 30-day risk of PE-related complications in NORMOTENSIVE, confirmed acute PE. Systolic BP 90-100 mmHg +2, elevated cardiac troponin +2, RV dysfunction on echo/CT +2, heart rate >= 110/min +1. Total 0-7. Stage I (0-2): ~4.4% 30-day complications, ~3.1% PE-related mortality. Stage II (3-4): ~18% / ~6.8%. Stage III (> 4): ~42% / ~10.5%. An intermediate-risk stratifier for already-confirmed PE, not a disposition order; cross-links simplified-pesi.';
const BOVA_STAGE = [
  { max: 2, stage: 'I', comp: 4.4, mort: 3.1 },
  { max: 4, stage: 'II', comp: 18, mort: 6.8 },
  { max: 7, stage: 'III', comp: 42, mort: 10.5 },
];

export function bovaPe({ sbp90to100, troponin, rvDysfunction, hr110 } = {}) {
  const terms = [];
  let total = 0;
  const add = (label, on, value) => { if (onFlag(on)) { total += value; terms.push({ label, value }); } };
  add('Systolic BP 90-100 mmHg', sbp90to100, 2);
  add('Elevated cardiac troponin', troponin, 2);
  add('RV dysfunction (echo / CT)', rvDysfunction, 2);
  add('Heart rate >= 110/min', hr110, 1);
  total = clamp(total, 0, 7);
  const s = BOVA_STAGE.find((b) => total <= b.max);
  return {
    valid: true, total, stage: s.stage, complication: s.comp, mortality: s.mort, terms,
    band: `Bova Score ${total} = Stage ${s.stage}: ~${s.comp}% 30-day PE-related complications, ~${s.mort}% PE-related mortality.`,
    abnormal: total > 2, note: BOVA_NOTE,
  };
}

// --- 2.4 hestia - Hestia criteria (outpatient PE) -----------------------------
const HESTIA_NOTE = 'Hestia criteria for outpatient PE treatment (Zondag W, Mos ICM, Creemers-Schild D, et al, J Thromb Haemost 2011): 11 yes/no exclusion items. ANY positive item means the patient is NOT a candidate for home treatment; all-negative means eligible per the rule. A triage checklist, not a disposition order; cross-links simplified-pesi and bova-pe.';
const HESTIA_ITEMS = [
  { key: 'unstable', text: 'Hemodynamically unstable' },
  { key: 'thrombolysis', text: 'Thrombolysis or embolectomy needed' },
  { key: 'bleeding', text: 'Active bleeding or high bleeding risk' },
  { key: 'oxygen', text: '> 24 h oxygen needed to keep SaO2 > 90%' },
  { key: 'onAnticoag', text: 'PE diagnosed while on anticoagulation' },
  { key: 'severePain', text: 'Severe pain needing IV analgesia > 24 h' },
  { key: 'medSocial', text: 'Medical / social reason for admission > 24 h' },
  { key: 'renal', text: 'Creatinine clearance < 30 mL/min' },
  { key: 'liver', text: 'Severe liver impairment' },
  { key: 'pregnant', text: 'Pregnant' },
  { key: 'hit', text: 'Documented history of HIT' },
];

export function hestia(input = {}) {
  const flagged = HESTIA_ITEMS.filter((it) => onFlag(input[it.key]));
  const eligible = flagged.length === 0;
  return {
    valid: true,
    positive: flagged.length,
    eligible,
    flagged: flagged.map((f) => f.text),
    band: eligible
      ? 'All 11 Hestia criteria negative: eligible for outpatient PE treatment per the rule.'
      : `${flagged.length} positive Hestia criteri${flagged.length > 1 ? 'a' : 'on'} (${flagged.map((f) => f.text).join('; ')}): NOT a home-treatment candidate.`,
    abnormal: !eligible,
    note: HESTIA_NOTE,
  };
}

// --- 2.5 geneva-original - original Geneva score ------------------------------
const GENEVA_NOTE = 'Original Geneva score (Wicki J, Perneger TV, Junod AF, Bounameaux H, Perrier A, Arch Intern Med 2001): a fully objective pretest model using clinical items, arterial blood gas, and chest film. Age 60-79 +1 / >= 80 +2; prior DVT or PE +2; surgery within 4 weeks +3; heart rate > 100/min +1; PaCO2 < 36 mmHg (< 4.8 kPa) +2 or 36-38.9 mmHg (4.8-5.19 kPa) +1; PaO2 < 48.7 mmHg (< 6.5 kPa) +4, 48.7-59.9 (6.5-7.99) +3, 60-71.1 (8-9.49) +2, 71.2-82.4 (9.5-10.99) +1; band atelectasis +1; elevated hemidiaphragm +1. Total 0-16. Low 0-4 (~10% PE), intermediate 5-8 (~38%), high >= 9 (~81%). The pre-Wells objective predecessor model; cross-links the Wells and revised-Geneva tiles.';
// PaCO2 bands keyed by select value -> points. PaO2 likewise.
const GENEVA_PACO2 = { low2: 2, low1: 1, normal: 0 };
const GENEVA_PAO2 = { b4: 4, b3: 3, b2: 2, b1: 1, normal: 0 };
const GENEVA_PACO2_LABEL = { low2: 'PaCO2 < 36 mmHg', low1: 'PaCO2 36-38.9 mmHg', normal: 'PaCO2 >= 39 mmHg' };
const GENEVA_PAO2_LABEL = { b4: 'PaO2 < 48.7 mmHg', b3: 'PaO2 48.7-59.9 mmHg', b2: 'PaO2 60-71.1 mmHg', b1: 'PaO2 71.2-82.4 mmHg', normal: 'PaO2 >= 82.5 mmHg' };

export function genevaOriginal({
  age, heartRate, priorVte, recentSurgery, paco2Band, pao2Band,
  bandAtelectasis, elevatedHemidiaphragm,
} = {}) {
  const a = pos(age);
  if (a == null) {
    return { valid: false, band: 'Enter the patient age (years) to compute the original Geneva score.', note: GENEVA_NOTE };
  }
  const terms = [];
  let total = 0;
  const add = (label, value) => { total += value; terms.push({ label, value }); };

  if (a >= 80) add('Age >= 80 years', 2);
  else if (a >= 60) add('Age 60-79 years', 1);

  if (onFlag(priorVte)) add('Previous DVT or PE', 2);
  if (onFlag(recentSurgery)) add('Surgery within 4 weeks', 3);

  const hr = fin(heartRate);
  if (hr != null && hr > 100) add('Heart rate > 100/min', 1);

  const co2 = Object.prototype.hasOwnProperty.call(GENEVA_PACO2, paco2Band) ? paco2Band : 'normal';
  if (GENEVA_PACO2[co2] !== 0) add(GENEVA_PACO2_LABEL[co2], GENEVA_PACO2[co2]);
  const o2 = Object.prototype.hasOwnProperty.call(GENEVA_PAO2, pao2Band) ? pao2Band : 'normal';
  if (GENEVA_PAO2[o2] !== 0) add(GENEVA_PAO2_LABEL[o2], GENEVA_PAO2[o2]);

  if (onFlag(bandAtelectasis)) add('Band (platelike) atelectasis', 1);
  if (onFlag(elevatedHemidiaphragm)) add('Elevated hemidiaphragm', 1);

  total = clamp(total, 0, 16);
  const band = total <= 4 ? { key: 'low', prev: 10 } : total <= 8 ? { key: 'intermediate', prev: 38 } : { key: 'high', prev: 81 };
  return {
    valid: true, total, probability: band.key, prevalence: band.prev, terms,
    band: `Original Geneva score ${total}: ${band.key} clinical probability (~${band.prev}% PE prevalence).`,
    abnormal: band.key !== 'low',
    note: GENEVA_NOTE,
  };
}

// --- 2.6 constans-uedvt - Constans score (upper-extremity DVT) ----------------
const CONSTANS_NOTE = 'Constans score for upper-extremity DVT (Constans J, Salmi LR, Sevestre-Pietri MA, et al, Thromb Haemost 2008): the only validated pretest probability for UE-DVT. Venous material in the limb (central line / pacemaker) +1, localized pain +1, unilateral pitting edema +1, and an alternative diagnosis at least as plausible -1 (a signed term). Total -1 to +3. Low <= 0 (~9-13% UE-DVT), intermediate 1, high 2-3 (~64-70%). A pretest aid, not an imaging order.';

export function constansUedvt({ venousMaterial, localizedPain, unilateralEdema, otherDxPlausible } = {}) {
  const terms = [];
  let total = 0;
  const add = (label, on, value) => { if (onFlag(on)) { total += value; terms.push({ label, value }); } };
  add('Venous material (central line / pacemaker)', venousMaterial, 1);
  add('Localized pain', localizedPain, 1);
  add('Unilateral pitting edema', unilateralEdema, 1);
  add('Other diagnosis at least as plausible', otherDxPlausible, -1);
  total = clamp(total, -1, 3);
  const band = total <= 0 ? { key: 'low', prev: '9-13' } : total === 1 ? { key: 'intermediate', prev: null } : { key: 'high', prev: '64-70' };
  return {
    valid: true, total, probability: band.key, terms,
    band: band.prev
      ? `Constans score ${total >= 0 ? '+' : ''}${total}: ${band.key} pretest probability of upper-extremity DVT (~${band.prev}%).`
      : `Constans score ${total >= 0 ? '+' : ''}${total}: ${band.key} pretest probability of upper-extremity DVT.`,
    abnormal: band.key === 'high',
    note: CONSTANS_NOTE,
  };
}
