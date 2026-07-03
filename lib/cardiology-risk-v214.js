// spec-v214: cardiology risk scores — atrial-fibrillation ablation / progression
// outcome scores and two acute-coronary-syndrome severity scores. Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v214 runs no AI and makes no runtime network call.
// These stratify recurrence / progression / complication risk — they are NOT an
// ablation, admission, or treatment order (spec-v11 §5.3).
//
//   apple       - APPLE score (AF recurrence after catheter ablation)
//   caapAf      - CAAP-AF score (freedom from AF after ablation)
//   atlas       - ATLAS score (AF recurrence after first PVI)
//   hatch       - HATCH score (progression paroxysmal -> persistent AF)
//   mbLater     - MB-LATER score (very-late AF recurrence after ablation)
//   canadaAcs   - Canada Acute Coronary Syndrome (C-ACS) risk score
//   actionIcu   - ACTION ICU score (ICU-level complications in NSTEMI)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), each cross-verified
// across >= 2 independent open sources at implementation (see per-function
// headers).

import { num } from './num.js';

function bool(v) {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}
function result(name, score, max, tier, abnormal, detail, note, extra = {}) {
  const s = Math.round(num(name, score, { min: 0, max }));
  return {
    valid: true, score: s, abnormal,
    bandLabel: `${name} ${s}`,
    band: `${name} ${s} — ${tier}.`,
    detail, note, ...extra,
  };
}

// --- APPLE -------------------------------------------------------------------
// Kornej J, et al, Clin Res Cardiol 2015;104(10):871-876 (derivation) +
// Kornej J, et al, PLoS One 2017;12(1):e0169933 (validation): one point each for
// Age > 65, Persistent AF, imPaired eGFR < 60, LA diameter >= 43 mm, EF < 50%.
// Recurrence after ablation rises with score (score 0 ~ lowest; >= 2 elevated).
const APPLE_NOTE = 'APPLE score (Kornej J, et al, Clin Res Cardiol 2015;104(10):871-876): one point each for Age > 65, Persistent AF, imPaired eGFR < 60 mL/min/1.73m2, Left-atrial diameter >= 43 mm, and Ejection fraction < 50% (0-5). Higher scores predict a higher rate of AF recurrence after catheter ablation. A recurrence-risk score, not an ablation or repeat-ablation order.';
export function apple(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.ageOver65)) { s += 1; p.push('age > 65'); }
  if (bool(o.persistentAf)) { s += 1; p.push('persistent AF'); }
  if (bool(o.egfrLow)) { s += 1; p.push('eGFR < 60'); }
  if (bool(o.laDilated)) { s += 1; p.push('LA diameter >= 43 mm'); }
  if (bool(o.efLow)) { s += 1; p.push('EF < 50%'); }
  const tier = s >= 2 ? 'elevated recurrence risk after ablation' : s === 1 ? 'low-moderate recurrence risk' : 'lowest recurrence risk';
  return result('APPLE', s, 5, tier, s >= 2, p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', APPLE_NOTE);
}

// --- CAAP-AF -----------------------------------------------------------------
// Winkle RA, et al, Heart Rhythm 2016;13(11):2119-2125 (derivation) + ESC Heart
// Fail 2019 validation (PMID 31544956): CAD +1; LA diameter band 0-4; age band
// 0-3; persistent/long-standing persistent AF +2; number of failed AADs band
// 0-2; female +1 (0-13). Score >= 5 predicts AF recurrence after ablation.
const CAAP_NOTE = 'CAAP-AF score (Winkle RA, et al, Heart Rhythm 2016;13(11):2119-2125): Coronary artery disease +1; left-Atrial diameter (<4.0/4.0-4.5/4.5-5.0/5.0-5.5/>5.5 cm = 0/1/2/3/4); Age (<50/50-60/60-70/>70 = 0/1/2/3); Persistent or long-standing persistent AF +2; number of failed Antiarrhythmic drugs (0/1-2/>2 = 0/1/2); Female +1 (0-13). Higher scores predict lower freedom from AF after ablation; >= 5 flags elevated recurrence. A recurrence-risk score, not an ablation order.';
export function caapAf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const la = pos(o.laDiameter, 20);
  const age = pos(o.age, 130);
  const aad = pos(o.failedAad, 50);
  if (la === null || age === null || aad === null) {
    return { valid: false, message: 'Enter left-atrial diameter (cm), age (years), and number of failed antiarrhythmic drugs, and mark coronary disease / persistent AF / female sex.' };
  }
  let s = 0; const p = [];
  if (bool(o.cad)) { s += 1; p.push('CAD'); }
  const laPts = la < 4.0 ? 0 : la < 4.5 ? 1 : la < 5.0 ? 2 : la <= 5.5 ? 3 : 4;
  s += laPts; if (laPts) p.push(`LA ${la} cm (+${laPts})`);
  const agePts = age < 50 ? 0 : age <= 60 ? 1 : age <= 70 ? 2 : 3;
  s += agePts; if (agePts) p.push(`age ${Math.round(age)} (+${agePts})`);
  if (bool(o.persistentAf)) { s += 2; p.push('persistent AF (+2)'); }
  const aadPts = aad === 0 ? 0 : aad <= 2 ? 1 : 2;
  s += aadPts; if (aadPts) p.push(`${aad} failed AAD (+${aadPts})`);
  if (bool(o.female)) { s += 1; p.push('female'); }
  const tier = s >= 5 ? 'elevated recurrence risk (>= 5)' : 'lower recurrence risk (< 5)';
  return result('CAAP-AF', s, 13, tier, s >= 5, p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', CAAP_NOTE);
}

