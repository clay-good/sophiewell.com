// spec-v205: pulmonology, COPD & sleep severity instruments (Frontline &
// Bedside Decision Instruments program, spec-v204 §1.1). Every id was verified
// absent by a direct scan of app.js first (spec-v85 §6.2). None duplicates a
// live tile; v205 runs no AI and makes no runtime network call. These stratify
// and screen — they are NOT a pleurodesis, inhaler, oxygen, or polysomnography
// order (spec-v11 §5.3). Shipped one tile at a time per an active /goal.
//
//   cat          - COPD Assessment Test (0-40 health-status impact)
//   lent         - LENT prognostic score (malignant pleural effusion)
//   adoIndex     - ADO index (COPD 3-year mortality)
//   doseIndex    - DOSE index (COPD severity)
//   sacsOsa      - Sleep Apnea Clinical Score (Flemons)
//
// POINT WEIGHTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - CAT (Jones PW, et al, Eur Respir J 2009;34(3):648-654): eight patient-
//     completed semantic-differential items — cough, phlegm, chest tightness,
//     breathlessness on hills/stairs, activity limitation at home, confidence
//     leaving home, sleep, and energy — each scored 0-5; total 0-40. Impact
//     bands (Jones / GOLD, corroborated across Healthline, GPnotebook, and the
//     PMC primary-care evaluation): low < 10, medium 10-20, high 21-30, very
//     high > 30. GOLD uses >= 10 as the "more symptoms" threshold; the MCID is
//     ~2 points.

import { num } from './num.js';

function intIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function numIn(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- 2.4 COPD Assessment Test -----------------------------------------------
const CAT_ITEMS = [
  ['cough', 'Cough'],
  ['phlegm', 'Phlegm'],
  ['chest', 'Chest tightness'],
  ['breathless', 'Breathlessness on hills/stairs'],
  ['activity', 'Activity limitation at home'],
  ['confidence', 'Confidence leaving home'],
  ['sleep', 'Sleep'],
  ['energy', 'Energy'],
];
const CAT_NOTE = 'COPD Assessment Test (Jones PW, et al, Eur Respir J 2009;34(3):648-654): eight patient-completed items — cough, phlegm, chest tightness, breathlessness on hills/stairs, activity limitation at home, confidence leaving home, sleep, and energy — each 0-5; total 0-40. Impact bands: low < 10, medium 10-20, high 21-30, very high > 30. GOLD uses ≥ 10 as the "more symptoms" threshold (drives ABE group assignment); the minimal clinically important difference is ~2 points. A patient-reported health-status instrument, not a treatment order.';

export function cat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = {};
  for (const [key] of CAT_ITEMS) {
    const v = intIn(o[key], 0, 5);
    if (v === null) {
      return { valid: false, message: 'Score all eight CAT items 0–5 (cough, phlegm, chest tightness, breathlessness, activity limitation, confidence leaving home, sleep, energy).' };
    }
    vals[key] = v;
  }
  let total = 0;
  for (const [key] of CAT_ITEMS) total += vals[key];
  total = num('CAT', total, { min: 0, max: 40 });
  let tier; const abnormal = total >= 10;
  if (total < 10) tier = 'low impact (< 10)';
  else if (total <= 20) tier = 'medium impact (10–20)';
  else if (total <= 30) tier = 'high impact (21–30)';
  else tier = 'very high impact (> 30)';
  const top = CAT_ITEMS.map(([k, label]) => [label, vals[k]]).filter((p) => p[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map((p) => `${p[0]} (${p[1]})`);
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `CAT ${total}`,
    band: `CAT ${total}/40 — ${tier}${total >= 10 ? '; at or above the GOLD ≥ 10 "more symptoms" threshold' : ''}.`,
    detail: top.length ? `Highest-scoring items: ${top.join('; ')}.` : 'All items scored 0 — no symptom burden.',
    note: CAT_NOTE,
  };
}

// --- 2.1 LENT prognostic score (malignant pleural effusion) ------------------
// WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the Clive
// 2014 development paper reproductions and validation studies: pleural-fluid LDH
// < 1500 IU/L → 0, ≥ 1500 → 1; ECOG performance status 0/1/2/3 (3 and 4 combined
// → 3); serum neutrophil-to-lymphocyte ratio < 9 → 0, ≥ 9 → 1; tumor type
// mesothelioma / hematologic → 0, breast / gynecologic / renal → 1, lung / other
// → 2. Total 0-7 (max 1+3+1+2). Risk groups (Clive AO, et al, Thorax
// 2014;69(12):1098-1104): low 0-1 (median survival ≈ 319 days), moderate 2-4
// (≈ 130 days), high 5-7 (≈ 44 days).
const LENT_NOTE = 'LENT score (Clive AO, Kahan BC, Hooper CE, et al, Thorax 2014;69(12):1098-1104): the first effusion-specific survival score for malignant pleural effusion, summing pleural-fluid LDH (≥ 1500 → 1), ECOG performance status (0–3), serum neutrophil-to-lymphocyte ratio (≥ 9 → 1), and tumor type (mesothelioma/heme 0, breast/gyn/renal 1, lung/other 2); total 0–7. Risk groups: low 0–1 (median ≈ 319 days), moderate 2–4 (≈ 130 days), high 5–7 (≈ 44 days). Informs goals-of-care and the pleurodesis / indwelling-catheter vs palliative choice — a prognostic estimate, not a procedure order.';
const LENT_ECOG = { 0: 0, 1: 1, 2: 2, '3-4': 3 };
const LENT_TUMOR = { low: 0, moderate: 1, high: 2 };
const LENT_TUMOR_LABEL = { low: 'mesothelioma / hematologic (0)', moderate: 'breast / gynecologic / renal (1)', high: 'lung / other (2)' };

export function lent(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ldh = numIn(o.pleuralLdh, 0, 100000);
  const nlr = numIn(o.nlr, 0, 10000);
  const ecog = Object.prototype.hasOwnProperty.call(LENT_ECOG, o.ecog) ? o.ecog : null;
  const tumor = Object.prototype.hasOwnProperty.call(LENT_TUMOR, o.tumorType) ? o.tumorType : null;
  if (ldh === null || nlr === null || ecog === null || tumor === null) {
    return { valid: false, message: 'Enter pleural-fluid LDH (IU/L) and serum neutrophil-to-lymphocyte ratio; select ECOG performance status and tumor-type group.' };
  }
  const lPts = ldh >= 1500 ? 1 : 0;
  const ePts = LENT_ECOG[ecog];
  const nPts = nlr >= 9 ? 1 : 0;
  const tPts = LENT_TUMOR[tumor];
  const total = num('LENT', lPts + ePts + nPts + tPts, { min: 0, max: 7 });
  let tier; let months; let abnormal = true;
  if (total <= 1) { tier = 'low-risk (0–1)'; months = '≈ 319 days'; abnormal = false; }
  else if (total <= 4) { tier = 'moderate-risk (2–4)'; months = '≈ 130 days'; }
  else { tier = 'high-risk (5–7)'; months = '≈ 44 days'; }
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `LENT ${total}`,
    band: `LENT ${total}/7 — ${tier}; median survival ${months} in the development cohort.`,
    detail: `LDH ${ldh} (+${lPts}); ECOG ${ecog} (+${ePts}); N/L ratio ${nlr} (+${nPts}); tumor ${LENT_TUMOR_LABEL[tumor]}.`,
    note: LENT_NOTE,
  };
}

// --- 2.2 ADO index (age, dyspnea, airflow obstruction) ----------------------
// POINT MAP RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// MDPI/PMC8999166 reproduction of the original Puhan table and the spec draft:
// FEV1 % predicted ≥ 65 → 0, 36-64 → 1, ≤ 35 → 2; dyspnea (mMRC) 0-1 → 0, 2 → 1,
// 3 → 2, 4 → 3; age (years) 40-49 → 0, 50-59 → 1, 60-69 → 2, 70-79 → 3, 80-89 →
// 4, ≥ 90 → 5. Total 0-10; higher = worse predicted 3-year all-cause mortality
// (Puhan MA, et al, Lancet 2009;374(9691):704-711). The published per-score
// mortality curve is not reproduced from >= 2 open sources, so this tile reports
// the score with the quartile risk tiers (MDPI reproduction: 0-2, 3-4, 5-6,
// 7-10) rather than fabricated per-score percentages.
const ADO_NOTE = 'ADO index (Puhan MA, Garcia-Aymerich J, Frey M, et al, Lancet 2009;374(9691):704-711): a primary-care-friendly COPD mortality index needing no 6-minute walk test. Age (40-49 → 0 up to ≥ 90 → 5), dyspnea (mMRC 0-1 → 0, 2 → 1, 3 → 2, 4 → 3), and airflow obstruction (FEV₁ % predicted ≥ 65 → 0, 36-64 → 1, ≤ 35 → 2); total 0-10. A higher score predicts higher 3-year all-cause mortality (rising across the quartiles 0-2, 3-4, 5-6, 7-10). A prognostic estimate, not a treatment order.';

