// spec-v221: pulmonary & critical-care risk scores — a simplified PE-probability
// score, two community-acquired-pneumonia severity scores, an ECMO survival
// score, an ILD mortality index, an IPF mortality score, and a pneumothorax-size
// formula. Every id was verified absent by a direct scan of app.js first (spec-v85
// §6.2). None duplicates a live tile; v221 runs no AI and makes no runtime network
// call. These stratify / estimate — they are NOT an anticoagulation, ECMO,
// admission, or drainage order (spec-v11 §5.3).
//
//   simplifiedGeneva - Simplified Revised Geneva Score (PE probability)
//   scap        - SCAP / Espana severe community-acquired pneumonia score
//   corb        - CORB severe-pneumonia score
//   resp        - RESP score (ECMO survival)
//   ildGap      - ILD-GAP index
//   duBoisIpf   - du Bois IPF 1-year mortality score
//   pneumothoraxVolume - Collins pneumothorax size (%)
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function selI(v, hi) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < -50 || n > hi) return 0;
  return Math.round(n);
}
function pos(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- Simplified Revised Geneva -----------------------------------------------
// Klok FA, et al, Arch Intern Med 2008;168(19):2131-2136 + Robert-Ebadi H, et al,
// J Thromb Haemost 2022: one point each for age > 65, previous DVT/PE, surgery or
// fracture <= 1 month, active malignancy, unilateral lower-limb pain, hemoptysis,
// pain on deep venous palpation + unilateral edema; heart rate 75-94 +1 / >= 95
// +2 (0-8). Two-level: unlikely 0-2, likely >= 3.
const SGENEVA_NOTE = 'Simplified Revised Geneva Score (Klok FA, et al, Arch Intern Med 2008;168(19):2131-2136): one point each for age > 65, previous DVT/PE, surgery/fracture <= 1 month, active malignancy, unilateral limb pain, hemoptysis, and pain on deep venous palpation with unilateral edema; heart rate 75-94 +1 / >= 95 +2 (0-8). Two-level: PE unlikely 0-2, likely >= 3. A clinical-probability score, not an imaging or anticoagulation order.';
export function simplifiedGeneva(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hr = pos(o.heartRate, 400);
  if (hr === null) {
    return { valid: false, message: 'Enter heart rate (bpm) and mark the clinical items.' };
  }
  let s = 0; const p = [];
  const add = (c, l) => { if (bool(o[c])) { s += 1; p.push(l); } };
  add('ageOver65', 'age > 65'); add('priorVte', 'previous DVT/PE'); add('surgeryFracture', 'surgery/fracture <= 1 mo');
  add('malignancy', 'active malignancy'); add('limbPain', 'unilateral limb pain'); add('hemoptysis', 'hemoptysis');
  add('palpationEdema', 'palpation pain + edema');
  const hrPts = hr >= 95 ? 2 : hr >= 75 ? 1 : 0; s += hrPts; if (hrPts) p.push(`HR ${Math.round(hr)} (+${hrPts})`);
  const score = Math.round(num('Geneva', s, { min: 0, max: 8 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `Geneva ${score}`, band: `Simplified Revised Geneva ${score} — ${abnormal ? 'PE likely (>= 3)' : 'PE unlikely (0-2)'}.`, detail: p.length ? `Factors: ${p.join('; ')}.` : 'No factors.', note: SGENEVA_NOTE };
}

// --- SCAP / Espana -----------------------------------------------------------
// Espana PP, et al, Am J Respir Crit Care Med 2006;174(11):1249-1256: major
// criteria arterial pH < 7.30 (13) and systolic BP < 90 (11); minor criteria
// respiratory rate > 30 (9), PaO2 < 54 or PaO2/FiO2 < 250 (6), BUN > 30 mg/dL
// (5), altered mental status (5), age >= 80 (5), multilobar/bilateral infiltrate
// (5). A total >= 10 marks high risk of severe CAP.
const SCAP_NOTE = 'SCAP (Espana PP, et al, Am J Respir Crit Care Med 2006;174(11):1249-1256): major criteria arterial pH < 7.30 (13) and systolic BP < 90 (11); minor criteria RR > 30 (9), PaO2 < 54 or P/F < 250 (6), BUN > 30 mg/dL (5), altered mental status (5), age >= 80 (5), multilobar/bilateral infiltrate (5). A total >= 10 (any major or >= 2 minor) marks high risk of severe community-acquired pneumonia. A severity score, not an admission order.';
export function scap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const add = (c, pts, l) => { if (bool(o[c])) { s += pts; p.push(`${l} (+${pts})`); } };
  add('phLow', 13, 'pH < 7.30'); add('sbpLow', 11, 'SBP < 90');
  add('rrHigh', 9, 'RR > 30'); add('hypoxemia', 6, 'PaO2 < 54 or P/F < 250');
  add('bunHigh', 5, 'BUN > 30'); add('ams', 5, 'altered mental status');
  add('ageOld', 5, 'age >= 80'); add('multilobar', 5, 'multilobar/bilateral');
  const score = Math.round(num('SCAP', s, { min: 0, max: 59 }));
  const abnormal = score >= 10;
  return { valid: true, score, abnormal, bandLabel: `SCAP ${score}`, band: `SCAP score ${score} — ${abnormal ? 'high risk of severe CAP (>= 10)' : 'lower risk (0-9)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No criteria.', note: SCAP_NOTE };
}

// --- CORB --------------------------------------------------------------------
// Buising KL, et al, Emerg Med Australas 2007: one point each for acute
// Confusion, Oxygen saturation <= 90%, Respiratory rate >= 30, and Blood
// pressure (systolic < 90 or diastolic <= 60) (0-4). Two or more flags severe CAP.
const CORB_NOTE = 'CORB score (Buising KL, et al, Emerg Med Australas 2007): one point each for acute Confusion, Oxygen saturation <= 90%, Respiratory rate >= 30, and low Blood pressure (systolic < 90 or diastolic <= 60) (0-4). Two or more criteria flag severe community-acquired pneumonia. A severity score, not an admission order.';
export function corb(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0; const p = [];
  const add = (c, l) => { if (bool(o[c])) { s += 1; p.push(l); } };
  add('confusion', 'confusion'); add('oxygen', 'SpO2 <= 90%'); add('respRate', 'RR >= 30'); add('bp', 'SBP < 90 or DBP <= 60');
  const score = Math.round(num('CORB', s, { min: 0, max: 4 }));
  const abnormal = score >= 2;
  return { valid: true, score, abnormal, bandLabel: `CORB ${score}`, band: `CORB score ${score} — ${abnormal ? 'severe CAP flagged (>= 2)' : 'lower severity (0-1)'}.`, detail: p.length ? `Positive: ${p.join('; ')}.` : 'No criteria.', note: CORB_NOTE };
}

// --- RESP score --------------------------------------------------------------
// Schmidt M, et al, Am J Respir Crit Care Med 2014;189(11):1374-1382: age band
// (18-49 0, 50-59 -2, >= 60 -3); immunocompromised -2; mechanical ventilation
// before ECMO (< 48 h +3, 48 h-7 d +1, > 7 d 0); diagnosis (viral 3, bacterial 3,
// asthma 11, trauma/burn 3, aspiration 5, other acute resp 1, non-resp 0); CNS
// dysfunction -7; non-pulmonary infection -3; neuromuscular blockade +1; nitric
// oxide -1; bicarbonate infusion -2; cardiac arrest -2; PaCO2 >= 75 -1; PIP >= 42
// -1. Class I >= 6 (92%), II 3-5 (76%), III -1 to 2 (57%), IV -5 to -2 (33%), V
// <= -6 (18%).
const RESP_NOTE = 'RESP score (Schmidt M, et al, Am J Respir Crit Care Med 2014;189(11):1374-1382): predicts survival for respiratory ECMO from age, immunocompromise, pre-ECMO ventilation duration, diagnosis, and a set of acute modifiers. Class I >= 6 (survival ~92%), II 3-5 (~76%), III -1 to 2 (~57%), IV -5 to -2 (~33%), V <= -6 (~18%). A survival estimate, not an ECMO order.';
export function resp(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  s += selI(o.ageBand, 0); // pass -3/-2/0
  s += selI(o.mvBand, 3); // 0/1/3
  s += selI(o.diagnosis, 11); // 0/1/3/5/11
  if (bool(o.immunocompromised)) s -= 2;
  if (bool(o.cns)) s -= 7;
  if (bool(o.nonPulmInfection)) s -= 3;
  if (bool(o.nmb)) s += 1;
  if (bool(o.nitricOxide)) s -= 1;
  if (bool(o.bicarbonate)) s -= 2;
  if (bool(o.cardiacArrest)) s -= 2;
  if (bool(o.paco2High)) s -= 1;
  if (bool(o.pipHigh)) s -= 1;
  const score = Math.round(num('RESP', s, { min: -22, max: 15 }));
  let cls; let surv; let abnormal = true;
  if (score >= 6) { cls = 'I'; surv = '~92%'; abnormal = false; }
  else if (score >= 3) { cls = 'II'; surv = '~76%'; abnormal = false; }
  else if (score >= -1) { cls = 'III'; surv = '~57%'; }
  else if (score >= -5) { cls = 'IV'; surv = '~33%'; }
  else { cls = 'V'; surv = '~18%'; }
  return { valid: true, score, riskClass: cls, abnormal, bandLabel: `RESP ${score} (class ${cls})`, band: `RESP score ${score} — class ${cls}, predicted survival ${surv}.`, detail: `class ${cls}.`, note: RESP_NOTE };
}

// --- ILD-GAP -----------------------------------------------------------------
// Ryerson CJ, et al, Chest 2014;145(4):723-728: ILD subtype (IPF/unclassifiable
// 0, CTD-ILD/idiopathic NSIP/chronic HP -2); sex (female 0, male +1); age (<= 60
// 0, 61-65 +1, > 65 +2); FVC %pred (> 75 0, 50-75 +1, < 50 +2); DLCO %pred (> 55
// 0, 36-55 +1, <= 35 +2, cannot perform +3). Stage I <= 1, II 2-3, III 4-5, IV > 5.
const ILDGAP_NOTE = 'ILD-GAP index (Ryerson CJ, et al, Chest 2014;145(4):723-728): ILD subtype (IPF/unclassifiable 0, CTD-ILD/NSIP/chronic HP -2) + sex (male +1) + age (<= 60 0, 61-65 +1, > 65 +2) + FVC %predicted (> 75 0, 50-75 +1, < 50 +2) + DLCO %predicted (> 55 0, 36-55 +1, <= 35 +2, cannot perform +3). Stage I <= 1, II 2-3, III 4-5, IV > 5 for interstitial-lung-disease mortality. A prognostic index, not a treatment order.';
export function ildGap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fvc = pos(o.fvc, 200);
  if (fvc === null) {
    return { valid: false, message: 'Enter FVC %predicted, select ILD subtype / age band / DLCO band, and mark male sex.' };
  }
  let s = 0;
  s += selI(o.subtype, 0); // 0 or -2
  if (bool(o.male)) s += 1;
  s += selI(o.ageBand, 2); // 0/1/2
  const fvcPts = fvc < 50 ? 2 : fvc <= 75 ? 1 : 0; s += fvcPts;
  s += selI(o.dlcoBand, 3); // 0/1/2/3
  const score = Math.round(num('ILD-GAP', s, { min: -2, max: 8 }));
  let stage; let abnormal = true;
  if (score > 5) stage = 'IV';
  else if (score >= 4) stage = 'III';
  else if (score >= 2) stage = 'II';
  else { stage = 'I'; abnormal = false; }
  return { valid: true, score, stage, abnormal, bandLabel: `ILD-GAP stage ${stage}`, band: `ILD-GAP score ${score} — stage ${stage} (higher stages predict higher mortality).`, detail: `FVC band +${fvcPts}; total ${score}.`, note: ILDGAP_NOTE };
}

// --- du Bois IPF mortality ---------------------------------------------------
// du Bois RM, et al, Am J Respir Crit Care Med 2011;184(4):459-466: age (< 60 0,
// 60-69 +4, >= 70 +8); respiratory hospitalization in prior 6 months +14;
// baseline FVC %pred (>= 80 0, 66-79 +8, 51-65 +13, <= 50 +18); 24-week change in
// FVC %pred (>= -4.9 0, -5 to -9.9 +10, <= -10 +21) (0-61). Higher scores predict
// higher 1-year mortality.
const DUBOIS_NOTE = 'du Bois IPF 1-year mortality score (du Bois RM, et al, Am J Respir Crit Care Med 2011;184(4):459-466): age (< 60 0, 60-69 +4, >= 70 +8) + respiratory hospitalization in prior 6 months +14 + baseline FVC %predicted (>= 80 0, 66-79 +8, 51-65 +13, <= 50 +18) + 24-week change in FVC %predicted (>= -4.9 0, -5 to -9.9 +10, <= -10 +21) (0-61). Higher scores predict higher 1-year mortality in idiopathic pulmonary fibrosis. A prognostic score, not a treatment order.';
export function duBoisIpf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 130);
  const fvc = pos(o.fvc, 200);
  const dfvc = o.deltaFvc; // signed
  if (age === null || fvc === null || dfvc === null || dfvc === undefined || dfvc === '' || !Number.isFinite(Number(dfvc))) {
    return { valid: false, message: 'Enter age (years), baseline FVC %predicted, and 24-week change in FVC %predicted, and mark a respiratory hospitalization.' };
  }
  const d = Number(dfvc);
  let s = 0;
  s += age >= 70 ? 8 : age >= 60 ? 4 : 0;
  if (bool(o.hospitalization)) s += 14;
  s += fvc <= 50 ? 18 : fvc <= 65 ? 13 : fvc <= 79 ? 8 : 0;
  s += d <= -10 ? 21 : d <= -5 ? 10 : 0;
  const score = Math.round(num('du Bois', s, { min: 0, max: 61 }));
  let tier; let abnormal = true;
  if (score >= 30) tier = 'high 1-year mortality risk';
  else if (score >= 17) tier = 'intermediate 1-year mortality risk';
  else { tier = 'lower 1-year mortality risk'; abnormal = score >= 9; }
  return { valid: true, score, abnormal, bandLabel: `du Bois ${score}`, band: `du Bois IPF score ${score} — ${tier}.`, detail: `age, hospitalization, FVC, and 24-week FVC change summed = ${score}.`, note: DUBOIS_NOTE };
}

// --- Pneumothorax size (Collins) ---------------------------------------------
// Collins CD, et al, AJR Am J Roentgenol 1995;165(5):1127-1130: percent
// pneumothorax = 4.2 + 4.7 x (A + B + C), where A, B, C are the interpleural
// distances (cm) at the apex, mid-upper, and mid-lower lung on an upright chest
// radiograph.
const PTX_NOTE = 'Pneumothorax size (Collins CD, et al, AJR 1995;165(5):1127-1130): percent pneumothorax = 4.2 + 4.7 x (A + B + C), where A, B, C are the interpleural distances (cm) at the apex, mid-upper, and mid-lower lung on an upright chest radiograph. An estimate, not a chest-tube order.';
export function pneumothoraxVolume(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const a = pos(o.apex, 30);
  const b = pos(o.midUpper, 30);
  const c = pos(o.midLower, 30);
  if (a === null || b === null || c === null) {
    return { valid: false, message: 'Enter the interpleural distances (cm) at the apex, mid-upper, and mid-lower lung.' };
  }
  const pct = r1(num('PTX', Math.min(100, 4.2 + 4.7 * (a + b + c)), { min: 0, max: 100 }));
  return { valid: true, percent: pct, abnormal: pct >= 20, bandLabel: `PTX ${pct}%`, band: `Estimated pneumothorax size ${pct}% of the hemithorax.`, detail: `4.2 + 4.7 x (${r1(a)} + ${r1(b)} + ${r1(c)}) = ${pct}%.`, note: PTX_NOTE };
}