// --- ATLAS -------------------------------------------------------------------
// Mesquita J, et al, Europace 2018;20(FI_3):f428-f435 + Dretzke J, et al,
// Europace 2020;22(5):748-760: Age > 60 +1; Type non-paroxysmal +2; indexed LA
// volume +1 per 10 mL/m2; Sex female +4; Smoking current +7. Bands low < 6,
// intermediate 6-10, high > 10.
const ATLAS_NOTE = 'ATLAS score (Mesquita J, et al, Europace 2018;20(FI_3):f428-f435): Age > 60 +1; non-paroxysmal AF Type +2; indexed Left-Atrial volume +1 per 10 mL/m2; Sex female +4; current Smoking +7. Low < 6, intermediate 6-10, high > 10 predicts AF recurrence after a first pulmonary-vein isolation. A recurrence-risk score, not an ablation order.';
export function atlas(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const lavi = pos(o.laVolumeIndex, 400);
  if (lavi === null) {
    return { valid: false, message: 'Enter indexed left-atrial volume (mL/m2) and mark age > 60 / non-paroxysmal AF / female / current smoking.' };
  }
  let s = 0; const p = [];
  if (bool(o.ageOver60)) { s += 1; p.push('age > 60'); }
  if (bool(o.nonParoxysmal)) { s += 2; p.push('non-paroxysmal AF (+2)'); }
  const laviPts = Math.floor(lavi / 10);
  s += laviPts; if (laviPts) p.push(`LA volume index ${lavi} (+${laviPts})`);
  if (bool(o.female)) { s += 4; p.push('female (+4)'); }
  if (bool(o.smoking)) { s += 7; p.push('current smoking (+7)'); }
  const tier = s > 10 ? 'high recurrence risk (> 10)' : s >= 6 ? 'intermediate recurrence risk (6-10)' : 'low recurrence risk (< 6)';
  return result('ATLAS', s, 60, tier, s >= 6, p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', ATLAS_NOTE);
}

// --- HATCH -------------------------------------------------------------------
// de Vos CB, et al, J Am Coll Cardiol 2010;55(8):725-731 + Barrett TW, et al,
// Am J Emerg Med 2013;31(5):792-797: Hypertension +1, Age > 75 +1, TIA/stroke
// +2, COPD +1, Heart failure +2 (0-7). Higher scores predict progression from
// paroxysmal to persistent AF.
const HATCH_NOTE = 'HATCH score (de Vos CB, et al, J Am Coll Cardiol 2010;55(8):725-731): Hypertension +1, Age > 75 +1, TIA/stroke +2, COPD +1, Heart failure +2 (0-7). Higher scores predict progression from paroxysmal to persistent atrial fibrillation. A progression-risk score, not a rhythm-control order.';
export function hatch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.hypertension)) { s += 1; p.push('hypertension'); }
  if (bool(o.ageOver75)) { s += 1; p.push('age > 75'); }
  if (bool(o.strokeTia)) { s += 2; p.push('TIA/stroke (+2)'); }
  if (bool(o.copd)) { s += 1; p.push('COPD'); }
  if (bool(o.heartFailure)) { s += 2; p.push('heart failure (+2)'); }
  const tier = s > 2 ? 'higher progression risk (> 2)' : 'lower progression risk (0-2)';
  return result('HATCH', s, 7, tier, s > 2, p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', HATCH_NOTE);
}

