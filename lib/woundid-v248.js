// spec-v248: wound-care + infectious-disease scores — the Abbreviated Burn
// Severity Index (ABSI), the SINBAD diabetic-foot-ulcer score, the ATLAS score for
// Clostridioides difficile infection, and the INCREMENT-CPE mortality score. Each
// id was verified absent by a fixed-string scan of the extracted app.js id/name
// lists AND the MCP adapter set first (spec-v85 §6.2). v248 runs no AI and makes no
// runtime network call.
//
// These score / classify risk — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   absi-burn      - Abbreviated Burn Severity Index
//   sinbad-score   - SINBAD diabetic-foot-ulcer score
//   atlas-cdi      - ATLAS score for C. difficile infection
//   increment-cpe  - INCREMENT-CPE mortality score
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1 } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}
function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Abbreviated Burn Severity Index (ABSI) ----------------------------------
// Tobiasen J, et al. J Trauma. 1982: sex (female 1, male 0), age (0-20 = 1, 21-40
// = 2, 41-60 = 3, 61-80 = 4, 81-100 = 5), inhalation injury (+1), full-thickness
// burn (+1), %TBSA (1-10% = 1, 11-20% = 2 ... 91-100% = 10). Threat to life: 2-3
// very low, 4-5 moderate-low, 6-7 moderate, 8-9 serious, 10-11 severe, >= 12
// maximum. Cross-verified: PMC9302604; PubMed 7073049.
const ABSI_NOTE = 'Abbreviated Burn Severity Index (Tobiasen J, et al. J Trauma. 1982): sex (female 1, male 0), age band (0-20=1 ... 81-100=5), inhalation injury (+1), full-thickness burn (+1), %TBSA band (1-10%=1 ... 91-100%=10). Threat to life: 2-3 very low (survival >= 99%), 4-5 moderate-low, 6-7 moderate, 8-9 serious, 10-11 severe, >= 12 maximum. A severity index, not a diagnosis or treatment order.';
function absiAge(a) { if (a <= 20) return 1; if (a <= 40) return 2; if (a <= 60) return 3; if (a <= 80) return 4; return 5; }
function absiTbsa(p) { if (p <= 0) return 0; return Math.min(10, Math.ceil(p / 10)); }
export function absiBurn(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  const age = fin(o.age, 0, 120);
  const tbsa = fin(o.tbsa, 0, 100);
  if (sex === null || age === null || tbsa === null) {
    return { valid: false, message: 'Enter sex, age (years), and %TBSA burned.' };
  }
  const s = (sex === 'female' ? 1 : 0) + absiAge(age) + (bool(o.inhalation) ? 1 : 0) + (bool(o.fullThickness) ? 1 : 0) + absiTbsa(tbsa);
  const score = Math.round(num('ABSI', s, { min: 0, max: 18 }));
  let tier; let abnormal = true;
  if (score >= 12) tier = 'maximum threat to life (>= 12)';
  else if (score >= 10) tier = 'severe threat to life (10-11)';
  else if (score >= 8) tier = 'serious threat to life (8-9)';
  else if (score >= 6) tier = 'moderate threat to life (6-7)';
  else if (score >= 4) { tier = 'moderate-low threat to life (4-5)'; abnormal = false; }
  else { tier = 'very low threat to life (2-3)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `ABSI ${score}`, band: `ABSI ${score} — ${tier}.`, detail: `Age band ${absiAge(age)}, TBSA band ${absiTbsa(tbsa)}.`, note: ABSI_NOTE };
}

// --- SINBAD diabetic-foot-ulcer score ----------------------------------------
// Ince P, et al. Diabetes Care. 2008: Site (fore- 0 / mid-hindfoot 1), Ischemia
// (pulse present 0 / absent 1), Neuropathy (intact 0 / lost 1), Bacterial infection
// (absent 0 / present 1), Area (< 1 cm^2 0 / >= 1 cm^2 1), Depth (skin/subcutaneous
// 0 / deeper 1). Total 0-6; a higher score predicts non-healing / amputation.
// Cross-verified: Diabetes Care 2008; IWGDF.
const SINBAD_ITEMS = ['site', 'ischemia', 'neuropathy', 'infection', 'area', 'depth'];
const SINBAD_NOTE = 'SINBAD diabetic-foot-ulcer score (Ince P, et al. Diabetes Care. 2008): Site (fore- 0 / mid-hindfoot 1), Ischemia (0/1), Neuropathy (0/1), Bacterial infection (0/1), Area (< 1 cm^2 0 / >= 1 cm^2 1), Depth (skin/subcutaneous 0 / deeper 1). Total 0-6; a higher score predicts non-healing / amputation (>= 3 markedly worse). A prognostic score, not a diagnosis or treatment order.';
export function sinbadScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of SINBAD_ITEMS) if (bool(o[k])) s += 1;
  const score = Math.round(num('SINBAD', s, { min: 0, max: 6 }));
  const abnormal = score >= 3;
  return { valid: true, score, abnormal, bandLabel: `SINBAD ${score}`, band: `SINBAD ${score} of 6 — ${abnormal ? 'higher risk of poor outcome (>= 3)' : 'lower risk (< 3)'}.`, detail: 'Site + ischemia + neuropathy + infection + area + depth.', note: SINBAD_NOTE };
}