function adoAge(v) { return v < 50 ? 0 : v < 60 ? 1 : v < 70 ? 2 : v < 80 ? 3 : v < 90 ? 4 : 5; }
function adoFev1(v) { return v >= 65 ? 0 : v > 35 ? 1 : 2; }
const ADO_MMRC = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 };

export function adoIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = numIn(o.age, 0, 120);
  const fev1 = numIn(o.fev1, 0, 200);
  const mmrc = Object.prototype.hasOwnProperty.call(ADO_MMRC, o.mmrc) ? o.mmrc : null;
  if (age === null || fev1 === null || mmrc === null) {
    return { valid: false, message: 'Enter age (years) and FEV₁ (% predicted), and select the mMRC dyspnea grade (0–4).' };
  }
  const aPts = adoAge(age); const dPts = ADO_MMRC[mmrc]; const oPts = adoFev1(fev1);
  const total = num('ADO', aPts + dPts + oPts, { min: 0, max: 10 });
  let tier; let abnormal = true;
  if (total <= 2) { tier = 'lowest-risk quartile (0–2)'; abnormal = false; }
  else if (total <= 4) tier = 'second quartile (3–4)';
  else if (total <= 6) tier = 'third quartile (5–6)';
  else tier = 'highest-risk quartile (7–10)';
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `ADO ${total}`,
    band: `ADO ${total}/10 — ${tier}; higher scores predict higher 3-year all-cause mortality.`,
    detail: `Age ${age} (+${aPts}); mMRC ${mmrc} (+${dPts}); FEV₁ ${fev1}% (+${oPts}).`,
    note: ADO_NOTE,
  };
}

// --- 2.3 DOSE index (dyspnea, obstruction, smoking, exacerbations) -----------
// POINT MAP RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// worked example in the DOSE literature (mMRC 2 → 1 point, 2 exacerbations → 1
// point, FEV1 61% → 0, current smoker → 1) and the published FEV1 cut-points:
// dyspnea (mMRC) 0-1 → 0, 2 → 1, 3 → 2, 4 → 3; obstruction (FEV1 % predicted)
// ≥ 50 → 0, 30-49 → 1, < 30 → 2; current smoking → 1; exacerbations in the past
// year 0-1 → 0, 2-3 → 1, ≥ 4 → 2. Total 0-8. Mortality (Jones RC, et al, Am J
// Respir Crit Care Med 2009;180(12):1189-1195; validation PMC6547953): vs a
// score of 0-3, the mortality hazard ratio is 3.48 at 4-5 and 8.00 at 6-8.
const DOSE_NOTE = 'DOSE index (Jones RC, Donaldson GC, Chavannes NH, et al, Am J Respir Crit Care Med 2009;180(12):1189-1195): a four-item composite for routine primary-care COPD review — dyspnea (mMRC 0-1 → 0, 2 → 1, 3 → 2, 4 → 3), obstruction (FEV₁ % predicted ≥ 50 → 0, 30-49 → 1, < 30 → 2), current smoking (+1), and exacerbations in the past year (0-1 → 0, 2-3 → 1, ≥ 4 → 2); total 0-8. A score ≥ 4 marks markedly higher mortality and hospital-admission risk (mortality hazard ratio 3.48 at 4-5, 8.00 at 6-8, vs 0-3). A single trackable severity number, not a treatment order.';

function doseFev1(v) { return v >= 50 ? 0 : v >= 30 ? 1 : 2; }
function doseExac(v) { return v <= 1 ? 0 : v <= 3 ? 1 : 2; }
const DOSE_MMRC = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 };