// --- MB-LATER ----------------------------------------------------------------
// Mujovic N, et al, Sci Rep 2017;7:40828 + Kosich F, et al, Int J Cardiol
// 2018;272:117-123: Male +1, Bundle-branch block +1, LA >= 47 mm +1, AF Type
// (paroxysmal/persistent/long-standing = 0/1/2), Early Recurrence of AF within
// 3 months +1 (0-6). Cutoff >= 2 predicts very-late recurrence after ablation.
const MBLATER_NOTE = 'MB-LATER score (Mujovic N, et al, Sci Rep 2017;7:40828): Male +1, Bundle-branch block +1, Left-Atrium >= 47 mm +1, AF Type (paroxysmal/persistent/long-standing persistent = 0/1/2), and Early Recurrence of AF within 3 months +1 (0-6). A score >= 2 predicts very-late (> 12 months) AF recurrence after ablation. A recurrence-risk score, not an ablation order.';
export function mbLater(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const afType = pos(o.afType, 2); // 0 parox, 1 persistent, 2 long-standing
  if (afType === null) {
    return { valid: false, message: 'Enter AF type (0 = paroxysmal, 1 = persistent, 2 = long-standing persistent) and mark male / bundle-branch block / LA >= 47 mm / early recurrence.' };
  }
  let s = 0; const p = [];
  if (bool(o.male)) { s += 1; p.push('male'); }
  if (bool(o.bbb)) { s += 1; p.push('bundle-branch block'); }
  if (bool(o.laLarge)) { s += 1; p.push('LA >= 47 mm'); }
  const t = Math.round(afType);
  s += t; if (t) p.push(`AF type ${['paroxysmal', 'persistent', 'long-standing'][t]} (+${t})`);
  if (bool(o.earlyRecurrence)) { s += 1; p.push('early recurrence < 3 mo'); }
  const tier = s >= 2 ? 'elevated very-late recurrence risk (>= 2)' : 'lower very-late recurrence risk (< 2)';
  return result('MB-LATER', s, 6, tier, s >= 2, p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', MBLATER_NOTE);
}

// --- Canada ACS (C-ACS) ------------------------------------------------------
// Huynh T, et al, Am Heart J 2013;166(1):58-63 + AlFaleh HF, et al, Clin Cardiol
// 2015;38(9):542-547: Age >= 75 +1, Killip class > 1 +1, SBP < 100 mmHg +1, HR
// > 100 bpm +1 (0-4). Higher scores predict higher in-hospital mortality across
// the ACS spectrum.
const CACS_NOTE = 'Canada Acute Coronary Syndrome (C-ACS) risk score (Huynh T, et al, Am Heart J 2013;166(1):58-63): Age >= 75 +1, Killip class > 1 +1, systolic BP < 100 mmHg +1, heart rate > 100 bpm +1 (0-4). A rising score predicts higher in-hospital mortality across the whole ACS spectrum. A risk score, not an admission or treatment order.';
export function canadaAcs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.ageOver75)) { s += 1; p.push('age >= 75'); }
  if (bool(o.killipOver1)) { s += 1; p.push('Killip > 1'); }
  if (bool(o.sbpLow)) { s += 1; p.push('SBP < 100'); }
  if (bool(o.hrHigh)) { s += 1; p.push('HR > 100'); }
  const tier = s >= 3 ? 'high in-hospital mortality risk' : s >= 1 ? 'intermediate in-hospital mortality risk' : 'lowest in-hospital mortality risk';
  return result('C-ACS', s, 4, tier, s >= 1, p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', CACS_NOTE);
}

// --- ACTION ICU --------------------------------------------------------------
// Fanaroff AC, et al, J Am Heart Assoc 2018;7(11):e008894 + Arch Cardiol Mex
// 2022 (PMID 36183629): Age >= 70 +1; HR 85-100 +1 / >= 100 +3; SBP 125-145 +1
// / < 125 +3; creatinine >= 1.1 +1; initial troponin / ULN >= 12 +2; signs of
// heart failure +5; ST-depression +1; no prior revascularization +1; chronic
// lung disease +2. Predicts complications needing ICU care in NSTEMI.
const ACTION_NOTE = 'ACTION ICU score (Fanaroff AC, et al, J Am Heart Assoc 2018;7(11):e008894): Age >= 70 +1; heart rate 85-100 +1 / >= 100 +3; systolic BP 125-145 +1 / < 125 +3; creatinine >= 1.1 mg/dL +1; initial troponin/ULN >= 12 +2; signs/symptoms of heart failure +5; ST-segment depression +1; no prior revascularization +1; chronic lung disease +2. Predicts complications needing critical care in initially stable NSTEMI. A risk score, not a triage order.';
export function actionIcu(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hr = pos(o.heartRate, 400);
  const sbp = pos(o.sbp, 400);
  if (hr === null || sbp === null) {
    return { valid: false, message: 'Enter heart rate (bpm) and systolic BP (mmHg), and mark the remaining findings.' };
  }
  let s = 0; const p = [];
  if (bool(o.ageOver70)) { s += 1; p.push('age >= 70'); }
  const hrPts = hr >= 100 ? 3 : hr >= 85 ? 1 : 0;
  s += hrPts; if (hrPts) p.push(`HR ${Math.round(hr)} (+${hrPts})`);
  const sbpPts = sbp < 125 ? 3 : sbp <= 145 ? 1 : 0;
  s += sbpPts; if (sbpPts) p.push(`SBP ${Math.round(sbp)} (+${sbpPts})`);
  if (bool(o.creatHigh)) { s += 1; p.push('creatinine >= 1.1'); }
  if (bool(o.tropHigh)) { s += 2; p.push('troponin/ULN >= 12 (+2)'); }
  if (bool(o.heartFailure)) { s += 5; p.push('heart failure (+5)'); }
  if (bool(o.stDepression)) { s += 1; p.push('ST depression'); }
  if (bool(o.noPriorRevasc)) { s += 1; p.push('no prior revascularization'); }
  if (bool(o.lungDisease)) { s += 2; p.push('chronic lung disease (+2)'); }
  const tier = s >= 12 ? 'high complication risk' : s >= 5 ? 'intermediate complication risk' : 'lower complication risk';
  return result('ACTION ICU', s, 20, tier, s >= 5, p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', ACTION_NOTE);
}