// --- ATLAS score (C. difficile infection) ------------------------------------
// Miller MA, et al. BMC Infect Dis. 2013: Age (< 60 = 0, 60-79 = 1, >= 80 = 2),
// systemic antibiotics during CDI therapy (no 0 / yes 2), Leukocyte count (< 16 =
// 0, 16-25 = 1, > 25 = 2), Albumin (> 35 g/L = 0, 26-35 = 1, <= 25 = 2), serum
// Creatinine (<= 120 umol/L = 0, 121-179 = 1, >= 180 = 2). Total 0-10; predicted
// cure = 100 - 5.08 x score. Cross-verified: PMC3618004; FPnotebook.
const ATLAS_NOTE = 'ATLAS score (Miller MA, et al. BMC Infect Dis. 2013): Age (< 60 = 0, 60-79 = 1, >= 80 = 2), systemic anTibiotics during CDI therapy (no 0 / yes 2), Leukocyte count (< 16 = 0, 16-25 = 1, > 25 = 2), Albumin (> 35 g/L = 0, 26-35 = 1, <= 25 = 2), Serum creatinine (<= 120 umol/L = 0, 121-179 = 1, >= 180 = 2). Total 0-10; predicted cure = 100 - 5.08 x score. A prognostic score, not a diagnosis or treatment order.';
export function atlasCdi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const s = lvl(o.age, 2) + lvl(o.antibiotics, 2) + lvl(o.leukocyte, 2) + lvl(o.albumin, 2) + lvl(o.creatinine, 2);
  const score = Math.round(num('ATLAS', s, { min: 0, max: 10 }));
  const cure = r1(num('ATLAS cure', 100 - 5.08 * score, { min: 0, max: 100 }));
  const abnormal = score >= 6;
  return { valid: true, score, abnormal, bandLabel: `ATLAS ${score}`, band: `ATLAS ${score} of 10 — predicted CDI cure ~${cure}%.`, detail: 'Age + antibiotics + leukocyte + albumin + creatinine.', note: ATLAS_NOTE };
}

// --- INCREMENT-CPE mortality score -------------------------------------------
// Gutierrez-Gutierrez B, et al. Mayo Clin Proc. 2017: severe sepsis or septic
// shock at presentation (5), Pitt bacteremia score >= 6 (4), Charlson index >= 2
// (3), source of BSI other than urinary or biliary tract (3). Total 0-15; 0-7 low,
// 8-15 high risk of mortality. Cross-verified: PubMed 27712635; PMC7223509.
const INCREMENT_NOTE = 'INCREMENT-CPE mortality score (Gutierrez-Gutierrez B, et al. Mayo Clin Proc. 2017): severe sepsis or septic shock at presentation (5), Pitt bacteremia score >= 6 (4), Charlson comorbidity index >= 2 (3), source of bloodstream infection other than urinary or biliary tract (3). Total 0-15; 0-7 low, 8-15 high risk of 14-day mortality. A prognostic score, not a diagnosis or treatment order.';
export function incrementCpe(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  if (bool(o.shock)) s += 5;
  if (bool(o.pitt)) s += 4;
  if (bool(o.charlson)) s += 3;
  if (bool(o.source)) s += 3;
  const score = Math.round(num('INCREMENT-CPE', s, { min: 0, max: 15 }));
  const abnormal = score >= 8;
  return { valid: true, score, abnormal, bandLabel: `ICS ${score}`, band: `INCREMENT-CPE ${score} of 15 — ${abnormal ? 'high mortality risk (>= 8)' : 'low mortality risk (< 8)'}.`, detail: 'Septic shock 5, Pitt >= 6 →4, Charlson >= 2 →3, non-urinary/biliary source 3.', note: INCREMENT_NOTE };
}