export function doseIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fev1 = numIn(o.fev1, 0, 200);
  const exac = numIn(o.exacerbations, 0, 100);
  const mmrc = Object.prototype.hasOwnProperty.call(DOSE_MMRC, o.mmrc) ? o.mmrc : null;
  if (fev1 === null || exac === null || mmrc === null) {
    return { valid: false, message: 'Enter FEV₁ (% predicted) and exacerbations in the past year; select the mMRC dyspnea grade (0–4); set current-smoker status.' };
  }
  const dPts = DOSE_MMRC[mmrc];
  const oPts = doseFev1(fev1);
  const sPts = (o.smoker === true || o.smoker === 1 || o.smoker === '1' || o.smoker === 'yes') ? 1 : 0;
  const ePts = doseExac(exac);
  const total = num('DOSE', dPts + oPts + sPts + ePts, { min: 0, max: 8 });
  let tier; let abnormal = true;
  if (total <= 3) { tier = 'lower-risk (0–3)'; abnormal = false; }
  else if (total <= 5) tier = 'higher-risk (4–5; mortality HR 3.48 vs 0–3)';
  else tier = 'highest-risk (6–8; mortality HR 8.00 vs 0–3)';
  return {
    valid: true,
    score: total,
    abnormal,
    bandLabel: `DOSE ${total}`,
    band: `DOSE ${total}/8 — ${tier}.`,
    detail: `mMRC ${mmrc} (+${dPts}); FEV₁ ${fev1}% (+${oPts}); current smoker (+${sPts}); exacerbations ${exac} (+${ePts}).`,
    note: DOSE_NOTE,
  };
}

// --- 2.5 Sleep Apnea Clinical Score (Flemons) -------------------------------
// INCREMENTS / BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified
// across MedicalAlgorithms, the SACS validation literature, and the BioSerenity
// reference: the adjusted neck circumference = measured neck circumference (cm)
// + 4 (hypertension) + 3 (habitual snoring) + 3 (nocturnal gasping/choking).
// Risk bands: ≤ 43 low, 43-48 intermediate, > 48 high probability of OSA.
// SPEC-DRAFT NOTE (spec-v97): the spec-v205 §2.5 draft described a 0-100 SACS
// with < 5 / > 15 cut-points (the derived Flemons probability-score nomogram),
// but that ANC → score nomogram is not reproducible from >= 2 open sources. This
// tile ships the openly reproducible adjusted-neck-circumference form (the common
// clinical SACS calculator) instead of shipping an unverified nomogram — the
// v199 ELTS / v202 CLIF-C-AD precedent (the source governs, not the draft).
const SACS_NOTE = 'Sleep Apnea Clinical Score (Flemons WW, Whitelaw WA, Brant R, Remmers JE, Am J Respir Crit Care Med 1994;150(5 Pt 1):1279-1285): adjusted neck circumference = measured neck (cm) + 4 (hypertension) + 3 (habitual snoring) + 3 (nocturnal gasping/choking). Bands: ≤ 43 low, 43–48 intermediate, > 48 high pretest probability of obstructive sleep apnea. An anthropometry-driven triage rule complementing the questionnaire sleep tools — decision support, not a polysomnography order.';

export function sacsOsa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const neck = numIn(o.neck, 20, 80);
  if (neck === null) {
    return { valid: false, message: 'Enter the measured neck circumference (cm); set hypertension, habitual snoring, and nocturnal gasping/choking.' };
  }
  const htn = (o.hypertension === true || o.hypertension === 1 || o.hypertension === '1' || o.hypertension === 'yes') ? 4 : 0;
  const snore = (o.snoring === true || o.snoring === 1 || o.snoring === '1' || o.snoring === 'yes') ? 3 : 0;
  const choke = (o.choking === true || o.choking === 1 || o.choking === '1' || o.choking === 'yes') ? 3 : 0;
  const anc = num('SACS', neck + htn + snore + choke, { min: 20, max: 90 });
  let tier; let abnormal = true;
  if (anc <= 43) { tier = 'low pretest probability of OSA (≤ 43)'; abnormal = false; }
  else if (anc <= 48) tier = 'intermediate pretest probability of OSA (43–48)';
  else tier = 'high pretest probability of OSA (> 48) — consider expedited polysomnography';
  const adj = [];
  if (htn) adj.push('hypertension (+4)');
  if (snore) adj.push('snoring (+3)');
  if (choke) adj.push('gasping/choking (+3)');
  return {
    valid: true,
    score: anc,
    abnormal,
    bandLabel: `SACS ${anc} cm`,
    band: `Adjusted neck circumference ${anc} cm — ${tier}.`,
    detail: `Neck ${neck} cm${adj.length ? ' + ' + adj.join(' + ') : ''} = ${anc} cm.`,
    note: SACS_NOTE,
  };
}
