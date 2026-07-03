// spec-v217: stroke & neuro-vascular risk scores — a TIA short-term-stroke score,
// two ischemic-stroke outcome scores, a stroke-mortality score, a thrombolysis
// hemorrhage-risk score, and two aneurysmal-SAH grading scales. Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v217 runs no AI and makes no runtime network call.
// These stratify / grade — they are NOT a thrombolysis, admission, or surgical
// order (spec-v11 §5.3).
//
//   canadianTia - Canadian TIA Score (7-day stroke)
//   astral      - ASTRAL score (90-day unfavorable outcome)
//   soar        - SOAR score (stroke mortality)
//   plan        - PLAN score (30-day mortality / severe disability)
//   sitsSich    - SITS-SICH score (symptomatic ICH after alteplase)
//   vasograde   - VASOGRADE (delayed cerebral ischemia after aSAH)
//   ogilvyCarter - Ogilvy-Carter aneurysm grading
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function sel(v, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- Canadian TIA Score ------------------------------------------------------
// Perry JJ, et al, Stroke 2014;45:92-100 + Perry JJ, et al, BMJ 2021;372:n49:
// first TIA in lifetime +2; symptoms >= 10 min +2; carotid stenosis history +2;
// already on antiplatelet +3; gait disturbance history +1; unilateral weakness
// history +1; vertigo history -3; diastolic BP >= 110 +3; dysarthria/aphasia +1;
// AF on ECG +2; infarction on CT +1; platelets >= 400 +2; glucose >= 15 mmol/L
// +3 (-3 to 23). Low <= 3 (<= 0.5%), medium 4-8 (~2.3%), high >= 9 (~5.9%).
const CTIA_NOTE = 'Canadian TIA Score (Perry JJ, et al, Stroke 2014;45:92-100): 13 clinical and investigation variables (range -3 to 23). Low risk <= 3 (7-day stroke <= 0.5%), medium 4-8 (~2.3%), high >= 9 (~5.9%). A risk-stratification score, not an admission or antiplatelet order.';
export function canadianTia(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const add = (cond, pts, label) => { if (bool(cond)) { s += pts; p.push(`${label} (${pts > 0 ? '+' : ''}${pts})`); } };
  add(o.firstTia, 2, 'first TIA in lifetime');
  add(o.duration10, 2, 'symptoms >= 10 min');
  add(o.carotid, 2, 'carotid stenosis history');
  add(o.antiplatelet, 3, 'already on antiplatelet');
  add(o.gait, 1, 'gait disturbance');
  add(o.weakness, 1, 'unilateral weakness');
  add(o.vertigo, -3, 'vertigo history');
  add(o.dbp110, 3, 'diastolic BP >= 110');
  add(o.dysarthria, 1, 'dysarthria/aphasia');
  add(o.afEcg, 2, 'AF on ECG');
  add(o.infarctCt, 1, 'infarction on CT');
  add(o.plt400, 2, 'platelets >= 400');
  add(o.glucose15, 3, 'glucose >= 15 mmol/L');
  const score = Math.round(num('Canadian TIA', s, { min: -3, max: 23 }));
  let tier; let abnormal = true;
  if (score >= 9) tier = 'high 7-day stroke risk (>= 9, ~5.9%)';
  else if (score >= 4) tier = 'medium risk (4-8, ~2.3%)';
  else { tier = 'low risk (<= 3, <= 0.5%)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `Canadian TIA ${score}`, band: `Canadian TIA Score ${score} — ${tier}.`, detail: p.length ? `Factors: ${p.join('; ')}.` : 'No factors.', note: CTIA_NOTE };
}

// --- ASTRAL score ------------------------------------------------------------
// Ntaios G, et al, Neurology 2012;78:1916-1922 + Cooray C, et al, Stroke
// 2016;47:1493-1499: 1 point per 5 years of age; 1 point per NIHSS point;
// onset-to-admission > 3 h (or unknown) +2; any new visual-field defect +2;
// admission glucose > 7.3 or < 3.7 mmol/L +1; impaired consciousness +3.
// Higher scores predict a higher probability of 90-day unfavorable outcome.
const ASTRAL_NOTE = 'ASTRAL score (Ntaios G, et al, Neurology 2012;78:1916-1922): 1 point per 5 years of age + 1 point per NIHSS point + onset > 3 h (or unknown) +2 + new visual-field defect +2 + admission glucose > 7.3 or < 3.7 mmol/L +1 + impaired consciousness +3. A rising score predicts a higher probability of 90-day unfavorable outcome (mRS > 2). A prognostic score, not a treatment order.';
export function astral(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const nihss = pos(o.nihss, 42);
  if (age === null || nihss === null) {
    return { valid: false, message: 'Enter age (years) and admission NIHSS (0-42), and mark the remaining findings.' };
  }
  let s = Math.round(age / 5) + Math.round(nihss);
  const p = [`age ${Math.round(age)} (+${Math.round(age / 5)})`, `NIHSS ${Math.round(nihss)} (+${Math.round(nihss)})`];
  if (bool(o.onsetOver3h)) { s += 2; p.push('onset > 3 h (+2)'); }
  if (bool(o.visualDefect)) { s += 2; p.push('visual-field defect (+2)'); }
  if (bool(o.glucoseAbnormal)) { s += 1; p.push('glucose out of range (+1)'); }
  if (bool(o.impairedConsciousness)) { s += 3; p.push('impaired consciousness (+3)'); }
  const score = Math.round(num('ASTRAL', s, { min: 0, max: 200 }));
  return { valid: true, score, abnormal: score >= 20, bandLabel: `ASTRAL ${score}`, band: `ASTRAL score ${score} — higher scores predict a higher 90-day unfavorable-outcome probability.`, detail: `Factors: ${p.join('; ')}.`, note: ASTRAL_NOTE };
}

// --- SOAR score --------------------------------------------------------------
// Myint PK, et al, Int J Stroke 2014;9:278-283 + Abdul-Rahim AH, et al, Stroke
// 2013;44:3565-3567: Stroke subtype (ischemic 0, hemorrhagic 1); OCSP (PACS/LACS
// 0, POCS 1, TACS 2); Age (<= 65 0, 66-85 1, >= 85 2); prestroke mRS (0-2 0, 3-4
// 1, 5 2) (0-7). Higher scores predict higher early mortality.
const SOAR_NOTE = 'SOAR score (Myint PK, et al, Int J Stroke 2014;9:278-283): Stroke subtype (ischemic 0, hemorrhagic 1) + OCSP class (PACS/LACS 0, POCS 1, TACS 2) + Age (<= 65 0, 66-85 1, >= 85 2) + prestroke Rankin (0-2 0, 3-4 1, 5 2) (0-7). Higher scores predict higher in-hospital and early mortality. A prognostic score, not a treatment order.';
export function soar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const subtype = sel(o.subtype, 1);
  const ocsp = sel(o.ocsp, 2);
  const age = sel(o.ageBand, 2);
  const rankin = sel(o.rankin, 2);
  const score = Math.round(num('SOAR', subtype + ocsp + age + rankin, { min: 0, max: 7 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `SOAR ${score}`, band: `SOAR score ${score} — ${abnormal ? 'elevated early-mortality risk (>= 3)' : 'lower early-mortality risk (0-2)'}.`, detail: `subtype ${subtype} + OCSP ${ocsp} + age ${age} + Rankin ${rankin} = ${score}.`, note: SOAR_NOTE };
}

// --- PLAN score --------------------------------------------------------------
// O'Donnell MJ, et al, Arch Intern Med 2012;172:1548-1556: Preadmission
// comorbidities (dependence 1.5, cancer 1.5, CHF 1, AF 1); reduced level of
// consciousness 5; Age 1 per decade; Neurologic deficit (arm weakness 2, leg
// weakness 2, aphasia/neglect 1) (0-25, half-points allowed).
const PLAN_NOTE = 'PLAN score (O’Donnell MJ, et al, Arch Intern Med 2012;172:1548-1556): Preadmission comorbidities (dependence 1.5, cancer 1.5, CHF 1, AF 1) + reduced Level of consciousness 5 + Age 1 per decade + Neurologic deficit (arm weakness 2, leg weakness 2, aphasia/neglect 1). Higher scores predict higher 30-day mortality and death/severe disability. A prognostic score, not a treatment order.';
export function plan(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  if (age === null) {
    return { valid: false, message: 'Enter age (years) and mark the comorbidities, level of consciousness, and neurologic deficits.' };
  }
  let s = 0; const p = [];
  const add = (cond, pts, label) => { if (bool(cond)) { s += pts; p.push(`${label} (+${pts})`); } };
  add(o.dependence, 1.5, 'preadmission dependence');
  add(o.cancer, 1.5, 'cancer');
  add(o.chf, 1, 'CHF');
  add(o.af, 1, 'atrial fibrillation');
  add(o.reducedLoc, 5, 'reduced consciousness');
  const agePts = Math.floor(age / 10); s += agePts; p.push(`age ${Math.round(age)} (+${agePts})`);
  add(o.armWeakness, 2, 'arm weakness');
  add(o.legWeakness, 2, 'leg weakness');
  add(o.aphasiaNeglect, 1, 'aphasia/neglect');
  const score = r1(num('PLAN', s, { min: 0, max: 25 }));
  const abnormal = score >= 15;
  return { valid: true, score, abnormal, bandLabel: `PLAN ${score}`, band: `PLAN score ${score} — ${abnormal ? 'high 30-day mortality / severe-disability risk (>= 15)' : 'lower risk (< 15)'}.`, detail: `Factors: ${p.join('; ')}.`, note: PLAN_NOTE };
}

// --- SITS-SICH ---------------------------------------------------------------
// Mazya M, et al, Stroke 2012;43:1524-1531: antiplatelet (aspirin + clopidogrel
// 2, aspirin alone 1); NIHSS (7-12 1, >= 13 2); blood glucose >= 180 mg/dL 2;
// systolic BP >= 146 mmHg 1; weight >= 95 kg 1; age >= 72 y 1; onset-to-treatment
// >= 180 min 1; history of hypertension 1 (0-15).
const SITS_NOTE = 'SITS-SICH risk score (Mazya M, et al, Stroke 2012;43:1524-1531): antiplatelet (aspirin+clopidogrel 2, aspirin alone 1) + NIHSS (7-12 1, >= 13 2) + glucose >= 180 mg/dL 2 + systolic BP >= 146 1 + weight >= 95 kg 1 + age >= 72 y 1 + onset-to-treatment >= 180 min 1 + hypertension history 1 (0-15). Predicts symptomatic intracranial hemorrhage after IV alteplase. A risk score, not a thrombolysis order.';
export function sitsSich(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const nihss = pos(o.nihss, 42);
  const glucose = pos(o.glucose, 2000);
  const sbp = pos(o.sbp, 400);
  const weight = pos(o.weight, 700);
  const age = pos(o.age, 130);
  if (nihss === null || glucose === null || sbp === null || weight === null || age === null) {
    return { valid: false, message: 'Enter NIHSS, glucose (mg/dL), systolic BP, weight (kg), and age, and mark antiplatelet use / onset >= 180 min / hypertension.' };
  }
  let s = 0; const p = [];
  const ap = sel(o.antiplatelet, 2); s += ap; if (ap) p.push(`antiplatelet (+${ap})`);
  const nPts = nihss >= 13 ? 2 : nihss >= 7 ? 1 : 0; s += nPts; if (nPts) p.push(`NIHSS ${Math.round(nihss)} (+${nPts})`);
  if (glucose >= 180) { s += 2; p.push('glucose >= 180 (+2)'); }
  if (sbp >= 146) { s += 1; p.push('SBP >= 146'); }
  if (weight >= 95) { s += 1; p.push('weight >= 95 kg'); }
  if (age >= 72) { s += 1; p.push('age >= 72'); }
  if (bool(o.onset180)) { s += 1; p.push('onset >= 180 min'); }
  if (bool(o.hypertension)) { s += 1; p.push('hypertension history'); }
  const score = Math.round(num('SITS-SICH', s, { min: 0, max: 15 }));
  let tier; let abnormal = true;
  if (score >= 9) tier = 'high symptomatic-ICH risk (>= 9, ~23%)';
  else if (score >= 6) tier = 'intermediate risk (6-8, ~9%)';
  else if (score >= 3) tier = 'low-moderate risk (3-5, ~5%)';
  else { tier = 'low risk (0-2)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `SITS-SICH ${score}`, band: `SITS-SICH score ${score} — ${tier}.`, detail: p.length ? `Factors: ${p.join('; ')}.` : 'No factors.', note: SITS_NOTE };
}

// --- VASOGRADE ---------------------------------------------------------------
// de Oliveira Manoel AL, et al, Stroke 2015;46(7):1826-1831 + Fang F, et al,
// BioMed Res Int 2020: Green = modified Fisher 1-2 AND WFNS 1-2; Yellow =
// modified Fisher 3-4 AND WFNS 1-3; Red = WFNS 4-5 (any modified Fisher).
const VASO_NOTE = 'VASOGRADE (de Oliveira Manoel AL, et al, Stroke 2015;46(7):1826-1831): combines the modified Fisher scale and the WFNS grade after aneurysmal subarachnoid hemorrhage. Green = modified Fisher 1-2 AND WFNS 1-2 (lowest delayed-cerebral-ischemia risk); Yellow = modified Fisher 3-4 AND WFNS 1-3; Red = WFNS 4-5 (highest, ~3-fold DCI risk). A risk grade, not a treatment order.';
export function vasograde(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const mf = pos(o.modifiedFisher, 4);
  const wfns = pos(o.wfns, 5);
  if (mf === null || wfns === null || mf < 1 || wfns < 1) {
    return { valid: false, message: 'Select the modified Fisher scale (1-4) and the WFNS grade (1-5).' };
  }
  const mfR = Math.round(mf); const wfnsR = Math.round(wfns);
  let grade; let abnormal = true;
  if (wfnsR >= 4) grade = 'Red';
  else if (mfR >= 3) grade = 'Yellow';
  else if (mfR <= 2 && wfnsR <= 2) { grade = 'Green'; abnormal = false; }
  else grade = 'Yellow';
  const desc = grade === 'Red' ? 'highest delayed-cerebral-ischemia risk' : grade === 'Yellow' ? 'intermediate DCI risk' : 'lowest DCI risk';
  return { valid: true, grade, abnormal, bandLabel: `VASOGRADE ${grade}`, band: `VASOGRADE ${grade} — ${desc}.`, detail: `modified Fisher ${mfR}, WFNS ${wfnsR}.`, note: VASO_NOTE };
}

// --- Ogilvy-Carter grading ---------------------------------------------------
// Ogilvy CS, Carter BS, Neurosurgery 1998;42(5):959-968 + Hoh BL, et al,
// Neurosurgery 2006: one point each for age > 50, Hunt-Hess 4-5, Fisher 3-4,
// aneurysm size > 10 mm, and posterior-circulation giant aneurysm >= 25 mm (0-5).
const OC_NOTE = 'Ogilvy-Carter grading (Ogilvy CS, Carter BS, Neurosurgery 1998;42(5):959-968): one point each for age > 50, Hunt-Hess grade 4-5, Fisher grade 3-4, aneurysm size > 10 mm, and posterior-circulation giant aneurysm >= 25 mm (0-5). Higher grades predict worse post-operative outcome. A grading score, not a surgical order.';
export function ogilvyCarter(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  if (bool(o.ageOver50)) { s += 1; p.push('age > 50'); }
  if (bool(o.huntHess45)) { s += 1; p.push('Hunt-Hess 4-5'); }
  if (bool(o.fisher34)) { s += 1; p.push('Fisher 3-4'); }
  if (bool(o.sizeOver10)) { s += 1; p.push('aneurysm > 10 mm'); }
  if (bool(o.posteriorGiant)) { s += 1; p.push('posterior giant >= 25 mm'); }
  const score = Math.round(num('Ogilvy-Carter', s, { min: 0, max: 5 }));
  return { valid: true, score, abnormal: score >= 3, bandLabel: `Ogilvy-Carter ${score}`, band: `Ogilvy-Carter grade ${score} — higher grades predict worse post-operative outcome.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No factors.', note: OC_NOTE };
}
